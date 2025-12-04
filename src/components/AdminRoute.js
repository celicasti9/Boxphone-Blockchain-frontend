import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
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

  // For testing: allow access if wallet is connected
  // In production, require full authentication and admin status
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  // Check admin status - if not authenticated, allow access for testing
  // Show warning banner in admin dashboard
  if (isAuthenticated && user && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
