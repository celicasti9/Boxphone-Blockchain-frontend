import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './AdminAPIKeyManager.css';

const AdminAPIKeyManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHasApiKey, setFilterHasApiKey] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ spotifyApiKey: '', spotifyRefreshToken: '' });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUpdates, setBulkUpdates] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm, filterHasApiKey]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterHasApiKey !== 'all' && { hasApiKey: filterHasApiKey })
      });

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.walletAddress);
    setEditForm({
      spotifyApiKey: '',
      spotifyRefreshToken: ''
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ spotifyApiKey: '', spotifyRefreshToken: '' });
  };

  const handleSave = async (walletAddress) => {
    try {
      const response = await api.put(`/admin/users/${walletAddress}/api-keys`, {
        spotifyApiKey: editForm.spotifyApiKey || null,
        spotifyRefreshToken: editForm.spotifyRefreshToken || null
      });

      toast.success('API keys updated successfully');
      setEditingUser(null);
      setEditForm({ spotifyApiKey: '', spotifyRefreshToken: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating API keys:', error);
      toast.error(error.response?.data?.message || 'Failed to update API keys');
    }
  };

  const handleClearApiKeys = async (walletAddress) => {
    if (!window.confirm('Are you sure you want to clear API keys for this user?')) {
      return;
    }

    try {
      await api.put(`/admin/users/${walletAddress}/api-keys`, {
        spotifyApiKey: '',
        spotifyRefreshToken: ''
      });

      toast.success('API keys cleared successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error clearing API keys:', error);
      toast.error('Failed to clear API keys');
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkUpdates.length === 0) {
      toast.warning('No updates to process');
      return;
    }

    if (!window.confirm(`Are you sure you want to update ${bulkUpdates.length} users?`)) {
      return;
    }

    try {
      const response = await api.post('/admin/users/bulk-update-api-keys', {
        updates: bulkUpdates
      });

      toast.success(response.data.message);
      setBulkMode(false);
      setBulkUpdates([]);
      fetchUsers();
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast.error(error.response?.data?.message || 'Bulk update failed');
    }
  };

  const addBulkUpdate = (walletAddress, spotifyApiKey, spotifyRefreshToken) => {
    const existingIndex = bulkUpdates.findIndex(u => u.walletAddress === walletAddress);
    const update = {
      walletAddress,
      ...(spotifyApiKey && { spotifyApiKey }),
      ...(spotifyRefreshToken && { spotifyRefreshToken })
    };

    if (existingIndex >= 0) {
      const newUpdates = [...bulkUpdates];
      newUpdates[existingIndex] = { ...newUpdates[existingIndex], ...update };
      setBulkUpdates(newUpdates);
    } else {
      setBulkUpdates([...bulkUpdates, update]);
    }
  };

  return (
    <div className="api-key-manager">
      <div className="api-key-manager-header">
        <h2>API Key Management</h2>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setBulkMode(!bulkMode);
              setBulkUpdates([]);
            }}
          >
            {bulkMode ? 'Exit Bulk Mode' : 'Bulk Update Mode'}
          </button>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by wallet address..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="search-input"
        />
        <select
          value={filterHasApiKey}
          onChange={(e) => {
            setFilterHasApiKey(e.target.value);
            setPage(1);
          }}
          className="filter-select"
        >
          <option value="all">All Users</option>
          <option value="true">Has API Keys</option>
          <option value="false">No API Keys</option>
        </select>
      </div>

      {bulkMode && bulkUpdates.length > 0 && (
        <div className="bulk-update-banner">
          <p>{bulkUpdates.length} user(s) queued for bulk update</p>
          <button className="btn btn-primary" onClick={handleBulkUpdate}>
            Apply Bulk Update
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Wallet Address</th>
                  <th>NFTs Owned</th>
                  <th>API Key Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td className="wallet-cell">
                        <code>{user.walletAddress}</code>
                      </td>
                      <td>
                        {user.nftsOwned?.length || 0} NFT{(user.nftsOwned?.length || 0) !== 1 ? 's' : ''}
                        {user.nftsOwned?.length > 0 && (
                          <div className="nft-tooltip">
                            {user.nftsOwned.map((nft, idx) => (
                              <span key={idx}>#{nft.tokenId} </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        {editingUser === user.walletAddress ? (
                          <div className="edit-form">
                            <input
                              type="text"
                              placeholder="Spotify API Key"
                              value={editForm.spotifyApiKey}
                              onChange={(e) => setEditForm({ ...editForm, spotifyApiKey: e.target.value })}
                              className="form-input"
                            />
                            <input
                              type="text"
                              placeholder="Spotify Refresh Token"
                              value={editForm.spotifyRefreshToken}
                              onChange={(e) => setEditForm({ ...editForm, spotifyRefreshToken: e.target.value })}
                              className="form-input"
                            />
                          </div>
                        ) : (
                          <div className="api-key-status">
                            <span className={`status-badge ${user.hasSpotifyApiKey ? 'has-key' : 'no-key'}`}>
                              {user.hasSpotifyApiKey ? '✓ API Key' : '✗ No API Key'}
                            </span>
                            <span className={`status-badge ${user.hasSpotifyRefreshToken ? 'has-key' : 'no-key'}`}>
                              {user.hasSpotifyRefreshToken ? '✓ Refresh Token' : '✗ No Token'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="actions-cell">
                        {editingUser === user.walletAddress ? (
                          <div className="edit-actions">
                            <button
                              className="btn btn-small btn-primary"
                              onClick={() => handleSave(user.walletAddress)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-small btn-secondary"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button
                              className="btn btn-small btn-primary"
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </button>
                            {user.hasSpotifyApiKey && (
                              <button
                                className="btn btn-small btn-danger"
                                onClick={() => handleClearApiKeys(user.walletAddress)}
                              >
                                Clear
                              </button>
                            )}
                            {bulkMode && (
                              <button
                                className="btn btn-small btn-secondary"
                                onClick={() => addBulkUpdate(user.walletAddress, '', '')}
                              >
                                Add to Bulk
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              className="btn btn-secondary"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAPIKeyManager;
