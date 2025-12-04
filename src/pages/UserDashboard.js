import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArtistIDManager from '../components/ArtistIDManager';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/theme.css';
import './Dashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { account, isConnected } = useWeb3();
  const { theme } = useTheme();
  const [nfts, setNfts] = useState([]);
  const [streamingData, setStreamingData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    // Automatically fetch real Spotify data on mount if API keys are configured
    autoFetchSpotifyData();
  }, []);

  const autoFetchSpotifyData = async () => {
    try {
      // Use test routes if not authenticated, regular routes if authenticated
      const walletAddress = account || localStorage.getItem('walletAddress');
      const basePath = (!isAuthenticated && walletAddress) ? '/test' : '';
      
      // First check if we have API keys configured
      const response = await api.get(`${basePath}/streaming/auto-fetch`);
      
      if (response.data.hasData && response.data.data) {
        // We have existing data - use it
        setStreamingData(response.data.data || []);
        if (response.data.cached) {
          console.log('Using cached Spotify data');
        }
      } else if (response.data.autoFetched) {
        // New data was fetched
        setStreamingData(response.data.data || []);
        toast.success(`✨ Auto-fetched ${response.data.data?.length || 0} entries from Spotify API using your real API keys!`);
        // Refresh dashboard data to show new stats
        setTimeout(() => fetchDashboardData(), 1000);
      } else if (response.data.needsConfig) {
        console.log('ℹ️ Spotify API keys not configured in .env file');
      } else if (response.data.error) {
        console.error('⚠️ Auto-fetch error:', response.data.message);
        console.error('Error details:', response.data.error);
        toast.error(`Auto-fetch failed: ${response.data.message || 'Unknown error'}`);
      } else {
        console.log('ℹ️ Auto-fetch response:', response.data);
      }
    } catch (error) {
      // Show error details in console for debugging
      console.error('❌ Auto-fetch exception:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Auto-fetch failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        api.get('/nfts/my-nfts').catch(() => ({ data: { nfts: [] } })),
        api.get('/streaming/my-data').catch(() => ({ data: { data: [] } })),
        api.get('/streaming/statistics').catch(() => ({ data: {} })),
        api.get('/revenue/statistics').catch(() => ({ data: {} }))
      ]);

      // Extract data from results, handling both fulfilled and rejected promises
      const nftsRes = results[0].status === 'fulfilled' ? results[0].value : { data: { nfts: [] } };
      const streamingRes = results[1].status === 'fulfilled' ? results[1].value : { data: { data: [] } };
      const statsRes = results[2].status === 'fulfilled' ? results[2].value : { data: {} };
      const revenueRes = results[3].status === 'fulfilled' ? results[3].value : { data: {} };

      setNfts(nftsRes.data.nfts || []);
      setStreamingData(streamingRes.data.data || []);
      setStatistics(statsRes.data || {});
      setRevenueData(revenueRes.data || {});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty defaults for testing
      setNfts([]);
      setStreamingData([]);
      setStatistics({});
      setRevenueData({});
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOwnership = async (tokenId, contractAddress) => {
    try {
      await api.post('/nfts/verify-ownership', { tokenId, contractAddress });
      toast.success('NFT ownership verified successfully!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify ownership');
    }
  };

  const handleFetchSpotifyData = async () => {
    try {
      setLoading(true);
      
      // Use test routes if not authenticated, regular routes if authenticated
      const walletAddress = account || localStorage.getItem('walletAddress');
      const basePath = (!isAuthenticated && walletAddress) ? '/test' : '';
      
      // For test mode, trigger auto-fetch which will fetch data
      if (basePath === '/test') {
        const response = await api.get(`${basePath}/streaming/auto-fetch`);
        
        if (response.data.autoFetched && response.data.data) {
          setStreamingData(response.data.data || []);
          toast.success(`✨ Fetched ${response.data.data.length} entries from Spotify API!`);
          await fetchDashboardData();
        } else if (response.data.hasData && response.data.data) {
          setStreamingData(response.data.data || []);
          toast.info('Using cached data');
        } else {
          toast.error(response.data.message || 'Could not fetch data');
        }
      } else {
        // Authenticated mode - use regular endpoint
        const response = await api.post('/spotify/fetch-real-data', {
          timeRange: { days: 30 }
        });
        
        toast.success(response.data.message || 'Real Spotify data fetched successfully!');
        
        // Refresh dashboard data
        await fetchDashboardData();
        
        // Also refresh streaming data
        const streamingResponse = await api.get('/streaming/my-data');
        setStreamingData(streamingResponse.data.data || []);
      }
    } catch (error) {
      console.error('Fetch Spotify data error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch Spotify data. Make sure SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are set in .env');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="loading-container">
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        {!isAuthenticated && isConnected && (
          <div className="test-mode-banner">
            <p>🔧 <strong>Test Mode:</strong> Wallet connected but not fully authenticated. Some features may be limited. 
            Sign in to access all features.</p>
          </div>
        )}
        <div className="dashboard-header">
          <h1>User Dashboard</h1>
          <div className="wallet-display">
            <span className="wallet-label">Wallet:</span>
            <span className="wallet-address">{user?.walletAddress || account || 'Not connected'}</span>
          </div>
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
            My NFTs ({nfts.length})
          </button>
          <button
            className={`tab ${activeTab === 'streaming' ? 'active' : ''}`}
            onClick={() => setActiveTab('streaming')}
          >
            Streaming Data
          </button>
          <button
            className={`tab ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            Revenue
          </button>
        </div>

        <div className="dashboard-body">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total NFTs</h3>
                  <p className="stat-value">{nfts.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Streams</h3>
                  <p className="stat-value">{statistics?.totalStreams || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Estimated Revenue</h3>
                  <p className="stat-value">${(revenueData?.estimatedRevenue || 0).toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h3>Distributed Revenue</h3>
                  <p className="stat-value">${(revenueData?.distributedRevenue || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nfts' && (
            <div className="nfts-tab">
              <button
                className="btn btn-primary"
                onClick={handleFetchSpotifyData}
                style={{ marginBottom: '1rem' }}
              >
                Fetch Spotify Data
              </button>
              <div className="nfts-grid">
                {nfts.length === 0 ? (
                  <div className="empty-state">
                    <h3>No NFTs Found</h3>
                    <p>You don't have any NFTs yet. Here's how to get started:</p>
                    <ul>
                      <li>Mint an NFT from the landing page</li>
                      <li>Or verify ownership of an existing NFT</li>
                      <li>Once you have NFTs, they'll appear here</li>
                    </ul>
                    <p className="test-note">💡 <strong>Test Mode:</strong> You can explore the dashboard even without NFTs!</p>
                  </div>
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
                        <p>Token ID: {nft.tokenId}</p>
                        <p>Streams: {nft.streamingData?.totalStreams || 0}</p>
                        <p>Revenue: ${(nft.streamingData?.totalRevenue || 0).toFixed(2)}</p>
                        <button
                          className="btn btn-small"
                          onClick={() => handleVerifyOwnership(nft.tokenId, nft.contractAddress)}
                        >
                          Verify Ownership
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'streaming' && (
            <div className="streaming-tab">
              <ArtistIDManager onArtistAdded={autoFetchSpotifyData} />
              <div className="streaming-stats">
                <h3>Streaming Statistics</h3>
                {statistics && (
                  <div>
                    <p>Total Streams: {statistics.totalStreams || 0}</p>
                    <p>Total Revenue (Est.): ${(statistics.totalRevenue || 0).toFixed(2)}</p>
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleFetchSpotifyData}
                  disabled={loading}
                  style={{ marginTop: '1rem' }}
                >
                  {loading ? 'Fetching...' : '🔄 Fetch Spotify Data Now'}
                </button>
              </div>
              <div className="streaming-list">
                {streamingData.length === 0 ? (
                  <div className="empty-state">
                    <h3>No Streaming Data Yet</h3>
                    <p>Streaming data will appear here once you:</p>
                    <ul>
                      <li><strong>Add your Spotify Artist ID(s)</strong> using the form above</li>
                      <li>Click the <strong>"Fetch Spotify Data Now"</strong> button above</li>
                      <li>Or wait for automatic fetch when you add artist IDs</li>
                    </ul>
                    <p className="test-note">
                      💡 <strong>Note:</strong> Add your Spotify Artist ID above to fetch real streaming data from your artists! (Testing mode: NFTs not required)
                    </p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Platform</th>
                        <th>Artist</th>
                        <th>Track</th>
                        <th>Streams</th>
                        <th>Listeners</th>
                        <th>Revenue (Est.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {streamingData.slice(0, 50).map((data, index) => (
                        <tr key={index}>
                          <td>{new Date(data.date).toLocaleDateString()}</td>
                          <td>{data.platform || 'spotify'}</td>
                          <td>{data.artistName || '—'}</td>
                          <td>{data.trackName || '—'}</td>
                          <td>{data.streams || 0}</td>
                          <td>{data.listeners || 0}</td>
                          <td>${(data.revenue || 0).toFixed(2)} <span className="estimated-badge">(est.)</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="revenue-tab">
              <div className="revenue-overview">
                <h3>Revenue Overview</h3>
                {revenueData && (
                  <div className="revenue-stats">
                    <div className="revenue-stat">
                      <span>Estimated Revenue</span>
                      <span className="revenue-value">
                        ${revenueData.estimatedRevenue?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="revenue-stat">
                      <span>Distributed Revenue</span>
                      <span className="revenue-value">
                        ${revenueData.distributedRevenue?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="revenue-stat">
                      <span>Pending Revenue</span>
                      <span className="revenue-value">
                        ${((revenueData.estimatedRevenue || 0) - (revenueData.distributedRevenue || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDashboard;
