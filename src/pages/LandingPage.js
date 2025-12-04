import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MintingSection from '../components/MintingSection';
import '../styles/theme.css';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { connectWallet, isConnected, account } = useWeb3();
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      const connected = await connectWallet();
      if (connected) {
        // Try to auto-login
        try {
          await login();
          // Login successful, navigate to dashboard
          navigate('/dashboard');
        } catch (error) {
          console.error('Auto-login failed:', error);
          // Still allow access for testing - user can manually login or go to dashboard
          toast.info('Wallet connected! Click "Go to Dashboard" or sign in to access full features.');
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error(`Connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGoToDashboard = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!isAuthenticated) {
      // Try to authenticate first
      try {
        await login();
        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        toast.error('Please sign the message in your wallet to access the dashboard');
        // Still allow navigation for testing
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="landing-page">
      <Header />
      
      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">PHONESTREAM Revenue Sharing Platform</h1>
            <p className="hero-subtitle">
              Mint unique NFTs, track your streaming revenue, and earn passive income from music streaming platforms.
            </p>
            <div className="hero-buttons">
              <button
                className="btn btn-primary"
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                {isConnecting
                  ? 'Connecting...'
                  : isConnected
                  ? `${account?.substring(0, 6)}...${account?.substring(account.length - 4)}`
                  : 'Connect Wallet'}
              </button>
              {(isConnected || isAuthenticated) && (
                <button
                  className="btn btn-secondary"
                  onClick={handleGoToDashboard}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Go to Dashboard (Test Mode)'}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="benefits-section">
          <h2 className="section-title">Why Choose PhoneStream?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🎵</div>
              <h3>Real-Time Streaming Data</h3>
              <p>Track your music streaming performance across platforms with AI-powered analytics</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Automatic Revenue Distribution</h3>
              <p>Earn royalties automatically based on your NFT ownership and streaming data</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📱</div>
              <h3>Generative NFT Collection</h3>
              <p>Own unique generative NFTs with randomized attributes and premium skins</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Secure & Transparent</h3>
              <p>Blockchain-powered platform with full transparency and enterprise-grade security</p>
            </div>
          </div>
        </section>

        {/* Minting Section */}
        <MintingSection />

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">Platform Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <h3>User Dashboard</h3>
              <p>Monitor your NFTs, track streaming data, view revenue reports, and manage your portfolio</p>
            </div>
            <div className="feature-item">
              <h3>Binance Smart Chain</h3>
              <p>Comprehensive tools for visualizing hardware status and revenue performance built on BSC.</p>
            </div>
            <div className="feature-item">
              <h3>Spotify Integration</h3>
              <p>Seamless integration with Spotify API to fetch your streaming statistics</p>
            </div>
            <div className="feature-item">
              <h3>BSC Blockchain</h3>
              <p>Built on Binance Smart Chain for fast, low-cost transactions</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
