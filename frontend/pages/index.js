import { Contract, providers, utils } from 'ethers'
import Head from 'next/head' 
import React, {useState, useRef, useEffect} from 'react'
import Web3Modal from "web3modal"
import { abi } from "../utils/CryptoDevs.json"
import { NFT_CONTRACT_ADDRESS } from "../constants"
import styles from "../styles/Home.module.css"

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false)
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
      console.log("Connecting wallet..."); 

      web3ModalRef.current = new Web3Modal({
        network: "goerli", 
        providerOptions: {}, 
        disableInjectedProvider: false
      });
  
      const provider = await web3ModalRef.current.connect(); 
      const web3Provider = new providers.Web3Provider(provider);
      
      setLoading(false)

      const { chainId } = await web3Provider.getNetwork() 
      if (chainId !== 5) {
        setError(true)
        setTimeout(() => {
          setError(false)
        }, 3000)
        throw new Error("Change network to Goerli");
      }

      // if (needSigner) {
      //   const signer = web3Provider.getSigner()
      //   return signer
      // }

      const signer = web3Provider.getSigner(); 

      return { web3Provider, signer}; 

    } catch(error) {
      console.error(error); 
    }
  }

  
  // Render button 
  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
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
                <button onClick={changeNft}>Change NFT</button>
              </div>
            )
          }

        </div>

      </div>
      </div>
  )

}