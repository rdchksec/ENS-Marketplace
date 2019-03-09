import {providers, Contract} from 'ethers'
import ENS from '../../build/contracts/ENSRegistry'
import FIFS from '../../build/contracts/FIFSRegistrar'
import ERC721 from '../../build/contracts/ERC721Full'
import ENSNFT from '../../build/contracts/ENSNFT'
import namehash from 'eth-ens-namehash'
import { solidityKeccak256, keccak256 } from 'ethers/utils'
import {sha3} from 'web3-utils'
export const owner = async (domain) => {
    try {
        console.log(domain)
        const provider = new providers.Web3Provider(window.ethereum)
        const network = (await provider.getNetwork()).chainId
        const ens = new Contract(
            ENS.networks[network].address,
            ENS.abi,
            provider
        ) 
        domain = domain.split('.').reverse()
        domain = domain.map(d => namehash.hash(d))
        console.log(domain)
        return  (await ens.owner(solidityKeccak256(['bytes32', 'bytes32'], domain)))
    } catch (e) {
        console.log(e)
    }
}


export const register = async (domain) => {
    try {
        const provider = new providers.Web3Provider(window.ethereum) 
        const network = (await provider.getNetwork()).chainId
        const fifs = new Contract(
            FIFS.networks[network].address,
            FIFS.abi,
            provider.getSigner()
        )
        domain = domain.split('.')
        domain.pop()
        domain = domain.reduce((a, b) => a.concat(b) )
        console.log(domain)
        let tx = await fifs.register(namehash.hash(domain), provider.getSigner().getAddress())
        await provider.waitForTransaction(tx.hash)
    } catch (e) {
        throw Error(e.message)
    }
}

export const makeNFT = async (domain) => {
    try {
        const provider = new providers.Web3Provider(window.ethereum) 
        const network = (await provider.getNetwork()).chainId
        const fifs = new Contract(
            FIFS.networks[network].address,
            FIFS.abi,
            provider.getSigner()
        )
        let label = domain.split('.')
        label.pop()
        label = label.reduce((a, b) => a.concat(b) )
        let tx = await fifs.changeOwner(namehash.hash(label), ENSNFT.networks[network].address)
        await provider.waitForTransaction(tx.hash)
        const ensnft = new Contract(
            ENSNFT.networks[network].address,
            ENSNFT.abi,
            provider.getSigner()
        )
        domain = domain.split('.').reverse()
        domain = domain.map(d => namehash.hash(d))
        tx = await ensnft.mint(solidityKeccak256(['bytes32', 'bytes32'], domain))
        await provider.waitForTransaction(tx.hash)
    } catch (e) {
        console.log(e)
        throw Error(e.message)
    }
}

export const domainFromNft = async (domain) => {
    try {
        const provider = new providers.Web3Provider(window.ethereum) 
        const network = (await provider.getNetwork()).chainId
        const ensnft = new Contract(
            ENSNFT.networks[network].address,
            ENSNFT.abi,
            provider.getSigner()
        )
        domain = domain.split('.').reverse()
        domain = domain.map(d => namehash.hash(d))
        let tx = await ensnft.burn(solidityKeccak256(['bytes32', 'bytes32'], domain))
        await provider.waitForTransaction(tx.hash)
    } catch (e) {
        throw Error(e.message)
    }
}

export const tokenOwner = async (domain) => {
    const provider = new providers.Web3Provider(window.ethereum) 
    const network = (await provider.getNetwork()).chainId
    const erc721 = new Contract(
        ENSNFT.networks[network].address,
        ERC721.abi,
        provider
    )
    domain = domain.split('.').reverse()
    domain = domain.map(d => namehash.hash(d))
    return (await erc721.ownerOf(solidityKeccak256(['bytes32', 'bytes32'], domain)))
}

export const isNFT = async (domain) => {
    try {
        const provider = new providers.Web3Provider(window.ethereum) 
        const network = (await provider.getNetwork()).chainId
        return (await owner(domain)) === ENSNFT.networks[network].address
    } catch (e) {
        console.log(e)
        throw Error(e.message)
    }
}