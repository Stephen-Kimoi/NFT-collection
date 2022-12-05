const { ethers } = require("hardhat"); 
require("dotenv").config({ path: ".env"}); 
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL} = require('../constants'); 


const main = async () => {
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS; // Address of the whitelist contract that we had deployed
  const metadataUrl = METADATA_URL;

  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs"); 

  const deployedDevsContract = await cryptoDevsContract.deploy(
    metadataUrl, 
    whitelistContract
  ); 

  await deployedDevsContract.deployed()


  // Print the address of the new deployed contract
  console.log("CryptoDevs contract address: ", deployedDevsContract.address); 

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });