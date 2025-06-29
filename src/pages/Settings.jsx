import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSettings, FiSave, FiShield, FiUser, FiMail, FiPhone, FiClock, FiBell, FiTrash2, FiInstagram } from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
  // General settings state
  const [settings, setSettings] = useState({
    gym_name: '',
    contact_email: '',
    contact_phone: '',
    opening_hours: '',
    notifications_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');

  // Admin creation state
  const [adminExists, setAdminExists] = useState(true);
  const [createAdmin, setCreateAdmin] = useState({ username: '', passkey: '', confirm_passkey: '' });
  const [createMsg, setCreateMsg] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Admin passkey change state
  const [changePass, setChangePass] = useState({ username: '', old_passkey: '', new_passkey: '', confirm_passkey: '' });
  const [changeMsg, setChangeMsg] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);

  // Reset passkey state
  const [showReset, setShowReset] = useState(false);
  const [resetData, setResetData] = useState({ username: '', new_passkey: '', confirm_passkey: '' });
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Reset admin state
  const [showResetAdmin, setShowResetAdmin] = useState(false);
  const [resetAdminData, setResetAdminData] = useState({ username: '', passkey: '' });
  const [resetAdminMsg, setResetAdminMsg] = useState('');
  const [resetAdminLoading, setResetAdminLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkAdminExists();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/settings');
      setSettings({ ...settings, ...res.data });
    } catch (err) {
      setSaveMsg('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const checkAdminExists = async () => {
    try {
      const res = await axios.get('/api/settings/admin/exists');
      setAdminExists(res.data.exists);
    } catch {
      setAdminExists(true); // fallback: assume exists
    }
  };

  const handleSettingsChange = e => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSettingsSave = async e => {
    e.preventDefault();
    setSaveMsg('');
    try {
      await axios.post('/api/settings', settings);
      setSaveMsg('Settings saved!');
    } catch (err) {
      setSaveMsg('Failed to save settings.');
    }
  };

  // Admin creation logic
  const handleCreateAdmin = async e => {
    e.preventDefault();
    setCreateMsg('');
    if (createAdmin.passkey !== createAdmin.confirm_passkey) {
      setCreateMsg('Pass keys do not match.');
      return;
    }
    setCreateLoading(true);
    try {
      await axios.post('/api/settings/admin/create', {
        username: createAdmin.username,
        passkey: createAdmin.passkey,
      });
      setCreateMsg('Admin created successfully!');
      setAdminExists(true);
    } catch (err) {
      setCreateMsg(err.response?.data?.error || 'Failed to create admin.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Reset admin logic
  const handleResetAdmin = async e => {
    e.preventDefault();
    setResetAdminMsg('');
    
    if (!resetAdminData.username || !resetAdminData.passkey) {
      setResetAdminMsg('Please enter both admin username and passkey.');
      return;
    }
    
    setResetAdminLoading(true);
    try {
      // First verify the admin credentials
      const verifyResponse = await axios.post('/api/settings/admin/verify-passkey', {
        username: resetAdminData.username,
        passkey: resetAdminData.passkey
      });
      
      if (verifyResponse.data.success) {
        // If verification successful, proceed with reset
        await axios.delete('/api/settings/admin/reset');
        setResetAdminMsg('Admin has been reset successfully! You can now create a new admin.');
        setAdminExists(false);
        setShowResetAdmin(false);
        setResetAdminData({ username: '', passkey: '' });
      } else {
        setResetAdminMsg('Invalid admin credentials. Please check your username and passkey.');
      }
    } catch (err) {
      setResetAdminMsg(err.response?.data?.error || 'Failed to reset admin. Please verify your credentials.');
    } finally {
      setResetAdminLoading(false);
    }
  };

  // Admin passkey change logic
  const handleChangePass = async e => {
    e.preventDefault();
    setChangeMsg('');
    if (changePass.new_passkey !== changePass.confirm_passkey) {
      setChangeMsg('New pass keys do not match.');
      return;
    }
    setChangeLoading(true);
    try {
      await axios.post('/api/settings/admin/change-passkey', {
        username: changePass.username,
        old_passkey: changePass.old_passkey,
        new_passkey: changePass.new_passkey,
      });
      setChangeMsg('Pass key changed successfully!');
      setChangePass({ username: '', old_passkey: '', new_passkey: '', confirm_passkey: '' });
    } catch (err) {
      setChangeMsg(err.response?.data?.error || 'Failed to change pass key.');
    } finally {
      setChangeLoading(false);
    }
  };

  // Reset passkey logic
  const handleReset = async e => {
    e.preventDefault();
    setResetMsg('');
    if (resetData.new_passkey !== resetData.confirm_passkey) {
      setResetMsg('New pass keys do not match.');
      return;
    }
    setResetLoading(true);
    try {
      await axios.post('/api/settings/admin/reset-passkey', {
        username: resetData.username,
        new_passkey: resetData.new_passkey,
      });
      setResetMsg('Pass key reset successfully!');
      setResetData({ username: '', new_passkey: '', confirm_passkey: '' });
    } catch (err) {
      setResetMsg(err.response?.data?.error || 'Failed to reset pass key.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="settings-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Settings & Configuration</h1>
          <p>Manage your gym's settings and administrative access.</p>
        </div>
        <div className="hero-actions">
          <FiSettings size={24} />
        </div>
      </div>

      <div className="settings-grid">
        {/* Admin Creation Section (only if no admin exists) */}
        {!adminExists && (
          <div className="settings-card">
            <h3>Create Admin (First Time Setup)</h3>
            <form onSubmit={handleCreateAdmin}>
              <div className="form-group">
                <label htmlFor="create-username">Admin Username</label>
                <input 
                  id="create-username"
                  name="username"
                  className="modal-input"
                  value={createAdmin.username} 
                  onChange={e => setCreateAdmin(p => ({ ...p, username: e.target.value }))} 
                  placeholder="Enter admin username" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="create-passkey">Pass Key</label>
                <input 
                  id="create-passkey"
                  name="passkey" 
                  className="modal-input"
                  value={createAdmin.passkey} 
                  onChange={e => setCreateAdmin(p => ({ ...p, passkey: e.target.value }))} 
                  placeholder="Enter pass key" 
                  type="password" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="create-confirm-passkey">Confirm Pass Key</label>
                <input 
                  id="create-confirm-passkey"
                  name="confirm_passkey" 
                  className="modal-input"
                  value={createAdmin.confirm_passkey} 
                  onChange={e => setCreateAdmin(p => ({ ...p, confirm_passkey: e.target.value }))} 
                  placeholder="Confirm pass key" 
                  type="password" 
                />
              </div>
              <button type="submit" className="btn" disabled={createLoading}>
                <FiShield />
                {createLoading ? 'Creating...' : 'Create Admin'}
              </button>
              {createMsg && <div className={`message ${createMsg.includes('Failed') ? 'error' : 'success'}`}>{createMsg}</div>}
            </form>
          </div>
        )}

        {/* General Settings Card */}
        <div className="settings-card">
          <h3>General Settings</h3>
          <form onSubmit={handleSettingsSave}>
            <div className="form-group">
              <label htmlFor="gym-name">Gym Name</label>
              <input 
                id="gym-name"
                name="gym_name" 
                className="modal-input"
                value={settings.gym_name} 
                onChange={handleSettingsChange} 
                placeholder="Enter gym name" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">Contact Email</label>
              <input 
                id="contact-email"
                name="contact_email" 
                className="modal-input"
                value={settings.contact_email} 
                onChange={handleSettingsChange} 
                placeholder="Enter contact email" 
                type="email" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-phone">Contact Phone</label>
              <input 
                id="contact-phone"
                name="contact_phone" 
                className="modal-input"
                value={settings.contact_phone} 
                onChange={handleSettingsChange} 
                placeholder="Enter contact phone" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="opening-hours">Opening Hours</label>
              <textarea 
                id="opening-hours"
                name="opening_hours" 
                value={settings.opening_hours} 
                onChange={handleSettingsChange} 
                placeholder="Enter opening hours" 
                rows="3"
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input 
                  name="notifications_enabled" 
                  type="checkbox" 
                  checked={settings.notifications_enabled} 
                  onChange={handleSettingsChange} 
                />
                Enable Notifications
              </label>
            </div>
            <button type="submit" className="btn" disabled={loading}>
              <FiSave />
              {loading ? 'Loading...' : 'Save Settings'}
            </button>
            {saveMsg && <div className={`message ${saveMsg.includes('Failed') ? 'error' : 'success'}`}>{saveMsg}</div>}
          </form>
        </div>

        {/* Contact Information Card */}
        <div className="settings-card">
          <h3>Contact Information</h3>
          <div className="contact-info-section">
            <a 
              href="https://www.instagram.com/solsparrow.co?igsh=OTR4cjNld3Zvdms4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-item"
            >
              <FiInstagram className="contact-icon" />
              <div className="contact-details">
                <h4>Instagram</h4>
              </div>
            </a>
            <a 
              href="mailto:Solsparrowhq@gmail.com" 
              className="contact-item"
            >
              <FiMail className="contact-icon" />
              <div className="contact-details">
                <h4>Email</h4>
              </div>
            </a>
            <div className="contact-item">
              <FiPhone className="contact-icon" />
              <div className="contact-details">
                <h4>Phone 1 (Hyderabad)</h4>
                <span className="contact-text">+91 90591 71196</span>
              </div>
            </div>
            <div className="contact-item">
              <FiPhone className="contact-icon" />
              <div className="contact-details">
                <h4>Phone 2 (Pune)</h4>
                <span className="contact-text">+91 63595 52530</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Pass Key Change Card */}
        {adminExists && (
          <div className="settings-card">
            <h3>Admin Pass Key</h3>
            <form onSubmit={handleChangePass}>
              <div className="form-group">
                <label htmlFor="change-username">Admin Username</label>
                <input 
                  id="change-username"
                  name="username" 
                  className="modal-input"
                  value={changePass.username} 
                  onChange={e => setChangePass(p => ({ ...p, username: e.target.value }))} 
                  placeholder="Enter admin username" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="old-passkey">Old Pass Key</label>
                <input 
                  id="old-passkey"
                  name="old_passkey" 
                  className="modal-input"
                  value={changePass.old_passkey} 
                  onChange={e => setChangePass(p => ({ ...p, old_passkey: e.target.value }))} 
                  placeholder="Enter old pass key" 
                  type="password" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-passkey">New Pass Key</label>
                <input 
                  id="new-passkey"
                  name="new_passkey" 
                  className="modal-input"
                  value={changePass.new_passkey} 
                  onChange={e => setChangePass(p => ({ ...p, new_passkey: e.target.value }))} 
                  placeholder="Enter new pass key" 
                  type="password" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-new-passkey">Confirm New Pass Key</label>
                <input 
                  id="confirm-new-passkey"
                  name="confirm_passkey" 
                  className="modal-input"
                  value={changePass.confirm_passkey} 
                  onChange={e => setChangePass(p => ({ ...p, confirm_passkey: e.target.value }))} 
                  placeholder="Confirm new pass key" 
                  type="password" 
                />
              </div>
              <button type="submit" className="btn" disabled={changeLoading}>
                <FiShield />
                {changeLoading ? 'Saving...' : 'Change Pass Key'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowReset(true)}>
                <FiShield />
                Reset Pass Key
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setShowResetAdmin(true)}>
                <FiTrash2 />
                Reset Admin
              </button>
              {changeMsg && <div className={`message ${changeMsg.includes('Failed') || changeMsg.includes('incorrect') ? 'error' : 'success'}`}>{changeMsg}</div>}
            </form>
          </div>
        )}
      </div>

      {/* Reset Passkey Modal */}
      {showReset && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reset Pass Key</h3>
            <p className="warning-text">⚠️ This will reset the admin passkey without requiring the old passkey. Use with caution!</p>
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label htmlFor="reset-username">Admin Username</label>
                <input 
                  id="reset-username"
                  name="username" 
                  className="modal-input"
                  value={resetData.username} 
                  onChange={e => setResetData(p => ({ ...p, username: e.target.value }))} 
                  placeholder="Enter admin username" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="reset-new-passkey">New Pass Key</label>
                <input 
                  id="reset-new-passkey"
                  name="new_passkey" 
                  className="modal-input"
                  value={resetData.new_passkey} 
                  onChange={e => setResetData(p => ({ ...p, new_passkey: e.target.value }))} 
                  placeholder="Enter new pass key" 
                  type="password" 
                />
              </div>
              <div className="form-group">
                <label htmlFor="reset-confirm-passkey">Confirm New Pass Key</label>
                <input 
                  id="reset-confirm-passkey"
                  name="confirm_passkey" 
                  className="modal-input"
                  value={resetData.confirm_passkey} 
                  onChange={e => setResetData(p => ({ ...p, confirm_passkey: e.target.value }))} 
                  placeholder="Confirm new pass key" 
                  type="password" 
                />
              </div>
              <button type="submit" className="btn" disabled={resetLoading}>
                <FiShield />
                {resetLoading ? 'Saving...' : 'Reset Pass Key'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowReset(false)}>
                Cancel
              </button>
              {resetMsg && <div className={`message ${resetMsg.includes('Failed') ? 'error' : 'success'}`}>{resetMsg}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Reset Admin Modal */}
      {showResetAdmin && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reset Admin</h3>
            <p className="danger-text">🚨 DANGER: This will completely delete the existing admin account. You will need to create a new admin to access the system again!</p>
            <p className="warning-text">⚠️ Please enter your current admin credentials to confirm this action.</p>
            <form onSubmit={handleResetAdmin}>
              <div className="form-group">
                <label htmlFor="reset-admin-username">Admin Username</label>
                <input 
                  id="reset-admin-username"
                  name="username" 
                  className="modal-input"
                  value={resetAdminData.username} 
                  onChange={e => setResetAdminData(p => ({ ...p, username: e.target.value }))} 
                  placeholder="Enter admin username" 
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reset-admin-passkey">Admin Passkey</label>
                <input 
                  id="reset-admin-passkey"
                  name="passkey" 
                  className="modal-input"
                  value={resetAdminData.passkey} 
                  onChange={e => setResetAdminData(p => ({ ...p, passkey: e.target.value }))} 
                  placeholder="Enter admin passkey" 
                  type="password"
                  required
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn btn-danger" 
                  disabled={resetAdminLoading}
                >
                  <FiTrash2 />
                  {resetAdminLoading ? 'Verifying...' : 'Reset Admin'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowResetAdmin(false);
                    setResetAdminData({ username: '', passkey: '' });
                    setResetAdminMsg('');
                  }}
                  disabled={resetAdminLoading}
                >
                  Cancel
                </button>
              </div>
              {resetAdminMsg && <div className={`message ${resetAdminMsg.includes('Failed') || resetAdminMsg.includes('Invalid') ? 'error' : 'success'}`}>{resetAdminMsg}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 