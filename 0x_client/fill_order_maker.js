var subproviders_0x = require('@0x/subproviders');
var web3Wrapper_0x = require('@0x/web3-wrapper');
var deployed_contract_address_0x = require('@0x/contract-addresses');
var all_0x = require('0x.js');

var constants = require('./constants.js');

// Create a Web3 Provider Engine
const providerEngine = new subproviders_0x.Web3ProviderEngine();
// Compose our Providers, order matters
// Use the SignerSubprovider to wrap the browser extension wallet
// All account based and signing requests will go through the SignerSubprovider
providerEngine.addProvider(new subproviders_0x.SignerSubprovider(web3.currentProvider));
// Use an RPC provider to route all other requests
providerEngine.addProvider(new subproviders_0x.RPCSubprovider('http://localhost:8545'));
// Use a Metamask subprovider
//providerEngine.addProvider(new subproviders_0x.MetamaskSubprovider(web3.currentProvider));

providerEngine.start();



(async () => {
    // Get all of the accounts through the Web3Wrapper
    const web3Wrapper = new web3Wrapper_0x.Web3Wrapper(providerEngine);
    const accounts = await web3Wrapper.getAvailableAddressesAsync();
    //console.log(accounts);

    // Instantiate ContractWrappers with the provider
    const contractWrappers = new all_0x.ContractWrappers(providerEngine, { networkId: 50});
    //Get Maker address
    const maker = await web3Wrapper.getAvailableAddressesAsync();
    console.log('Maker Address:', maker);

    // Token Addresses------------------------------------
    const contractAddresses = deployed_contract_address_0x.getContractAddressesForNetworkOrThrow(50);
    const zrxTokenAddress = contractAddresses.zrxToken;
    const etherTokenAddress = contractAddresses.etherToken;
    const DECIMALS = 18;

    //Create asset data--------------------------------------
    const makerAssetData = all_0x.assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
    const takerAssetData = all_0x.assetDataUtils.encodeERC20AssetData(etherTokenAddress);
    // the amount the maker is selling of maker asset (future: 1 ENSNFT)
    const makerAssetAmount = web3Wrapper_0x.Web3Wrapper.toBaseUnitAmount(new all_0x.BigNumber(1), DECIMALS);
    // the amount the maker wants of taker asset (Future: 10 Dai)
    const takerAssetAmount = web3Wrapper_0x.Web3Wrapper.toBaseUnitAmount(new all_0x.BigNumber(10), DECIMALS);

    //Set Allowances-------------------------------------------
    // Allow the 0x ERC20 Proxy to move ZRX on behalf of makerAccount
    const makerZRXApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
        zrxTokenAddress,
        maker[0],
    );
    await web3Wrapper.awaitTransactionSuccessAsync(makerZRXApprovalTxHash);

    //Create Order--------------------------------------------------------------
    // Set up the Order and fill it
    const randomExpiration = constants.getRandomFutureDateInSeconds();
    const exchangeAddress = contractAddresses.exchange;

    // Create the order
    const order = {
        exchangeAddress,
        makerAddress: maker[0],
        takerAddress: constants.NULL_ADDRESS,
        senderAddress: constants.NULL_ADDRESS,
        feeRecipientAddress: constants.NULL_ADDRESS,
        expirationTimeSeconds: randomExpiration,
        salt: all_0x.generatePseudoRandomSalt(),
        makerAssetAmount,
        takerAssetAmount,
        makerAssetData,
        takerAssetData,
        makerFee: constants.ZERO,
        takerFee: constants.ZERO,
    };
    console.log('Maker Order: ', order);

    //Sign the order------------------------------------------------------------
    // Generate the order hash and sign it
    const orderHashHex = all_0x.orderHashUtils.getOrderHashHex(order);
    console.log('Maker Order Hash: ', orderHashHex);
    const signature = await all_0x.signatureUtils.ecSignHashAsync(providerEngine, orderHashHex, maker[0]);
    const signedOrder = { ...order, signature };
    console.log('signed order:', signedOrder);

})();
