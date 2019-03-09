pragma solidity 0.5.0;
/* pragma experimental ABIEncoderV2; */

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import '@ensdomains/ens/contracts/FIFSRegistrar.sol';

contract ENSNFT is ERC721Full, Ownable {
    address metadata;
    ENS ens;
    FIFSRegistrar registrar;
    constructor (string memory _name, string memory _symbol, ENS _ens, FIFSRegisrar _registrar) public
        ERC721Full(_name, _symbol) {
        ens = _ens
        registrar = _registrar;
        
    }

    function mint(bytes32 _node) public {
        require(ens.owner(_node) == address(this));
        uint256 tokenId = uint256(_node);
        _mint(msg.sender, tokenId);
    }
    function burn(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender);
        _burn(msg.sender, tokenId);
        registrar.transfer(bytes32(tokenId), msg.sender);
    }
}
