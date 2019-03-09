const ENS = artifacts.require("./ENSRegistry.sol");
const FIFSRegistrar = artifacts.require('./FIFSRegistrar.sol');
const PublicResolver = artifacts.require('PublicResolver')
const ReverseRegistrar = artifacts.require('ReverseRegistrar')
const ENSNFT = artifacts.require('ENSNFT')
const solidityKeccak = require('ethers').utils.solidityKeccak256
const keccak = require('ethers').utils.keccak256

// Currently the parameter('./ContractName') is only used to imply
// the compiled contract JSON file name. So even though `Registrar.sol` is
// not existed, it's valid to put it here.
// TODO: align the contract name with the source code file name.
// const Registrar = artifacts.require('./HashRegistrar.sol');
const web3 = new (require('web3'))();
const namehash = require('eth-ens-namehash');
const sha3 = require('web3-utils').sha3
/**
 * Calculate root node hashes given the top level domain(tld)
 *
 * @param {string} tld plain text tld, for example: 'eth'
 */
function getRootNodeFromTLD(tld) {
  return {
    namehash: namehash(tld),
    sha3: web3.sha3(tld)
  };
}

function getNodehash(name) {
  return {
    namehash: namehash(name),
    sha3: web3.sha3(name)
  }
}

function deployFIFS(deployer, tld, accounts) {
  const rootNode  = getRootNodeFromTLD(tld)

  deployer.then( async () => {
    const ens = await deployer.deploy(ENS) 
    const publicResolver = await PublicResolver.new(ens.address);
    
    await ens.setSubnodeOwner("0x0000000000000000000000000000000000000000", sha3("resolver"), accounts[0]);
    await ens.setResolver(namehash("resolver"), publicResolver.address);
    await publicResolver.setAddr(namehash("resolver"), publicResolver.address);

    const fifs = await deployer.deploy(FIFSRegistrar, ens.address, namehash("test")) 

    await ens.setSubnodeOwner("0x0000000000000000000000000000000000000000", sha3("test"), accounts[0])
    await ens.setTTL(namehash("test"), 25000000000)
    await ens.setSubnodeOwner("0x0000000000000000000000000000000000000000", sha3("test"), fifs.address)

    console.log(await ens.owner(namehash("test")), fifs.address)
    
    const reverseRegistrar = await ReverseRegistrar.new(ens.address, publicResolver.address);
    await ens.setSubnodeOwner("0x0000000000000000000000000000000000000000", sha3("reverse"), accounts[0]);
    await ens.setSubnodeOwner(namehash("reverse"), sha3("addr"), reverseRegistrar.address);
      
    await fifs.register(namehash("myname"),  accounts[0])

    await ens.setResolver(solidityKeccak(['bytes32', 'bytes32'], [namehash("test"), namehash("myname")]), publicResolver.address)
    console.log(await ens.resolver(solidityKeccak(['bytes32', 'bytes32'], [namehash("test"), namehash("myname")])))

    console.log("AM I OWNER?", await ens.owner(solidityKeccak(['bytes32', 'bytes32'], [namehash("test"), namehash("myname")])), accounts[0])

    await publicResolver.setAddr(solidityKeccak(['bytes32', 'bytes32'], [namehash("test"), namehash("myname")]), accounts[0])
    await publicResolver.addr(solidityKeccak(['bytes32', 'bytes32'], [namehash("test"), namehash("myname")]))
    const ensnft = await deployer.deploy(ENSNFT, "myname.test", "MNM", ens.address, fifs.address)
    await fifs.changeOwner(namehash("myname"), ensnft.address)
    await ensnft.mint(solidityKeccak(['bytes32', 'bytes32'], [namehash("test"), namehash("myname")]))
    console.log("DO I OWN NFT?", await ensnft.ownerOf(solidityKeccak(['bytes32', 'bytes32'], [namehash("test"), namehash("myname")])), accounts[0])
  })
}


module.exports = function(deployer, network, accounts) {
  var tld = 'test';

    deployFIFS(deployer, tld, accounts);


};
