import React, { useState, useEffect } from 'react';
import { FaTelegram, FaInstagram, FaCoins } from 'react-icons/fa';
import api from '../utils/api';
import './SocialIcons.css';

const SocialIcons = ({ variant = 'default' }) => {
  const [socialLinks, setSocialLinks] = useState({
    telegram: '',
    instagram: '',
    binance: ''
  });

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const response = await api.get('/site-settings/social-links');
      setSocialLinks(response.data.links || {
        telegram: '',
        instagram: '',
        binance: ''
      });
    } catch (error) {
      // Use default links if API fails (for development)
      console.log('Using default social links');
      setSocialLinks({
        telegram: 'https://t.me/phonestream',
        instagram: 'https://instagram.com/phonestream',
        binance: 'https://binance.com'
      });
    }
  };

  const iconClass = variant === 'navbar' ? 'social-icon-navbar' : 'social-icon';

  return (
    <div className={`social-icons-container ${variant}`}>
      <a
        href={socialLinks.telegram || 'https://t.me/phonestream'}
        target="_blank"
        rel="noopener noreferrer"
        className={iconClass}
        aria-label="Telegram"
        title="Telegram"
      >
        <FaTelegram />
      </a>
      <a
        href={socialLinks.instagram || 'https://instagram.com/phonestream'}
        target="_blank"
        rel="noopener noreferrer"
        className={iconClass}
        aria-label="Instagram"
        title="Instagram"
      >
        <FaInstagram />
      </a>
      <a
        href={socialLinks.binance || 'https://binance.com'}
        target="_blank"
        rel="noopener noreferrer"
        className={iconClass}
        aria-label="Binance"
        title="Binance"
      >
        <FaCoins />
      </a>
    </div>
  );
};

export default SocialIcons;
