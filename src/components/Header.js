import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMoon, FiSun, FiLogOut } from 'react-icons/fi';
import SocialIcons from './SocialIcons';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { account, isConnected, disconnectWallet } = useWeb3();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    disconnectWallet();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="PHONESTREAM" className="logo-image" />
          <span className="logo-text">PHONESTREAM</span>
        </Link>

        <nav className="header-nav">
          <a href="https://phonestream.store" className="nav-link" target="_blank" rel="noopener noreferrer">
            Store
          </a>
          {(isConnected || isAuthenticated) && (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              {(user?.isAdmin || isConnected) && (
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="header-actions">
          <SocialIcons variant="navbar" />
          
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>

          {isConnected && account && (
            <div className="wallet-info">
              <span className="wallet-address">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
            </div>
          )}

          {isAuthenticated && (
            <button
              className="logout-btn"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <FiLogOut />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
