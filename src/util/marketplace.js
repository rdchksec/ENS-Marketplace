const subprovider = require('@0x/subproviders')
const Web3Wrapper = require('@0x/web3-wrapper')
const contract_addresses = require('@0x/contract-addresses')
const connect = require('@0x/connect')
const zerox = require('0x.js')
import ENSNFT from '../../build/contracts/ENSNFT'
import { solidityKeccak256, keccak256 } from 'ethers/utils'
import namehash from 'eth-ens-namehash'

import constants from './constants'


const startProvider = () => {
    const engine = new subprovider.Web3ProviderEngine()
    engine.addProvider(new subprovider.MetamaskSubprovider(window.ethereum))
    engine.addProvider(new subprovider.RPCSubprovider('https://rinkeby.infura.io'))
    engine.start()
    return engine
}

//token id = domain node 
export const makeOffer = async (domain, price) => {
    domain = domain.split('.').reverse()
    domain = domain.map(d => namehash.hash(d))
    domain = solidityKeccak256(['bytes32', 'bytes32'], domain)
    const engine = startProvider()
    const web3Wrapper = new Web3Wrapper.Web3Wrapper(engine) 
    const contractWrappers = new zerox.ContractWrappers(engine, {networkId: 4 });

    const maker = (await web3Wrapper.getAvailableAddressesAsync())[0]
    console.log(maker)
    const contractAddresses = contract_addresses.getContractAddressesForNetworkOrThrow(4)
    const zrxTokenAddress =  contractAddresses.zrxToken 
    const wetherToken = contractAddresses.etherToken 
    const erc721token = ENSNFT.networks[4].address 
    const DECIMALS = 18 

    //Create asset data 
    const makerAssetData = zerox.assetDataUtils.encodeERC721AssetData(erc721token, new zerox.BigNumber(domain))
    const takerAssetData = zerox.assetDataUtils.encodeERC20AssetData(wetherToken)
    const makerAssetAmount = new zerox.BigNumber(1) 
    const takerAssetAmount = new zerox.BigNumber(price)

    console.log(erc721token, maker)
    const makerApprovalTx = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
        erc721token,
        maker,
        true
    )
    await web3Wrapper.awaitTransactionSuccessAsync(makerApprovalTx)

    console.log("Maker approval txHash: ", makerApprovalTx)

    const randomExpiration = constants.getRandomFutureDateInSeconds()
    const exchangeAddress = contractAddresses.exchange 

    const order = {
        exchangeAddress,
        makerAddress: maker,
        takerAddress: constants.NULL_ADDRESS,
        senderAddress: constants.NULL_ADDRESS,
        feeRecipientAddress: constants.NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: zerox.generatePseudoRandomSalt(),
        makerAssetAmount,
        takerAssetAmount,
        makerAssetData,
        takerAssetData,
        makerFee: constants.ZERO,
        takerFee: constants.ZERO
    }

    console.log("order: ", order)

    const orderHashHex = zerox.orderHashUtils.getOrderHashHex(order)
    const signature = await zerox.signatureUtils.ecSignHashAsync(new subprovider.MetamaskSubprovider(window.ethereum), orderHashHex, maker)
    console.log("order signature", signature)
    const signedOrder = {...order, signature}
    console.log("Signedorder", signedOrder)
    await contractWrappers.exchange.validateOrderFillableOrThrowAsync(signedOrder)

    //Post to relayer 
    const relayerApiUrl = constants.RELAYER_API_URL;
    const relayerClient = new connect.HttpClient(relayerApiUrl)

    let orderSubmission = await relayerClient.submitOrderAsync(signedOrder, {networkId: 4})
}

export const takeOffer = async domain => {
    domain = domain.split('.').reverse()
    domain = domain.map(d => namehash.hash(d))
    domain = solidityKeccak256(['bytes32', 'bytes32'], domain)
    const engine = startProvider()
    const web3Wrapper = new Web3Wrapper.Web3Wrapper(engine) 
    const contractWrappers = new zerox.ContractWrappers(engine, {networkId: 4 });

    //take address 
    const taker = (await web3Wrapper.getAvailableAddressesAsync())[0]
    const contractAddresses = contract_addresses.getContractAddressesForNetworkOrThrow(4)
    const zrxTokenAddress =  contractAddresses.zrxToken 
    const wetherToken = contractAddresses.etherToken 
    const erc721token = ENSNFT.networks[4].address 
    const DECIMALS = 18 

    // create asset data 
    const makerAssetData = zerox.assetDataUtils.encodeERC721AssetData(erc721token, new zerox.BigNumber(domain))
    const takerAssetData = zerox.assetDataUtils.encodeERC20AssetData(wetherToken)

    // Approve ERC20 Token  
    const wethApprove = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
        wetherToken,
        taker
    )

    await web3Wrapper.awaitTransactionSuccessAsync(wethApprove)

    //Query orderbook 
    const relayerApiUrl = constants.RELAYER_API_URL 
    const relayerClient = new connect.HttpClient(relayerApiUrl)

    const orderbookRequest = {baseAssetData: makerAssetData, quoteAssetData: takerAssetData }

    const res = await relayerClient.getOrderbookAsync(orderbookRequest, {networkId: 4})

    console.log(res)

    if (res.asks.total === 0 ) {
        throw new Error('No errors on SRA endpoint')
    }

    // extract taker asset amount (default: first ask order) 
    const takerAssetAmount = res.asks.records[0].order.takerAssetAmount

    //mint takerAssetAmount equivalent weth 
    const takerWethDeposit = await contractWrappers.etherToken.depositAsync(
      wetherToken,
      takerAssetAmount,
      taker  
    )

    await web3Wrapper.awaitTransactionSuccessAsync(takerWethDeposit)

    // Capture top order for refill 
    const sraOrder = res.asks.records[0].order 
    //check if order is fillable 
    await contractWrappers.exchange.validateFillOrderThrowIfInvalidAsync(sraOrder, takerAssetAmount, taker)

    //submit order to chain 
    const chaintx = await contractWrappers.exchange.fillOrderAsync(sraOrder, takerAssetAmount, taker)

    await web3Wrapper.awaitTransactionSuccessAsync(chaintx)

    console.log("settlement tx", chaintx)
}

export const orderbook = async (domain) => {
    domain = domain.split('.').reverse()
    domain = domain.map(d => namehash.hash(d))
    domain = solidityKeccak256(['bytes32', 'bytes32'], domain)
    domain = new zerox.BigNumber(domain)

    //asset data 
    const contractAddresses = contract_addresses.getContractAddressesForNetworkOrThrow(4)
    const wetherToken = contractAddresses.etherToken 
    const erc721token = ENSNFT.networks[4].address 

    // create asset data 
    const makerAssetData = zerox.assetDataUtils.encodeERC721AssetData(erc721token, domain)
    const takerAssetData = zerox.assetDataUtils.encodeERC20AssetData(wetherToken)

     //Query orderbook 
     const relayerApiUrl = constants.RELAYER_API_URL 
     const relayerClient = new connect.HttpClient(relayerApiUrl)
 
     const orderbookRequest = {baseAssetData: makerAssetData, quoteAssetData: takerAssetData }
 
     const res = await relayerClient.getOrderbookAsync(orderbookRequest, {networkId: 4})
    console.log(res)
    return res
    }