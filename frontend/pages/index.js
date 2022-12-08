import { Contract, ethers, provider, utils } from 'ethers'
import Head from 'next/head' 
import React, {useState, useRef, useEffect} from 'react'
import Web3Modal from "web3modal"
import { abi } from "../utils/CryptoDevs.json"
import { NFT_CONTRACT_ADDRESS } from "../constants"
import styles from "../styles/Home.module.css"

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [metamaskInstalled, setMetamaskInstalled] = useState(false)
  const [goerliNetwork, setGoerliNetwork] = useState(false); 
  const [presaleStarted, setPresaleStarted] = useState(false) 
  const [presaleEnded, setPresaleEnded] = useState(false) 
  const [loading, setLoading] = useState(false) 
  const [error, setError] = useState(false)  
  const [success, setSuccess] = useState(false)  
  const [isOwner, setIsOwner] = useState(false) // Checks if the connected wallet is the owner of the contract
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0") // Checks number of token Ids minted 
  const [nftNumber, setNftNumber] = useState(0)

  const web3ModalRef = useRef() 
  
   // Error div
   const errorDiv = (message) => {
    return (
      error && ( 
        <div className={styles.errorDiv}>
          {message}
        </div>
      )
    )
  }
  
  // Success div
  const successDiv = (message) => {
    return (
      success && (
        <div className={styles.successDiv}>
          {message}
        </div>
      )
    )
  }

  // Connect wallet
  const connectWallet = async() => {
    try {
      const { ethereum } = window; 
      const accounts = await ethereum.request({method: "eth_requestAccounts"}); 

      const chainId = await ethereum.chainId; 
      
      if(chainId !== 5) {
        setGoerliNetwork(true); 
        console.log("Kindly switch your network to Goerli testnet"); 
      }

      setSuccess(true); 
      setWalletConnected(true); 

      return accounts[0]; 
    } catch (error) {
      console.error(error); 
      setError(true); 
    }
  }

   // Use effect 
   useEffect(() => {
    const { ethereum } = window; 
    
    if(ethereum){
      setMetamaskInstalled(true); 
      console.log("Metamask is installed!"); 
    }

  })

  // Get provider or signer 
  const getProviderOrSigner = (needSigner) => {
    const { ethereum } = window; 
    let provider; 
    let signer; 

    if(ethereum){
      provider = new ethers.providers.Web3Provider(ethereum); 
      if(needSigner){
        signer = provider.getSigner(); 
        return signer; 
      } else {
        return provider; 
      }
    } 
    
  }

  // Public mint 
  const publicMint = async() => {
    console.log("Minting nft....")
    try {
      const signer = await getProviderOrSigner(true); 
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer); 
      nftContract.startPresale(); 
      const tx = await nftContract.mint({
        value: utils.parseEther("0.01")
      }); 
      
      await tx.wait();  
      console.log("Done!")
    } catch(error) {
      
      console.error(error); 
      console.log("Error!")
    }

  }

  // Getting the owner of the smart contract
  const getOwner = async () => {
    console.log("Loading....."); 
    try {
      const signer = getProviderOrSigner(true);  
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer); 

      const _owner = await nftContract.getOwner(); 
      const address = await signer.getAddress();  


      console.log("Owner is: ", _owner.from); 
      console.log("Address is: ", address); 

      if (_owner.from === address){
        setIsOwner(true); 
      }

    } catch(error) {
      console.error(error); 
    }
    console.log("Completed...."); 
  }

  
  // Render button 
  const renderButton = () => {

    if(!metamaskInstalled){
      return (
        <div className={styles.errorDiv}>
          <p>
            Warning! Kindly install metamask in order to continue using the application <br/> 
            Check it out over <a href="https://metamask.io/" target="_blank" className={styles.errorMsg}>here</a>
          </p>
        </div>
      )
    }

    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    } 

    if (!goerliNetwork) {
      return (
        <div className={styles.errorDiv}>
          <p>
            Warning! Kindly switch to Goerli network in order to continue using the application<br/> 
            Check it out over <a href="https://blog.cryptostars.is/goerli-g%C3%B6rli-testnet-network-to-metamask-and-receiving-test-ethereum-in-less-than-2-min-de13e6fe5677" target="_blank" className={styles.errorMsg}>here</a>
          </p>
        </div>
      )
    }

    if(isOwner && !presaleStarted) {
      return (
        <button onClick={ () => console.log("Start presale...")} className={styles.button}>
          Start the presale
        </button>
      )
    }

    if (true) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Mint 🚀
        </button>
      )
    }
  }


  return (
    <div>
      <Head>
        <title>Steve's NFTs</title> 
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        
        <div className={styles.mainContainer}>

          <div className={styles.contentContainer}>
            <h1 className={styles.title}>Steve's NFTs</h1>
            <img className={styles.openingImage} src="./opening.svg" />
            <div className={styles.description}>
                This is my NFT collection
            </div>
            <div className={styles.description}>
              {tokenIdsMinted}/20 have been minted
            </div>
              {renderButton()}
              {
                error && (
                  errorDiv("Opps! An error occured! Kindly refresh your page")
                )
              }
              {
                success && (
                  successDiv("Success!")
                )
              }
          </div>
           
          {
            walletConnected && (
              <div className={styles.imageContainer}>
                <img className={styles.image} src={`./${nftNumber}.svg`} />
                <button onClick={getOwner}>Get owner</button>
              </div>
            )
          }

        </div>

      </div>
      </div>
  )
}