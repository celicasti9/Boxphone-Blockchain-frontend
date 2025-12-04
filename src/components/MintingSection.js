import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './MintingSection.css';

const MintingSection = () => {
  const { web3, account, isConnected } = useWeb3();
  const { isAuthenticated } = useAuth();
  const [minting, setMinting] = useState(false);
  const [presaleMinted, setPresaleMinted] = useState(0);
  const [maxPresale, setMaxPresale] = useState(0);
  const [mintPrice, setMintPrice] = useState('0');

  useEffect(() => {
    // Fetch presale statistics
    const fetchPresaleStats = async () => {
      try {
        // This would fetch from your smart contract or backend
        // For now, using placeholder values
        setMaxPresale(100); // 10% of 1000 total collection
        setPresaleMinted(0);
        setMintPrice('0.1'); // BNB
      } catch (error) {
        console.error('Error fetching presale stats:', error);
      }
    };

    fetchPresaleStats();
  }, []);

  const handleMint = async () => {
    if (!isConnected || !account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!isAuthenticated) {
      alert('Please login first');
      return;
    }

    setMinting(true);
    try {
      // TODO: Implement actual minting logic with smart contract
      // This is a placeholder
      alert('Minting functionality will be implemented with the smart contract');
      
      // Example minting flow:
      // 1. Connect to NFT contract
      // 2. Call mint function
      // 3. Wait for transaction
      // 4. Update UI
      
    } catch (error) {
      console.error('Minting error:', error);
      alert(`Minting failed: ${error.message}`);
    } finally {
      setMinting(false);
    }
  };

  return (
    <section className="minting-section">
      <div className="minting-container">
        <h2 className="minting-title">Presale Minting</h2>
        <p className="minting-description">
          Mint your unique Boxphone NFT now! 10% of the collection is available for presale.
        </p>

        <div className="minting-stats">
          <div className="stat-item">
            <span className="stat-label">Minted</span>
            <span className="stat-value">{presaleMinted} / {maxPresale}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Price</span>
            <span className="stat-value">{mintPrice} BNB</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Remaining</span>
            <span className="stat-value">{maxPresale - presaleMinted}</span>
          </div>
        </div>

        <div className="minting-progress">
          <div
            className="progress-bar"
            style={{ width: `${(presaleMinted / maxPresale) * 100}%` }}
          />
        </div>

        <button
          className="mint-button"
          onClick={handleMint}
          disabled={minting || !isConnected || presaleMinted >= maxPresale}
        >
          {minting
            ? 'Minting...'
            : !isConnected
            ? 'Connect Wallet to Mint'
            : presaleMinted >= maxPresale
            ? 'Sold Out'
            : `Mint NFT (${mintPrice} BNB)`}
        </button>

        {presaleMinted >= maxPresale && (
          <p className="minting-note">
            Presale is complete! Remaining NFTs will be available on OpenSea.
          </p>
        )}
      </div>
    </section>
  );
};

export default MintingSection;
