import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './SpotifyDataViewer.css';

const SpotifyDataViewer = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: 'week', label: '7 Days' },
    { value: 'month', label: '30 Days' },
    { value: 'year', label: '1 Year' }
  ];

  useEffect(() => {
    fetchSpotifyData();
  }, [timeRange]);

  const fetchSpotifyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/streaming-overview?timeRange=${timeRange}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      setError('Failed to load streaming data. Please try again.');
      toast.error('Failed to load streaming data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num?.toLocaleString() || '0';
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toFixed(2) || '0.00'}`;
  };

  if (loading) {
    return (
      <div className="spotify-data-viewer">
        <div className="loading-container">
          <div>Loading Spotify data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="spotify-data-viewer">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchSpotifyData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="spotify-data-viewer">
        <div className="empty-container">
          <p>No streaming data available for the selected time range.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spotify-data-viewer">
      <div className="spotify-header">
        <h2>Spotify Streaming Analytics</h2>
        <div className="time-range-selector">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              className={`time-range-btn ${timeRange === range.value ? 'active' : ''}`}
              onClick={() => setTimeRange(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="spotify-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎵</div>
          <div className="stat-content">
            <h3>Total Streams</h3>
            <p className="stat-value">{formatNumber(data.totalStreams)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Listeners</h3>
            <p className="stat-value">{formatNumber(data.totalListeners)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Playlist Adds</h3>
            <p className="stat-value">{formatNumber(data.totalPlaylistAdds)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <h3>Total Saves</h3>
            <p className="stat-value">{formatNumber(data.totalSaves)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatCurrency(data.totalRevenue)}</p>
          </div>
        </div>
      </div>

      {data.topArtists && data.topArtists.length > 0 && (
        <div className="spotify-section">
          <h3>Top Artists</h3>
          <div className="artists-table">
            <table>
              <thead>
                <tr>
                  <th>Artist</th>
                  <th>Streams</th>
                  <th>Listeners</th>
                  <th>Playlist Adds</th>
                  <th>Saves</th>
                  <th>Revenue</th>
                  <th>Tracks</th>
                </tr>
              </thead>
              <tbody>
                {data.topArtists.map((artist, index) => (
                  <tr key={artist.name}>
                    <td>
                      <strong>#{index + 1}</strong> {artist.name}
                    </td>
                    <td>{formatNumber(artist.streams)}</td>
                    <td>{formatNumber(artist.listeners)}</td>
                    <td>{formatNumber(artist.playlistAdds)}</td>
                    <td>{formatNumber(artist.saves)}</td>
                    <td>{formatCurrency(artist.revenue)}</td>
                    <td>{artist.trackCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.byPlatform && Object.keys(data.byPlatform).length > 0 && (
        <div className="spotify-section">
          <h3>By Platform</h3>
          <div className="platform-stats">
            {Object.entries(data.byPlatform).map(([platform, stats]) => (
              <div key={platform} className="platform-card">
                <h4>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
                <div className="platform-metrics">
                  <div className="metric">
                    <span className="metric-label">Streams:</span>
                    <span className="metric-value">{formatNumber(stats.streams)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Listeners:</span>
                    <span className="metric-value">{formatNumber(stats.listeners)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Playlist Adds:</span>
                    <span className="metric-value">{formatNumber(stats.playlistAdds)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Saves:</span>
                    <span className="metric-value">{formatNumber(stats.saves)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Revenue:</span>
                    <span className="metric-value">{formatCurrency(stats.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.byDate && Object.keys(data.byDate).length > 0 && (
        <div className="spotify-section">
          <h3>Daily Breakdown</h3>
          <div className="daily-chart">
            <div className="chart-container">
              {Object.entries(data.byDate)
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .slice(-30) // Show last 30 days
                .map(([date, stats]) => (
                  <div key={date} className="chart-bar-wrapper">
                    <div className="chart-bar">
                      <div
                        className="bar-fill streams"
                        style={{
                          height: `${Math.min((stats.streams / (data.totalStreams || 1)) * 100, 100)}%`
                        }}
                        title={`Streams: ${formatNumber(stats.streams)}`}
                      />
                    </div>
                    <div className="chart-label">
                      {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyDataViewer;
