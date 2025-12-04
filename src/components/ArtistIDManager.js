import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import './ArtistIDManager.css';

const ArtistIDManager = (props) => {
  const { isAuthenticated } = useAuth();
  const { account } = useWeb3();
  const [artistIds, setArtistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newArtistId, setNewArtistId] = useState('');
  const [newArtistName, setNewArtistName] = useState('');

  useEffect(() => {
    fetchArtistIds();
  }, []);

  const fetchArtistIds = async () => {
    try {
      setLoading(true);
      // Use test routes if not authenticated, regular routes if authenticated
      const walletAddress = account || localStorage.getItem('walletAddress');
      const basePath = (!isAuthenticated && walletAddress) ? '/test' : '';

      const response = await api.get(`${basePath}/users/me/artist-ids`);
      setArtistIds(response.data.artistIds || []);
    } catch (error) {
      console.error('Error fetching artist IDs:', error);
      // Don't show error if it's just a 401 (not authenticated) - that's expected in test mode
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Failed to load artist IDs');
      }
      setArtistIds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArtist = async (e) => {
    e.preventDefault();
    
    if (!newArtistId.trim()) {
      toast.error('Artist ID is required');
      return;
    }

    try {
      setAdding(true);
      // Use test routes if not authenticated, regular routes if authenticated
      const walletAddress = account || localStorage.getItem('walletAddress');
      const basePath = (!isAuthenticated && walletAddress) ? '/test' : '';

      await api.post(`${basePath}/users/me/artist-ids`, {
        artistIds: [{
          artistId: newArtistId.trim(),
          artistName: newArtistName.trim() || null
        }]
      });

      toast.success('Artist ID added successfully! Fetching data...');
      setNewArtistId('');
      setNewArtistName('');
      await fetchArtistIds();
      
      // Trigger data fetch immediately after adding artist ID
      if (props.onArtistAdded) {
        props.onArtistAdded();
      } else {
        // Fallback: reload page to trigger auto-fetch
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error adding artist ID:', error);
      toast.error(error.response?.data?.message || 'Failed to add artist ID');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveArtist = async (artistId) => {
    if (!window.confirm(`Are you sure you want to remove artist ID: ${artistId}?`)) {
      return;
    }

    try {
      // Use test routes if not authenticated, regular routes if authenticated
      const walletAddress = account || localStorage.getItem('walletAddress');
      const basePath = (!isAuthenticated && walletAddress) ? '/test' : '';

      await api.delete(`${basePath}/users/me/artist-ids/${artistId}`);
      toast.success('Artist ID removed successfully');
      fetchArtistIds();
    } catch (error) {
      console.error('Error removing artist ID:', error);
      toast.error(error.response?.data?.message || 'Failed to remove artist ID');
    }
  };

  if (loading) {
    return <div className="artist-id-manager-loading">Loading artist IDs...</div>;
  }

  return (
    <div className="artist-id-manager">
      <h3>Manage Your Spotify Artist IDs</h3>
      <p className="artist-id-description">
        Add your Spotify Artist ID(s) to fetch streaming data. You can add multiple artists.
        <br />
        <small>
          💡 <strong>How to find your Artist ID:</strong> Go to your Spotify artist page, 
          the ID is in the URL: <code>spotify:artist:YOUR_ARTIST_ID</code>
        </small>
      </p>

      <form onSubmit={handleAddArtist} className="artist-id-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="artistId">Spotify Artist ID *</label>
            <input
              id="artistId"
              type="text"
              value={newArtistId}
              onChange={(e) => setNewArtistId(e.target.value)}
              placeholder="e.g., 3TVXtAsR1Inumwj472S9r4"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="artistName">Artist Name (Optional)</label>
            <input
              id="artistName"
              type="text"
              value={newArtistName}
              onChange={(e) => setNewArtistName(e.target.value)}
              placeholder="e.g., Drake"
            />
          </div>
          <div className="form-group form-group-button">
            <button type="submit" className="btn btn-primary" disabled={adding}>
              {adding ? 'Adding...' : 'Add Artist'}
            </button>
          </div>
        </div>
      </form>

      <div className="artist-ids-list">
        <h4>Your Artist IDs ({artistIds.length})</h4>
        {artistIds.length === 0 ? (
          <div className="empty-state">
            <p>No artist IDs added yet. Add your first artist ID above to start fetching streaming data!</p>
          </div>
        ) : (
          <div className="artist-ids-table">
            <table>
              <thead>
                <tr>
                  <th>Artist ID</th>
                  <th>Artist Name</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artistIds.map((artist, index) => (
                  <tr key={index}>
                    <td><code>{artist.artistId}</code></td>
                    <td>{artist.artistName || '—'}</td>
                    <td>{new Date(artist.addedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleRemoveArtist(artist.artistId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistIDManager;

