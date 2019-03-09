var subproviders_0x = require('@0x/subproviders');
var web3Wrapper_0x = require('@0x/web3-wrapper');
var deployed_contract_address_0x = require('@0x/contract-addresses');
var connect_0x = require('@0x/connect');
var all_0x = require('0x.js');

var constants = require('./constants.js');

// Create a Web3 Provider Engine
const providerEngine = new subproviders_0x.Web3ProviderEngine();
// Compose our Providers, order matters
// Use the SignerSubprovider to wrap the browser extension wallet
// All account based and signing requests will go through the SignerSubprovider
providerEngine.addProvider(new subproviders_0x.SignerSubprovider(web3.currentProvider));
// Use an RPC provider to route all other requests
providerEngine.addProvider(new subproviders_0x.RPCSubprovider(constants.GANACHE_RPC_URL));
// Use a Metamask subprovider
//providerEngine.addProvider(new subproviders_0x.MetamaskSubprovider(web3.currentProvider));

providerEngine.start();



(async () => {
    // Get all of the accounts through the Web3Wrapper
    const web3Wrapper = new web3Wrapper_0x.Web3Wrapper(providerEngine);
    const accounts = await web3Wrapper.getAvailableAddressesAsync();
    //console.log(accounts);

    // Instantiate ContractWrappers with the provider---------------------------
    const contractWrappers = new all_0x.ContractWrappers(providerEngine, { networkId: constants.GANACHE_NETWORK_ID});
    //Get Maker address
    const taker = await web3Wrapper.getAvailableAddressesAsync();
    console.log('Taker Address:', taker[0]);

    // Token Addresses----------------------------------------------------------
    const contractAddresses = deployed_contract_address_0x.getContractAddressesForNetworkOrThrow(constants.GANACHE_NETWORK_ID);
    const zrxTokenAddress = contractAddresses.zrxToken;
    const etherTokenAddress = contractAddresses.etherToken;
    const DECIMALS = 18;

    //Create asset data---------------------------------------------------------
    const makerAssetData = all_0x.assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
    const takerAssetData = all_0x.assetDataUtils.encodeERC20AssetData(etherTokenAddress);

    // Set Allowances-----------------------------------------------------------
    // Allow the 0x ERC20 Proxy to move WETH on behalf of takerAccount
    const takerWETHApprovalTxHash = await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
        etherTokenAddress,
        taker[0],
    );
    await web3Wrapper.awaitTransactionSuccessAsync(takerWETHApprovalTxHash);

    //Query orderbook-----------------------------------------------------------
    // Instantiate relayer client pointing to a local server on port 3000
    const relayerApiUrl = constants.RELAYER_API_URL;
    const relayerClient = new connect_0x.HttpClient(relayerApiUrl);
    // Taker queries the Orderbook from the Relayer
    const orderbookRequest = { baseAssetData: makerAssetData, quoteAssetData: takerAssetData };
    const response = await relayerClient.getOrderbookAsync(orderbookRequest, { networkId: constants.GANACHE_NETWORK_ID });
    if (response.asks.total === 0) {
        throw new Error('No orders found on the SRA Endpoint');
    }
    console.log('Orderbook Response: ', response.asks);

    // Extract Taker Asset Amount (default: first ask order)-----------------------------------------------
    const takerAssetAmount = response.asks.records[0].order.takerAssetAmount;
    console.log('Taker Asset Amount: ', takerAssetAmount);

    // Mint takerAssetAmount equivalent WETH
    // Convert ETH into WETH for taker by depositing ETH into the WETH contract
    const takerWETHDepositTxHash = await contractWrappers.etherToken.depositAsync(
        etherTokenAddress,
        takerAssetAmount,
        taker[0],
    );
    await web3Wrapper.awaitTransactionSuccessAsync(takerWETHDepositTxHash);

    // Capture the top order for refill
    const sraOrder = response.asks.records[0].order;
    // Check if the order is fillable or not
    await contractWrappers.exchange.validateFillOrderThrowIfInvalidAsync(sraOrder, takerAssetAmount, taker[0]);

    // Submit the order to the blockchain
    txHash = await contractWrappers.exchange.fillOrderAsync(sraOrder, takerAssetAmount, taker[0], {
    gasLimit: constants.TX_DEFAULTS.gas,
    });
    await web3Wrapper.awaitTransactionSuccessAsync(txHash);
    console.log('Final Tx hash: ', txHash);

})();
