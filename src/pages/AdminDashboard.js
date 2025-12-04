import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminAPIKeyManager from '../components/AdminAPIKeyManager';
import AdminSocialLinks from '../components/AdminSocialLinks';
import AdminProductManager from '../components/AdminProductManager';
import AdminUserNFTManager from '../components/AdminUserNFTManager';
import SpotifyDataViewer from '../components/SpotifyDataViewer';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/theme.css';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { isConnected, account } = useWeb3();
  const [dashboardData, setDashboardData] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [users, setUsers] = useState([]);
  const [streamingOverview, setStreamingOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Use test routes if not authenticated, regular routes if authenticated
      const walletAddress = account || localStorage.getItem('walletAddress');
      const basePath = (!isAuthenticated && walletAddress) ? '/test' : '/admin';
      const testModeParams = (!isAuthenticated && walletAddress) 
        ? { params: { walletAddress } } 
        : {};
      
      const [dashboardRes, nftsRes, usersRes, streamingRes] = await Promise.allSettled([
        api.get(`${basePath}/dashboard`, testModeParams).catch(e => ({ error: e })),
        api.get(`${basePath}/nfts`, testModeParams).catch(e => ({ error: e })),
        api.get(`${basePath}/users`, testModeParams).catch(e => ({ error: e })),
        api.get(`${basePath}/streaming-overview`, { ...testModeParams, params: { ...testModeParams.params, timeRange: '24h' } }).catch(e => ({ error: e }))
      ]);

      // Handle dashboard response
      if (dashboardRes.status === 'fulfilled' && !dashboardRes.value.error) {
        setDashboardData(dashboardRes.value.data);
      } else {
        console.error('Dashboard error:', dashboardRes.value?.error || dashboardRes.reason);
        toast.error('Failed to load dashboard overview');
      }

      // Handle NFTs response
      if (nftsRes.status === 'fulfilled' && !nftsRes.value.error) {
        setNfts(nftsRes.value.data.nfts || []);
      } else {
        console.error('NFTs error:', nftsRes.value?.error || nftsRes.reason);
      }

      // Handle users response
      if (usersRes.status === 'fulfilled' && !usersRes.value.error) {
        setUsers(usersRes.value.data.users || []);
      } else {
        console.error('Users error:', usersRes.value?.error || usersRes.reason);
        toast.error('Failed to load users');
      }

      // Handle streaming response
      if (streamingRes.status === 'fulfilled' && !streamingRes.value.error) {
        setStreamingOverview(streamingRes.value.data);
      } else {
        console.error('Streaming error:', streamingRes.value?.error || streamingRes.reason);
        toast.error('Failed to load streaming data');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="loading-container">
          <div>Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        {(!isAuthenticated || !user?.isAdmin) && isConnected && (
          <div className="test-mode-banner">
            <p>🔧 <strong>Test Mode:</strong> You're viewing the admin panel in test mode. 
            {!isAuthenticated ? (
              <> To access all features, please sign the authentication message when prompted. Your wallet ({account?.substring(0, 6)}...{account?.substring(account.length - 4)}) has been set as admin in the database.</>
            ) : (
              <> Your wallet is set as admin, but you may need to refresh or sign in again to see all features.</>
            )}
            </p>
          </div>
        )}
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'nfts' ? 'active' : ''}`}
            onClick={() => setActiveTab('nfts')}
          >
            NFTs ({dashboardData?.overview?.totalNFTs || 0})
          </button>
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({dashboardData?.overview?.totalUsers || 0})
          </button>
          <button
            className={`tab ${activeTab === 'user-nft-mgmt' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-nft-mgmt')}
          >
            Manage Users & NFTs
          </button>
          <button
            className={`tab ${activeTab === 'streaming' ? 'active' : ''}`}
            onClick={() => setActiveTab('streaming')}
          >
            Streaming Data
          </button>
          <button
            className={`tab ${activeTab === 'api-keys' ? 'active' : ''}`}
            onClick={() => setActiveTab('api-keys')}
          >
            API Keys
          </button>
          <button
            className={`tab ${activeTab === 'social-links' ? 'active' : ''}`}
            onClick={() => setActiveTab('social-links')}
          >
            Social Links
          </button>
          <button
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
        </div>

        <div className="dashboard-body">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total NFTs</h3>
                  <p className="stat-value">{dashboardData?.overview?.totalNFTs || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-value">{dashboardData?.overview?.totalUsers || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Streams</h3>
                  <p className="stat-value">{dashboardData?.overview?.totalStreams || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">${(dashboardData?.overview?.totalRevenue || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nfts' && (
            <div className="nfts-tab">
              <div className="nfts-grid">
                {nfts.length === 0 ? (
                  <p>No NFTs found.</p>
                ) : (
                  nfts.map((nft) => (
                    <div key={nft._id} className="nft-card">
                      <div className="nft-image">
                        {nft.metadata?.image ? (
                          <img src={nft.metadata.image} alt={nft.metadata.name} />
                        ) : (
                          <div className="nft-placeholder">NFT #{nft.tokenId}</div>
                        )}
                      </div>
                      <div className="nft-info">
                        <h4>{nft.metadata?.name || `NFT #${nft.tokenId}`}</h4>
                        <p>Owner: {nft.owner.substring(0, 8)}...</p>
                        <p>Streams: {nft.streamingData?.totalStreams || 0}</p>
                        <p>Revenue: ${(nft.streamingData?.totalRevenue || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Wallet Address</th>
                    <th>NFTs Owned</th>
                    <th>Total Revenue</th>
                    <th>Is Admin</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.walletAddress}</td>
                      <td>{u.nftsOwned?.length || 0}</td>
                      <td>${(u.totalRevenue || 0).toFixed(2)}</td>
                      <td>{u.isAdmin ? 'Yes' : 'No'}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'user-nft-mgmt' && (
            <div className="user-nft-mgmt-tab">
              <AdminUserNFTManager />
            </div>
          )}

          {activeTab === 'streaming' && (
            <div className="streaming-tab">
              <SpotifyDataViewer />
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className="api-keys-tab">
              <AdminAPIKeyManager />
            </div>
          )}

          {activeTab === 'social-links' && (
            <div className="social-links-tab">
              <AdminSocialLinks />
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-tab">
              <AdminProductManager />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
