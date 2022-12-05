const { ethers } = require("hardhat"); 
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers"); 
const { time } = require("@openzeppelin/test-helpers"); 
const { expect } = require("chai"); 
const Web3 = require("web3");  

describe("Cryto Devs", function() {
  async function deployedCryptoDevs() {
    const [owner, address1] = await ethers.getSigners(); 
    const web3 = new Web3(Web3.givenProvider); 
    const addr = web3.utils.toChecksumAddress("0xd9145CCE52D386f254917e481eB44e9943F39138"); 
    const cryptoFactory = await ethers.getContractFactory("CryptoDevs"); 
    const deployedContract = await cryptoFactory.deploy("https://steves-nft-collection.vercel.app/api/", addr); 

    await deployedContract.deployed(); 

    return { deployedContract, owner, address1}
  }; 

  it("Owner of the contract must be equal to the deployer", async () => {
    const { deployedContract, owner } = await loadFixture(deployedCryptoDevs); 
    expect(await deployedContract.owner()).to.equal(await owner.address); 
  });  

  it("Presale should be trues", async() => {
    const { deployedContract } = await loadFixture(deployedCryptoDevs); 
    await deployedContract.startPresale(); 

    expect(await deployedContract.presaleStarted()).to.equal(true); 
  }); 

})