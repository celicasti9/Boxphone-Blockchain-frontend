import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import './AdminUserNFTManager.css';

const AdminUserNFTManager = () => {
  const { account, isConnected } = useWeb3();
  const { isAuthenticated } = useAuth();
  const [availableNFTs, setAvailableNFTs] = useState([]);
  const [assignedNFTs, setAssignedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [spotifyClientId, setSpotifyClientId] = useState('');
  const [spotifyClientSecret, setSpotifyClientSecret] = useState('');
  const [spotifyArtistId, setSpotifyArtistId] = useState('');
  const [spotifyArtistName, setSpotifyArtistName] = useState('');
  const [showSpotifyFields, setShowSpotifyFields] = useState(false);

  useEffect(() => {
    fetchAvailableNFTs();
  }, []);

  const fetchAvailableNFTs = async () => {
    try {
      setLoading(true);
      const walletAddress = account || localStorage.getItem('walletAddress');
      const basePath = (!isAuthenticated && walletAddress) ? '/test' : '/admin';
      const testModeParams = (!isAuthenticated && walletAddress) 
        ? { params: { walletAddress } } 
        : {};

      const response = await api.get(`${basePath}/available-nfts`, testModeParams);
      setAvailableNFTs(response.data.available || []);
      setAssignedNFTs(response.data.assigned || []);
    } catch (error) {
      console.error('Error fetching available NFTs:', error);
      toast.error('Failed to load available NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletAddress.trim()) {
      toast.error('Wallet address is required');
      return;
    }
    
    if (!selectedTokenId) {
      toast.error('Please select an NFT to assign');
      return;
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
      toast.error('Invalid wallet address format');
      return;
    }

    try {
      setSubmitting(true);
      const walletAddressParam = account || localStorage.getItem('walletAddress');
      const basePath = (!isAuthenticated && walletAddressParam) ? '/test' : '/admin';
      const testModeParams = (!isAuthenticated && walletAddressParam) 
        ? { params: { walletAddress: walletAddressParam } } 
        : {};

      const payload = {
        walletAddress: walletAddress.trim(),
        tokenId: parseInt(selectedTokenId)
      };

      if (showSpotifyFields) {
        if (spotifyClientId.trim()) {
          payload.spotifyClientId = spotifyClientId.trim();
        }
        if (spotifyClientSecret.trim()) {
          payload.spotifyClientSecret = spotifyClientSecret.trim();
        }
      }

      // Add Spotify Artist information for real data fetching
      if (spotifyArtistId.trim()) {
        payload.spotifyArtistId = spotifyArtistId.trim();
      }
      if (spotifyArtistName.trim()) {
        payload.spotifyArtistName = spotifyArtistName.trim();
      }

      const response = await api.post(
        `${basePath}/users/create-and-assign`,
        payload,
        testModeParams
      );

      toast.success(response.data.message || 'User created and NFT assigned successfully');
      
      // Reset form
      setWalletAddress('');
      setSelectedTokenId('');
      setSpotifyClientId('');
      setSpotifyClientSecret('');
      setShowSpotifyFields(false);
      
      // Refresh data
      fetchAvailableNFTs();
    } catch (error) {
      console.error('Error creating user and assigning NFT:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user and assign NFT';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async (tokenId, newWalletAddress) => {
    if (!newWalletAddress || !/^0x[a-fA-F0-9]{40}$/.test(newWalletAddress.trim())) {
      toast.error('Invalid wallet address format');
      return;
    }

    try {
      const walletAddressParam = account || localStorage.getItem('walletAddress');
      const basePath = (!isAuthenticated && walletAddressParam) ? '/test' : '/admin';
      const testModeParams = (!isAuthenticated && walletAddressParam) 
        ? { params: { walletAddress: walletAddressParam } } 
        : {};

      await api.put(
        `${basePath}/nfts/${tokenId}/reassign`,
        { walletAddress: newWalletAddress.trim() },
        testModeParams
      );

      toast.success('NFT reassigned successfully');
      fetchAvailableNFTs();
    } catch (error) {
      console.error('Error reassigning NFT:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reassign NFT';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="user-nft-manager">
        <div className="loading-container">
          <div>Loading NFT data...</div>
        </div>
      </div>
    );
  }

  const stats = {
    total: 1000,
    available: availableNFTs.length,
    assigned: assignedNFTs.length
  };

  return (
    <div className="user-nft-manager">
      <div className="manager-header">
        <h2>User & NFT Management</h2>
        <div className="stats-badge">
          <span className="stat-item">
            <strong>Total:</strong> {stats.total}
          </span>
          <span className="stat-item">
            <strong>Available:</strong> {stats.available}
          </span>
          <span className="stat-item">
            <strong>Assigned:</strong> {stats.assigned}
          </span>
        </div>
      </div>

      <div className="manager-content">
        {/* Add User & Assign NFT Form */}
        <div className="form-section">
          <h3>Add User & Assign NFT</h3>
          <form onSubmit={handleSubmit} className="assignment-form">
            <div className="form-group">
              <label htmlFor="walletAddress">Wallet Address *</label>
              <input
                id="walletAddress"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tokenId">Select Boxphone NFT (1-1000) *</label>
              <select
                id="tokenId"
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                required
                className="form-select"
              >
                <option value="">-- Select NFT --</option>
                {availableNFTs.slice(0, 100).map((tokenId) => (
                  <option key={tokenId} value={tokenId}>
                    Boxphone #{tokenId}
                  </option>
                ))}
                {availableNFTs.length > 100 && (
                  <option disabled>
                    ... and {availableNFTs.length - 100} more
                  </option>
                )}
              </select>
              {availableNFTs.length === 0 && (
                <p className="form-hint">No available NFTs. All 1000 NFTs are assigned.</p>
              )}
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={showSpotifyFields}
                  onChange={(e) => setShowSpotifyFields(e.target.checked)}
                />
                <span>Add Spotify API Keys (Optional)</span>
              </label>
            </div>

            {showSpotifyFields && (
              <>
                <div className="form-group">
                  <label htmlFor="spotifyClientId">Spotify Client ID</label>
                  <input
                    id="spotifyClientId"
                    type="text"
                    value={spotifyClientId}
                    onChange={(e) => setSpotifyClientId(e.target.value)}
                    placeholder="Your Spotify Client ID"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="spotifyClientSecret">Spotify Client Secret</label>
                  <input
                    id="spotifyClientSecret"
                    type="password"
                    value={spotifyClientSecret}
                    onChange={(e) => setSpotifyClientSecret(e.target.value)}
                    placeholder="Your Spotify Client Secret"
                    className="form-input"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting || availableNFTs.length === 0}
              className="submit-btn"
            >
              {submitting ? 'Creating...' : 'Create User & Assign NFT'}
            </button>
          </form>
        </div>

        {/* Assigned NFTs Table */}
        <div className="assigned-section">
          <h3>Assigned NFTs ({assignedNFTs.length})</h3>
          {assignedNFTs.length === 0 ? (
            <div className="empty-state">
              <p>No NFTs assigned yet.</p>
            </div>
          ) : (
            <div className="assigned-table-container">
              <table className="assigned-table">
                <thead>
                  <tr>
                    <th>Token ID</th>
                    <th>Owner Wallet</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedNFTs.map((nft) => (
                    <AssignedNFTRow
                      key={nft.tokenId}
                      nft={nft}
                      onReassign={handleReassign}
                      isAuthenticated={isAuthenticated}
                      account={account}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Separate component for NFT row with reassign functionality
const AssignedNFTRow = ({ nft, onReassign, isAuthenticated, account }) => {
  const [showReassign, setShowReassign] = useState(false);
  const [newWallet, setNewWallet] = useState('');

  const handleReassignClick = () => {
    if (newWallet.trim() && /^0x[a-fA-F0-9]{40}$/.test(newWallet.trim())) {
      onReassign(nft.tokenId, newWallet);
      setNewWallet('');
      setShowReassign(false);
    }
  };

  return (
    <tr>
      <td>
        <strong>#{nft.tokenId}</strong>
      </td>
      <td>
        <code className="wallet-address">{nft.owner}</code>
      </td>
      <td>
        {!showReassign ? (
          <button
            onClick={() => setShowReassign(true)}
            className="reassign-btn"
          >
            Reassign
          </button>
        ) : (
          <div className="reassign-input-group">
            <input
              type="text"
              value={newWallet}
              onChange={(e) => setNewWallet(e.target.value)}
              placeholder="New wallet address"
              className="reassign-input"
            />
            <button
              onClick={handleReassignClick}
              className="confirm-btn"
              disabled={!newWallet.trim()}
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setShowReassign(false);
                setNewWallet('');
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default AdminUserNFTManager;

