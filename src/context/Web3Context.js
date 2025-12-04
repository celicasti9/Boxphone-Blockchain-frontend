import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Web3 } from 'web3';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask or another Web3 wallet');
      return false;
    }

    try {
      setIsConnecting(true);
      const web3Instance = new Web3(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Check network
      const networkId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      const expectedChainId = process.env.REACT_APP_CHAIN_ID || '0x61'; // BSC Testnet
      
      if (networkId !== expectedChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: expectedChainId }],
          });
        } catch (switchError) {
          // Network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: expectedChainId,
                chainName: 'Binance Smart Chain Testnet',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18
                },
                rpcUrls: [process.env.REACT_APP_BSC_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/'],
                blockExplorerUrls: ['https://testnet.bscscan.com']
              }],
            });
          }
        }
      }

      setWeb3(web3Instance);
      setAccount(accounts[0]);
      setChainId(networkId);
      setIsConnected(true);
      
      // Store wallet address in localStorage for API access
      localStorage.setItem('walletAddress', accounts[0]);

      // Listen for account changes
      window.ethereum.on('accountsChanged', (newAccounts) => {
        if (newAccounts.length > 0) {
          setAccount(newAccounts[0]);
        } else {
          disconnectWallet();
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (newChainId) => {
        setChainId(newChainId);
        window.location.reload();
      });

      return true;
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert(`Failed to connect wallet: ${error.message}`);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWeb3(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    localStorage.removeItem('walletAddress');
  }, []);

  useEffect(() => {
    // Check if already connected
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts) => {
          if (accounts.length > 0) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            setAccount(accounts[0]);
            setIsConnected(true);
            
            window.ethereum.request({ method: 'eth_chainId' })
              .then((id) => setChainId(id));
          }
        })
        .catch(console.error);
    }
  }, []);

  const value = {
    web3,
    account,
    chainId,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};
