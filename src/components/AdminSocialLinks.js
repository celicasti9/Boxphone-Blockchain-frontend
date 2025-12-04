import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import './AdminSocialLinks.css';

const AdminSocialLinks = () => {
  const [links, setLinks] = useState({
    telegram: '',
    instagram: '',
    binance: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/site-settings');
      setLinks(response.data.links || {
        telegram: '',
        instagram: '',
        binance: ''
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load social links');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/admin/site-settings', {
        socialLinks: links
      });
      toast.success('Social links updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update social links');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading social links...</div>;
  }

  return (
    <div className="admin-social-links">
      <h2>Manage Social Links</h2>
      <p className="description">Update social media links that appear in the footer</p>

      <div className="links-form">
        <div className="form-group">
          <label htmlFor="telegram">Telegram URL</label>
          <input
            type="url"
            id="telegram"
            value={links.telegram}
            onChange={(e) => setLinks({ ...links, telegram: e.target.value })}
            placeholder="https://t.me/phonestream"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="instagram">Instagram URL</label>
          <input
            type="url"
            id="instagram"
            value={links.instagram}
            onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
            placeholder="https://instagram.com/phonestream"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="binance">Binance URL</label>
          <input
            type="url"
            id="binance"
            value={links.binance}
            onChange={(e) => setLinks({ ...links, binance: e.target.value })}
            placeholder="https://binance.com/en/trade/..."
            className="form-input"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Social Links'}
        </button>
      </div>
    </div>
  );
};

export default AdminSocialLinks;
