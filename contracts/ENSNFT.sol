pragma solidity ^0.5.2;
/* pragma experimental ABIEncoderV2; */

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC721/ERC721Full.sol';
import '@ensdomains/ens/contracts/HashRegistrar.sol';

contract ENSNFT is ERC721Full, Ownable {
    HashRegistrar registrar;
    constructor (string memory _name, string memory _symbol, HashRegistrar _registrar) public
        ERC721Full(_name, _symbol) {
        registrar = _registrar;
    }

    function mint(bytes32 _hash) public {
        address deedAddress;
        (, deedAddress, , , ) = registrar.entries(_hash);
        Deed deed = Deed(deedAddress);
        require(deed.owner() == address(this));
        require(deed.previousOwner() == msg.sender);
        uint256 tokenId = uint256(_hash); // dont do math on this
        _mint(msg.sender, tokenId);
    }

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender);
        _burn(msg.sender, tokenId);
        registrar.transfer(bytes32(tokenId), msg.sender);
    }
}
