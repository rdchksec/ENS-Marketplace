var HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // match any network
    },
    ropsten: {
    provider: function() {
      return new HDWalletProvider('concert load couple harbor equip island argue ramp clarify fence smart topic', "https://ropsten.infura.io/");
    },
    network_id: '3',
  }
},
compilers: {
    solc: {
        version: "0.5.5"
    }
}
};
