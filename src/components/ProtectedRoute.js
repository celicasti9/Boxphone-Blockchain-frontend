import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isConnected } = useWeb3();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // For testing: allow access if wallet is connected, even without full auth
  // In production, you may want to require full authentication
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  // Allow access for testing without full authentication
  // Show a banner if not fully authenticated
  // if (!isAuthenticated) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export default ProtectedRoute;
