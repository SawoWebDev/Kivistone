// src/Administrator/Dashboard.jsx
//
// Admin landing page (/admin/dashboard): quick actions, at-a-glance metrics,
// a 7-day traffic chart, and two "recently changed" lists.
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api.js';
import { getCache, setCache } from './adminCache.js';
import { computeStats } from './computeStats.js';
import DailyTrafficChart from './DailyTrafficChart.jsx';

const CACHE_KEY = 'dashboard:v1';

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const ACTION_CONFIG = {
  create: { label: 'Created', className: 'pill-create' },
  update: { label: 'Updated', className: 'pill-update' },
  delete: { label: 'Deleted', className: 'pill-delete' },
};

function ActionPill({ action }) {
  const cfg = ACTION_CONFIG[action] || { label: action, className: 'pill-neutral' };
  return <span className={`pill ${cfg.className}`}>{cfg.label}</span>;
}

function MetricCard({ icon, label, value, subtitle }) {
  return (
    <div className="metric-card">
      <div className="metric-icon"><i className={icon} /></div>
      <div className="metric-body">
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const cached = getCache(CACHE_KEY);
  const [products, setProducts] = useState(cached?.products || []);
  const [stats, setStats] = useState(cached?.stats || null);
  const [logs, setLogs] = useState(cached?.logs || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!getCache(CACHE_KEY)) setLoading(true);
    setError('');
    try {
      const from = isoDaysAgo(7);
      const to = isoDaysAgo(0);
      const [productList, analytics, logsResp] = await Promise.all([
        api.get('/api/admin/products'),
        api.get(`/api/admin/analytics?from=${from}&to=${to}`),
        api.get('/api/admin/logs?page=1&pageSize=5'),
      ]);
      const computed = computeStats(analytics?.rows || [], { from, to });
      const next = { products: productList || [], stats: computed, logs: logsResp?.rows || [] };
      setProducts(next.products);
      setStats(next.stats);
      setLogs(next.logs);
      setCache(CACHE_KEY, next);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);

  return (
    <div className="dashboard-page">
      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-triangle-exclamation" />
          {error}
        </div>
      )}

      <div className="quick-actions">
        <Link to="/admin/products?new=1" className="btn btn-ghost">
          <i className="fa-solid fa-box" /> New Product
        </Link>
        <Link to="/admin/categories?new=1" className="btn btn-ghost">
          <i className="fa-solid fa-layer-group" /> New Category
        </Link>
        <Link to="/admin/analytics" className="btn btn-ghost">
          <i className="fa-solid fa-chart-line" /> View Analytics
        </Link>
        <Link to="/admin/logs" className="btn btn-ghost">
          <i className="fa-solid fa-file-lines" /> View Logs
        </Link>
      </div>

      <div className="metric-grid">
        <MetricCard icon="fa-solid fa-eye" label="Page Views (7d)" value={(stats?.pageViews ?? 0).toLocaleString()} />
        <MetricCard icon="fa-solid fa-users" label="Unique Visitors (7d)" value={(stats?.uniqueVisitors ?? 0).toLocaleString()} />
        <MetricCard icon="fa-solid fa-box" label="Product Count" value={loading ? '–' : products.length.toLocaleString()} />
        <MetricCard icon="fa-solid fa-clock-rotate-left" label="Recent Changes" value={logs.length} subtitle="Last 5 logged" />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><i className="fa-solid fa-chart-column" /> Traffic: Last 7 Days</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <p className="chart-empty">Loading…</p>
          ) : (
            <DailyTrafficChart data={stats?.dailyStats || []} />
          )}
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><i className="fa-solid fa-box-open" /> Recently Added Products</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <p className="empty-state">Loading…</p>
            ) : recentProducts.length === 0 ? (
              <p className="empty-state">No products yet.</p>
            ) : (
              <ul className="mini-list">
                {recentProducts.map((p) => (
                  <li key={p.id}>
                    <div className="mini-list-thumb">
                      {p.image ? <img src={p.image} alt="" /> : <i className="fa-solid fa-image" />}
                    </div>
                    <div className="mini-list-body">
                      <span className="mini-list-title">{p.name}</span>
                      <span className="mini-list-subtitle">{p.category_slug}</span>
                    </div>
                    {p.created_at && <span className="mini-list-meta">{timeAgo(p.created_at)}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><i className="fa-solid fa-history" /> Recent Activity</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <p className="empty-state">Loading…</p>
            ) : logs.length === 0 ? (
              <p className="empty-state">No activity recorded yet.</p>
            ) : (
              <ul className="mini-list">
                {logs.map((l) => (
                  <li key={l.id}>
                    <ActionPill action={l.action} />
                    <div className="mini-list-body">
                      <span className="mini-list-title">{l.entity_name || l.entity_id || l.entity}</span>
                      <span className="mini-list-subtitle">{l.username ? `@${l.username}` : 'system'} · {timeAgo(l.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/admin/logs" className="btn btn-ghost btn-sm dashboard-view-all">View all logs</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
