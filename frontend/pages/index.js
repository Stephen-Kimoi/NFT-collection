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
  
  // Minting an NFT during presale
  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true) 
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer) 
      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.01"), 
      })
      setLoading(true)
      await tx.wait() 
      setLoading(false) 
      setSuccess(true) 
      successDiv("You have successfully minted Steve's NFTs")
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      setError(true) 
      errorDiv("Sorry couldn't ")
      console.error(error)
    }
  }

  // Mint an NFT after presale has ended
  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true) 
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer) 

      const tx = await nftContract.mint({
        value: utils.parseEther("0.01")
      })

      setLoading(true) 
      await tx.wait() 
      setLoading(false) 
      setSuccess(true)  
      successDiv("Successfully minted an NFT!") 
      setTimeout(() => {
        setSuccess(false)
      }, 3000)

    } catch (error) {
      console.error(error) 
      setError(true) 
    }
  }

  
  // Connect metamask wallet
  const connectWallet = async () => {
    try {
      await getProviderOrSigner(true) 
      setWalletConnected(true)
      setSuccess(true)
      successDiv("Wallet connected successfully")
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      setError(true)
      errorDiv(error)
      console.error(error)
    }
  }
  
  // CHecking if the presale has started
  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner() 
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider) 

      const _presaleStarted = await nftContract.presaleStarted();  
      if (!_presaleStarted) {
        await getOwner()
      }
      setPresaleStarted(_presaleStarted); 
      return _presaleStarted
    } catch (error) {
      console.error(error) 
      setError(true) 
      return false; 
    }
  
  }

  // Checking if the presale has ended
  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner() 
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider) 
      
      const _presaleEnded = await nftContract.presaleEnded() 
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000))

      if (hasEnded) {
        setPresaleEnded(true)
      } else {
        setPresaleEnded(false)
      }
      return hasEnded
    } catch (error) {
      console.error(error) 
      setError(true)
      return false
    }
  } 
  
  // Getting the owner of the contract
  const getOwner = async () => {
    try {

      const provider = await getProviderOrSigner() 
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)

      const _owner = nftContract.owner() 

      const signer = await getProviderOrSigner(true) 
      const address = await signer.getAddress() 
      
      if (address === _owner){
        setIsOwner(true) 
      }

    } catch (error) {

      console.error(error) 
      setError(true) 

    }
  }

  // Getting the number of token Ids minted 
  const getTokenIdsMinted = async () => { 
    try {
      const provider = await getProviderOrSigner() 
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider) 

      const _tokenIds = await nftContract.tokenIds() 
      setTokenIdsMinted(_tokenIds.toString())
    } catch (error) {
      console.error(error) 
      setError(true) 
    }
  }
  
  // Starts the presale for the NFT collection
  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer) 

      const tx = await nftContract.startPresale() 
      setLoading(true) 

      await tx.wait() 
      setLoading(false) 
      setSuccess(true)
      successDiv("Presale successfully started!") 
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
      
      await checkIfPresaleStarted() 
    } catch (error) {
      console.error(error)
      error(true)
    }
  }

  // Getting the provider or signer
  const getProviderOrSigner = async (needSigner = false) => {

    web3ModalRef.current = new Web3Modal({
      network: "goerli", 
      providerOptions: {}, 
      disableInjectedProvider: false
    }); 

    setLoading(true)

    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider) 

    setLoading(false)

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

    // ***isOwner isnt working 
    if (!presaleStarted) {
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

  useEffect( () => {
    // Check if presale has started or ended
    const _presaleStarted = checkIfPresaleStarted() 
    if (_presaleStarted) {
      checkIfPresaleEnded()
    }

    getTokenIdsMinted()

    // Interval that gets called every 5 seconds to check if presale ended 
    const presaleEndedInterval = setTimeout(async () => {
      const _presaleStarted = await checkIfPresaleStarted() 
      if (_presaleStarted) {
        const _presaleEnded = await checkIfPresaleEnded() 
        if (_presaleEnded) {
          clearInterval(presaleEndedInterval)
        }
      } 
    }, 5 * 1000)

    // Get numbers of token Ids minted after 5 seconds 
    setInterval( async () => {
      await getTokenIdsMinted()
    }, 5 * 1000)



  }, [walletConnected])

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
                errorDiv()
              )
            }
            {
              success && (
                successDiv()
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