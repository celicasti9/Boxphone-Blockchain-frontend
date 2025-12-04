import React from 'react';
import SocialIcons from './SocialIcons';
import './Footer.css';

const Footer = () => {

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>PHONESTREAM</h3>
            <p>Revenue Sharing Platform for Music Streaming</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="https://phonestream.store" target="_blank" rel="noopener noreferrer">Store</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Connect With Us</h4>
            <SocialIcons />
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 PHONESTREAM Platform. All rights reserved.</p>
          <p className="footer-domains">
            <a href="https://phonestream.online">phonestream.online</a> | <a href="https://phonestream.store">phonestream.store</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
