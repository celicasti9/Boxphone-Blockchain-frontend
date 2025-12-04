import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get wallet address from Web3 context (stored in localStorage or available globally)
const getWalletAddress = () => {
  // Try to get from window.ethereum first (most reliable)
  if (window.ethereum && window.ethereum.selectedAddress) {
    localStorage.setItem('walletAddress', window.ethereum.selectedAddress);
    return window.ethereum.selectedAddress;
  }
  
  // Try to get from localStorage
  const stored = localStorage.getItem('walletAddress');
  if (stored) return stored;
  
  return null;
};

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // In test mode, add wallet address to headers if no token
      const walletAddress = getWalletAddress();
      if (walletAddress) {
        config.headers['x-wallet-address'] = walletAddress;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect immediately - allow components to handle the error
      // This enables test mode where users can view dashboard without full auth
      const token = localStorage.getItem('token');
      if (token) {
        // Only clear token if we had one (user was logged in before)
        // Don't redirect - let components handle it
        console.warn('Authentication required. Some features may be limited.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
