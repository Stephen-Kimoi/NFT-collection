const { ethers } = require("hardhat"); 
require("dotenv").config({ path: ".env"}); 
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL} = require('../constants'); 


const main = async () => {
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS; // Address of the whitelist contract that we had deployed
  const metadataUrl = METADATA_URL; // URL where we can extract data of Crypto Dev NFT

  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs"); 

  const deployedDevsContract = await cryptoDevsContract.deploy(
    metadataUrl, 
    whitelistContract
  ); 


  // Print the address of the new deployed contract
  console.log("CryptoDevs contract address: ", deployedDevsContract.address); 

}

const runMain = async () => {
  try {
    main(); 
    process.exit(0); 
  } catch (error) {
    console.error(error)
    process.exit(1); 
  }
}

runMain(); 