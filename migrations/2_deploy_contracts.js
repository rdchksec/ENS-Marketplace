var ENSNFT = artifacts.require('./ENSNFT.sol')
let _ = '        '

const NFTname = 'ENS MarketPlace'
const NFTsymbol = 'ENSMP'
const ropstenRegistrarAddress = '0x112234455C3a32FD11230C42E7Bccd4A84e02010'
const mainnetRegistrarAddress = '0x6090A6e47849629b7245Dfa1Ca21D94cd15878Ef'

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    try {
      // Deploy Metadata.solc
      // await deployer.deploy(Metadata)
      // let metadata = {address:
      //   network === 'mainnet'
      //   ? mainnetMetadataAddress
      //   : ropstenMetadataAddress}

      // Deploy ENSNFT.sol
      let registrarAddress =
        network === 'mainnet'
          ? mainnetRegistrarAddress
          : ropstenRegistrarAddress

      await deployer.deploy(
        ENSNFT,
        NFTname,
        NFTsymbol,
        registrarAddress
      )
    } catch (error) {
      console.log(error)
    }
  })
}
