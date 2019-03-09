const HdwalletProvider = require('truffle-hdwallet-provider')
const mnemonic =
 'wild color card special lunar describe abstract project carpet cover end crew'
const rinkebyRpc =
 'https://rinkeby.infura.io/v3/42a353682886462f9f7b6b602f577a53'

module.exports = {

  networks: {

    ganache: {
      host: '127.0.0.1',
      port: 7545,
      network_id: 5777
    },
    rinkeby: {
      provider: () => new HdwalletProvider(mnemonic, rinkebyRpc),
      network_id: 4,
      skipDryRun: true

    },
    development: {
      provider: _ => new HdwalletProvider('lava kid panther inject erode hero intact siege student ensure install forest', 'http://localhost:8545'),
      gasPrice: '0',
      network_id: '6660001',
      gasLimit: 8000000,
      skipDryRun: true
    }

  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {

    }
  }
}
