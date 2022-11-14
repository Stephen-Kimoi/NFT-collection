import { Contract, providers, utils } from 'ethers'
import Head from 'next/head' 
import React, {useState, useRef, useEffect} from 'react'
import Web3Modal from "web3modal"
// import {abi, NFT_CONTRACT_ADDRESS} from ".../constants"
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

  const web3ModalRef = useRef() 

  const errorDiv = (message) => {
    return (
      <div className={styles.errorDiv}>
        {message}
      </div>
    )
  }



  const successDiv = (message) => {
    return (
      <div className={styles.successDiv}>
        {message}
      </div>
    )
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner(true) 
      setWalletConnected(true)
      setSuccess(true)
      successDiv("Wallet connected successfully")
    } catch (error) {
      setError(true)
      errorDiv(error)
      console.error(error)
    }
  }



  const getProviderOrSigner = async (needSigner = false) => {
    web3ModalRef.current = new Web3Modal({
      network: "goerli", 
      providerOptions: {}, 
      disableInjectedProvider: false
    }); 

    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider) 

    const { chainId } = await web3Provider.getNetwork() 
    if (chainId !== 5) {
      setError(true)
      errorDiv("Change network to Goerli")
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }

    return web3Provider; 
  }

   
  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    }

    if (loading) {
      return (
        <button className={styles.button}>
          Loading...
        </button>
      )
    }

    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start presale! 
        </button>
      )
    }

    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>
            Presale hasn't started yet
          </div>
        </div>
      )
    }

    if (presaleStarted && !presaleEnded){
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto
            Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      )
    }

    if (presaleStarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      )
    }
  }

  // useEffect( () => {
  //   if (!walletConnected) {
  //     web3ModalRef.current = new Web3Modal({
  //       network: "goerli", 
  //       providerOptions: {}, 
  //       disableInjectedProvider: false
  //     }); 
  //     connectWallet(); 


  //   } 
  // })

  return (
    <div>
      <Head>
        <title>Steve's NFTs</title> 
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Steve's NFTs</h1>
            <div className={styles.description}>
                This is my NFT collection
            </div>
            <div className={styles.description}>
              {tokenIdsMinted}/20 have been minted
            </div>
            {renderButton()}
            {
              error && (
                errorDiv("Sorry an error occured!")
              )
            }
            {
              success && (
                successDiv("Success!")
              )
            }
          </div>
          <div>
            <img className={styles.image} src="./cryptodevs/0.svg" />
          </div>
        </div>
      </div>
  )

}