// src/Administrator/Logs.jsx
import { Fragment, useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { getCache, setCache } from './adminCache.js';

const PAGE_SIZE = 50;
const CACHE_KEY = 'logs:default';

const ACTION_CONFIG = {
  create: { label: 'Created', className: 'pill-create' },
  update: { label: 'Updated', className: 'pill-update' },
  delete: { label: 'Deleted', className: 'pill-delete' },
};

function ActionPill({ action }) {
  const cfg = ACTION_CONFIG[action] || { label: action, className: 'pill-neutral' };
  return <span className={`pill ${cfg.className}`}>{cfg.label}</span>;
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString();
}

function timeAgo(d) {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Logs() {
  const cached = getCache(CACHE_KEY);
  const [rows, setRows] = useState(cached?.rows || []);
  const [total, setTotal] = useState(cached?.total || 0);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    const isDefault = page === 0 && !search && !action && !entity;
    if (!(isDefault && getCache(CACHE_KEY))) setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        pageSize: String(PAGE_SIZE),
      });
      if (search) params.set('search', search);
      if (action) params.set('action', action);
      if (entity) params.set('entity', entity);
      const resp = await api.get(`/api/admin/logs?${params.toString()}`);
      setRows(resp?.rows || []);
      setTotal(resp?.total || 0);
      if (isDefault) setCache(CACHE_KEY, { rows: resp?.rows || [], total: resp?.total || 0 });
    } catch (err) {
      setError(err.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [page, search, action, entity]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(0);
  }, [search, action, entity]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="logs-page">
      <div className="toolbar">
        <div className="search-wrap">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by entity name…"
          />
        </div>
        <select className="filter-select" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">All Actions</option>
          <option value="create">Created</option>
          <option value="update">Updated</option>
          <option value="delete">Deleted</option>
        </select>
        <select className="filter-select" value={entity} onChange={(e) => setEntity(e.target.value)}>
          <option value="">All Types</option>
          <option value="product">Product</option>
          <option value="category">Category</option>
        </select>
        <button type="button" className="btn btn-ghost btn-sm" onClick={load}>
          <i className="fa-solid fa-rotate" /> Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-triangle-exclamation" />
          {error}
        </div>
      )}

      <div className="table-wrap">
        {loading ? (
          <div className="table-loading"><i className="fa-solid fa-circle-notch fa-spin" /> Loading logs…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">No logs match the current filters.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Action</th>
                <th>Type</th>
                <th>Details</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((log) => (
                <Fragment key={log.id}>
                  <tr>
                    <td title={formatDate(log.created_at)}>{timeAgo(log.created_at)}</td>
                    <td><ActionPill action={log.action} /></td>
                    <td className="text-muted">{log.entity}</td>
                    <td>
                      <div className="log-entity-name">{log.entity_name || log.entity_id || <span className="text-muted">Unnamed</span>}</div>
                      {log.changes && (
                        <button
                          type="button"
                          className="link-btn"
                          onClick={() => setExpandedId((id) => (id === log.id ? null : log.id))}
                        >
                          {expandedId === log.id ? 'Hide changes' : 'Show changes'}
                        </button>
                      )}
                    </td>
                    <td>{log.username ? `@${log.username}` : <span className="text-muted">-</span>}</td>
                  </tr>
                  {expandedId === log.id && log.changes && (
                    <tr>
                      <td colSpan={5}>
                        <pre className="log-diff">{JSON.stringify(log.changes, null, 2)}</pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && total > 0 && (
        <div className="pagination-row">
          <span className="pagination-summary">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()}
          </span>
          <div className="pagination-controls">
            <button type="button" className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
            <span className="pagination-page-indicator">Page {page + 1} of {totalPages}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
