
var all_0x = require('0x.js');

const config = {};
// tslint:disable-next-line:custom-no-magic-numbers
config.ONE_SECOND_MS = 1000;
// tslint:disable-next-line:custom-no-magic-numbers
config.ONE_MINUTE_MS = config.ONE_SECOND_MS * 60;
// tslint:disable-next-line:custom-no-magic-numbers
config.TEN_MINUTES_MS = config.ONE_MINUTE_MS * 10;
// tslint:disable-next-line:custom-no-magic-numbers
config.UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new all_0x.BigNumber(2).pow(256).minus(1);
// tslint:disable-next-line:custom-no-magic-numbers
config.DECIMALS = 18;
config.NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
config.ZERO = new all_0x.BigNumber(0);
config.GANACHE_NETWORK_ID = 50;
config.KOVAN_NETWORK_ID = 42;
config.ROPSTEN_NETWORK_ID = 3;
config.RINKEBY_NETWORK_ID = 4;

config.RELAYER_API_URL = 'http://localhost:3000/v2';

/**
 * Returns an amount of seconds that is greater than the amount of seconds since epoch.
 */
config.getRandomFutureDateInSeconds = () => {
    return new all_0x.BigNumber(Date.now() + config.TEN_MINUTES_MS).div(config.ONE_SECOND_MS).integerValue(all_0x.BigNumber.ROUND_CEIL);
};

module.exports = config;
