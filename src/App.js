import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = '_annezhou';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-3hssdvt67x';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = '0xC9f1ff4871879736D86ca90505257Aa6D8581ace';


const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [nftsMinted, setNftsMinted] = useState(0);
  const [isMinting, setIsMinting] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected()
  }, []);

  const checkIfConnectedToRinkeby = async () => {
    try {
      const { ethereum} = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);
  
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!")
      }
    } catch(err) {
      console.log(err)
    }
  }

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log('Make sure you have metamask!');
      return;
    } else {
      console.log('We have the ethereum object', ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts'});

    checkIfConnectedToRinkeby();

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account:', account);
      setCurrentAccount(account)
      getTotalMinted();
      setupEventListener();
    } else {
      console.log('No authorized account found')
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum} = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('Connected', accounts[0]);

      checkIfConnectedToRinkeby();

      setCurrentAccount(accounts[0]);
      getTotalMinted();
      setupEventListener();
    } catch(err) {
      console.log(err)
    }
  }

  const getTotalMinted = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        console.log('Going to pop wallet now to pay gas...');
        const nftsMinted = await connectedContract.getTotalNFTsMintedSoFar();
        setNftsMinted(nftsMinted);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
        console.log('Going to pop wallet now to pay gas...');
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setIsMinting(true);
        console.log('Mining...please wait.')
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setIsMinting(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (err) {
      console.log(err)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
  
        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })
        getTotalMinted();
        console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist!");
      }

    } catch (err) {
      console.log(err)
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button 
      onClick={askContractToMintNft} 
      className={`cta-button connect-wallet-button ${isMinting || nftsMinted >= TOTAL_MINT_COUNT ? 'cta-button-disabled' : ''}`}
    >
      {isMinting ? 'Minting...' : 'Mint NFT'}
    </button>
  )

  const renderTotalMinted = () => {
    return (
      <div className="mintCountContainer">
        <div className="mintCountBadge">{`Minted: ${nftsMinted} / ${TOTAL_MINT_COUNT}`}</div>
      </div>
    )
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          {renderTotalMinted()}
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {!currentAccount ? renderNotConnectedContainer() : renderMintUI()}
        </div>  
        <div className="footer-container">
          <a
            className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >🌊 View Collection on OpenSea</a>
          <div className="twitterContainer">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built on @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
