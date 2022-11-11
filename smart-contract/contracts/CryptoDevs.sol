// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    string _baseTokenURI; // 
    uint256 public _price = 0.01 ether; // Price of one Crypto Dev NFT 
    bool public _paused; // For pausing the smart contract incase of an emergency 
    uint256 public maxTokenIds = 20; // Maximum numbe of Crypto Devs NFTs 
    uint256 public tokenIds; // Total number of token IDs minted 
    IWhitelist whitelist; // Whitelist contract instance 
    bool public presaleStarted; // Boolean to keep track of whether presale started or not 
    uint256 public presaleEnded; // Timestamp for when presale ended
    
    // The purpose of the modifier is to ensure that this partcular condition is met
    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused"); 
        _;
    }

    constructor (string memory _baseURI, address whitelistContract) ERC721("Crypto Devs", "CD"){
        _baseTokenURI = _baseURI; 
        whitelist = IWhitelist(whitelistContract); // Initialize a new instance of whitelist interface
    }
    
    // Start a presale for the whitelist address
    function startPresale() public onlyOwner {
        presaleStarted = true; 
        presaleEnded = block.timestamp + 5 minutes; 
    }

    // presaleMint - allow a user to only mint one NFT per transaction during the sale
    function presaleMint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp < presaleEnded, "Presale is not running"); 
        require(whitelist.whitelistedAddresses(msg.sender),"You are not whitelisted"); 
        require(tokenIds < maxTokenIds, "Exeeded maximum Crypto Devs supply"); 
        require(msg.value >= _price, "Ether sent is not correct"); 
        tokenIds += 1; 
        _safeMint(msg.sender, tokenIds); // Ensures that you are sending minted tokens to a contract that is able to handle NFTs 
        // Prevents tokens being lost 
    }

    // mint - allows users to mint only 1 NFT per transaction after the presale has ended 
    function mint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet"); 
        require(tokenIds < maxTokenIds, "Exceed maximum Crypto Devs supply"); 
        require(msg.value >= _price, "Ether sent is not correct"); 
        tokenIds += 1; 
        _safeMint(msg.sender, tokenIds);
    }

    // _baseURI - will overide the Openzeppelin's ERC721 implementation which by default will return an 
    // empty string for the baseURI 
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI; 
    }

    // Set paused makes the contract paused or unpaused
    function setPaused(bool val) public onlyOwner{
       _paused = val; 
    } 

    // withdraw sends all ether in the contract to the owner of the contract 
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance; 
        (bool sent, ) = _owner.call{value: amount}(""); 
        require(sent, "Failed to send ether");  
    } 

    // Function to recieve ether
    receive() external payable {}

    // Fallback function, called when msg.data is empty
    fallback() external payable {}
}