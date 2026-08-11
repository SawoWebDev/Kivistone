// src/Administrator/Profile.jsx
import { useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';

export default function Profile() {
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/api/admin/profile');
        setUsername(data.username || '');
        setDisplayName(data.display_name || '');
      } catch (err) {
        setLoadError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setInfoSaving(true);
    setInfoError('');
    setInfoSuccess(false);
    try {
      await api.put('/api/admin/profile', { display_name: displayName.trim() || null });
      await refresh();
      setInfoSuccess(true);
    } catch (err) {
      setInfoError(err.message || 'Failed to save changes');
    } finally {
      setInfoSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwSaving(true);
    try {
      await api.put('/api/admin/profile/password', { current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwSuccess(true);
    } catch (err) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-content-loading"><i className="fa-solid fa-circle-notch fa-spin" /></div>;
  }

  return (
    <div className="profile-page">
      {loadError && <div className="alert alert-error"><i className="fa-solid fa-triangle-exclamation" />{loadError}</div>}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><i className="fa-solid fa-user" /> Personal info</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSaveInfo} className="admin-form">
            {infoError && <div className="alert alert-error"><i className="fa-solid fa-triangle-exclamation" />{infoError}</div>}
            {infoSuccess && <div className="alert alert-success"><i className="fa-solid fa-circle-check" /> Saved.</div>}

            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={username} disabled />
              <p className="form-helper">Username can't be changed.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Display name</label>
              <input className="form-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Shown in the sidebar" />
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-primary" disabled={infoSaving}>{infoSaving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><i className="fa-solid fa-lock" /> Change password</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleChangePassword} className="admin-form">
            {pwError && <div className="alert alert-error"><i className="fa-solid fa-triangle-exclamation" />{pwError}</div>}
            {pwSuccess && <div className="alert alert-success"><i className="fa-solid fa-circle-check" /> Password updated.</div>}

            <div className="form-group">
              <label className="form-label">Current password</label>
              <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New password</label>
                <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />
              </div>
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-primary" disabled={pwSaving}>{pwSaving ? 'Updating…' : 'Update Password'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
