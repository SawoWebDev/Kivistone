// src/Administrator/Users.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import { getCache, setCache } from './adminCache.js';
import { useAuth } from './AuthContext.jsx';

const CACHE_KEY = 'users:v1';

const EMPTY_FORM = { username: '', display_name: '', password: '', confirm_password: '' };

function toForm(user) {
  return { username: user.username || '', display_name: user.display_name || '', password: '', confirm_password: '' };
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function UserForm({ initial, isNew, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const usernameValid = /^[a-z0-9._-]{3,32}$/.test(form.username);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isNew && !usernameValid) {
      setError('Username must be 3-32 lowercase letters, numbers, dots, underscores or hyphens.');
      return;
    }
    if ((isNew || form.password) && form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {error && <div className="alert alert-error"><i className="fa-solid fa-triangle-exclamation" />{error}</div>}

      <div className="form-group">
        <label className="form-label">Username</label>
        <input
          className="form-input"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
          disabled={!isNew}
          required
        />
        {isNew && !usernameValid && form.username && (
          <p className="form-helper form-helper--error">3-32 lowercase letters, numbers, dots, underscores or hyphens.</p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Display name <span className="form-label-optional">(optional)</span></label>
        <input className="form-input" value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{isNew ? 'Password' : 'New password'} {!isNew && <span className="form-label-optional">(leave blank to keep current)</span>}</label>
          <input type="password" className="form-input" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} autoComplete="new-password" />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm password</label>
          <input type="password" className="form-input" value={form.confirm_password} onChange={(e) => setForm((f) => ({ ...f, confirm_password: e.target.value }))} autoComplete="new-password" />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save User'}</button>
      </div>
    </form>
  );
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString();
}

export default function Users() {
  const { username: myUsername } = useAuth();
  const cached = getCache(CACHE_KEY);
  const [users, setUsers] = useState(cached || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState(null); // null | 'new' | user object
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!getCache(CACHE_KEY)) setLoading(true);
    setError('');
    try {
      const rows = await api.get('/api/admin/users');
      setUsers(rows || []);
      setCache(CACHE_KEY, rows || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    if (modalMode === 'new') {
      await api.post('/api/admin/users', {
        username: form.username.trim(),
        display_name: form.display_name.trim() || null,
        password: form.password,
      });
    } else {
      const payload = { display_name: form.display_name.trim() || null };
      if (form.password) payload.password = form.password;
      await api.put(`/api/admin/users/${modalMode.id}`, payload);
    }
    setCache(CACHE_KEY, null);
    setModalMode(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.del(`/api/admin/users/${deleteTarget.id}`);
      setCache(CACHE_KEY, null);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) => u.username.toLowerCase().includes(q) || (u.display_name || '').toLowerCase().includes(q));
  }, [users, search]);

  return (
    <div className="users-page">
      <div className="toolbar">
        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" />
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModalMode('new')}>
          <i className="fa-solid fa-plus" /> New User
        </button>
      </div>

      {error && <div className="alert alert-error"><i className="fa-solid fa-triangle-exclamation" />{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <div className="table-loading"><i className="fa-solid fa-circle-notch fa-spin" /> Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No users match the current search.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Display name</th>
                <th>Username</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.display_name || <span className="text-muted">-</span>}</td>
                  <td className="text-muted">@{u.username}</td>
                  <td className="text-muted">{formatDate(u.created_at)}</td>
                  <td>
                    <div className="table-row-actions">
                      <button type="button" className="icon-btn" onClick={() => setModalMode(u)} title="Edit"><i className="fa-solid fa-pen" /></button>
                      {u.username !== myUsername && (
                        <button type="button" className="icon-btn danger" onClick={() => setDeleteTarget(u)} title="Delete"><i className="fa-solid fa-trash" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!modalMode} title={modalMode === 'new' ? 'New User' : `Edit @${modalMode?.username || ''}`} onClose={() => setModalMode(null)}>
        {modalMode && (
          <UserForm
            initial={modalMode === 'new' ? EMPTY_FORM : toForm(modalMode)}
            isNew={modalMode === 'new'}
            onCancel={() => setModalMode(null)}
            onSave={handleSave}
          />
        )}
      </Modal>

      <Modal open={!!deleteTarget} title="Delete User" onClose={() => setDeleteTarget(null)}>
        <p className="confirm-msg">
          Are you sure you want to delete <strong>@{deleteTarget?.username}</strong>? This cannot be undone.
        </p>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
