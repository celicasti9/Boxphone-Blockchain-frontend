import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWeb3 } from './Web3Context';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { web3, account, isConnected } = useWeb3();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [nonce, setNonce] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [isLoading, setIsLoading] = useState(false);

  // Request nonce for wallet signature
  const requestNonce = useCallback(async (walletAddress) => {
    try {
      const response = await api.post('/auth/nonce', { walletAddress });
      setNonce(response.data.nonce);
      return response.data.message;
    } catch (error) {
      console.error('Nonce request error:', error);
      throw error;
    }
  }, []);

  // Sign message and login
  const login = useCallback(async () => {
    if (!web3 || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      
      // Request nonce
      const message = await requestNonce(account);

      // Sign message
      const signature = await web3.eth.personal.sign(message, account, '');

      // Send signature to backend
      const response = await api.post('/auth/login', {
        walletAddress: account,
        signature
      });

      const { token, user: userData } = response.data;
      
      setToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('token', token);

      return { token, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [web3, account, requestNonce]);

  // Logout
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setNonce(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  }, []);

  // Verify token and get user
  const verifyAuth = useCallback(async () => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await api.get('/auth/verify');
      if (response.data.valid) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      logout();
    }
  }, [token, logout]);

  // Auto-login when wallet is connected
  useEffect(() => {
    if (isConnected && account && !isAuthenticated && !isLoading) {
      verifyAuth();
    }
  }, [isConnected, account, isAuthenticated, verifyAuth, isLoading]);

  // Verify auth on mount
  useEffect(() => {
    if (token) {
      verifyAuth();
    }
  }, [token, verifyAuth]);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    verifyAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
