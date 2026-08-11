// src/Administrator/AdminLayout.jsx
import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import './admin.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'fa-solid fa-gauge-high' },
  { to: '/admin/products', label: 'Products', icon: 'fa-solid fa-box' },
  { to: '/admin/categories', label: 'Categories', icon: 'fa-solid fa-layer-group' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'fa-solid fa-chart-line' },
  { to: '/admin/logs', label: 'Logs', icon: 'fa-solid fa-file-lines' },
];

export default function AdminLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const current = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));
  const initial = (username || '?').charAt(0).toUpperCase();

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <button
          type="button"
          className="admin-topbar-hamburger"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <i className={sidebarOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'} />
        </button>
        <span className="admin-topbar-title">{current ? current.label : 'Admin'}</span>
      </header>

      <div
        className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/" target="_blank" rel="noopener noreferrer" className="sidebar-brand-link">
            <span className="sidebar-brand-name">
              <span className="logo-text">Kivi<span className="logo-stone">stone</span></span>
            </span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <i className={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            <div className="sidebar-footer-avatar">{initial}</div>
            <div className="sidebar-footer-user">
              <div className="sidebar-footer-username">{username}</div>
              <div className="sidebar-footer-role">Administrator</div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost sidebar-logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket fa-flip-horizontal" />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-page-header">
          <h1 className="admin-page-title">{current ? current.label : 'Admin'}</h1>
        </div>
        <div className="admin-main-content">
          <Suspense fallback={<div className="admin-content-loading"><i className="fa-solid fa-circle-notch fa-spin" /></div>}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
