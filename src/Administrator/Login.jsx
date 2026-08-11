// src/Administrator/Login.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import './admin.css';

export default function Login() {
  const { username, loading, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && username) navigate('/admin/dashboard', { replace: true });
  }, [loading, username, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSigningIn(true);
    try {
      await login(form.username.trim(), form.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-mark">K</div>
          <h1 className="login-title">Kivistone CMS</h1>
          <p className="login-subtitle">Sign in to manage products, categories and site content.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'} />
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="fa-solid fa-triangle-exclamation" />
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary login-submit" disabled={signingIn}>
            {signingIn ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
