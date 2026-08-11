// src/Administrator/Analytics.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import { getCache, setCache } from './adminCache.js';
import { computeStats } from './computeStats.js';
import DailyTrafficChart from './DailyTrafficChart.jsx';
import BreakdownList from './BreakdownList.jsx';
import WorldMap from './WorldMap.jsx';

const CACHE_KEY = 'analytics:v1';

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function rangeFor(preset) {
  const to = new Date();
  const from = new Date();
  switch (preset) {
    case 'today':
      break;
    case '30d':
      from.setDate(from.getDate() - 29);
      break;
    case 'year':
      from.setMonth(0, 1);
      break;
    case '7d':
    default:
      from.setDate(from.getDate() - 6);
      break;
  }
  return { from: isoDate(from), to: isoDate(to) };
}

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'year', label: 'This year' },
];

function formatDuration(seconds) {
  const s = Math.round(seconds || 0);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

// Small tab bar shared by the Top Pages / Locations / Devices cards below —
// each card owns its own active-tab key in `cardTabs` state and just tells
// this which options to render.
function CardTabs({ options, active, onChange }) {
  return (
    <div className="card-tabs">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={`card-tab-btn${active === opt.key ? ' active' : ''}`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const PAGES_TABS = [
  { key: 'top', label: 'Top' },
  { key: 'entry', label: 'Entry' },
  { key: 'exit', label: 'Exit' },
];

const LOCATIONS_TABS = [
  { key: 'countries', label: 'Countries' },
  { key: 'regions', label: 'Regions' },
  { key: 'cities', label: 'Cities' },
];

const DEVICES_TABS = [
  { key: 'browser', label: 'Browser' },
  { key: 'os', label: 'OS' },
  { key: 'device', label: 'Device' },
];

export default function Analytics() {
  const cached = getCache(CACHE_KEY);
  const [preset, setPreset] = useState(cached?.preset || '7d');
  const [stats, setStats] = useState(cached?.stats || null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');

  const [pagesTab, setPagesTab] = useState('top');
  const [locationsTab, setLocationsTab] = useState('countries');
  const [devicesTab, setDevicesTab] = useState('browser');

  const range = useMemo(() => rangeFor(preset), [preset]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await api.get(`/api/admin/analytics?from=${range.from}&to=${range.to}`);
      const computed = computeStats(resp?.rows || [], range);
      setStats(computed);
      setCache(CACHE_KEY, { preset, stats: computed });
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [range, preset]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  const topPages = (stats?.topPages || []).map((r) => ({ label: r.path, count: r.count }));
  const entryPages = (stats?.entryPages || []).map((r) => ({ label: r.path, count: r.count }));
  const exitPages = (stats?.exitPages || []).map((r) => ({ label: r.path, count: r.count }));
  const pagesRows = pagesTab === 'entry' ? entryPages : pagesTab === 'exit' ? exitPages : topPages;

  const topReferrers = (stats?.topReferrers || []).map((r) => ({ label: r.referrer === 'Unknown' ? 'Direct / Unknown' : r.referrer, count: r.count }));

  const countryRows = (stats?.topCountries || []).map((r) => ({ label: r.country, count: r.count }));
  const regionRows = (stats?.regions || []).map((r) => ({ label: r.region, count: r.count }));
  const cityRows = (stats?.cities || []).map((r) => ({ label: r.city, count: r.count }));
  const locationsRows = locationsTab === 'regions' ? regionRows : locationsTab === 'cities' ? cityRows : countryRows;

  const browserRows = (stats?.browsers || []).map((r) => ({ label: r.browser, count: r.count }));
  const osRows = (stats?.os || []).map((r) => ({ label: r.os, count: r.count }));
  const deviceRows = (stats?.deviceTypes || []).map((r) => ({ label: r.device, count: r.count }));
  const devicesRows = devicesTab === 'os' ? osRows : devicesTab === 'device' ? deviceRows : browserRows;

  return (
    <div className="analytics-page">
      <div className="pill-filter-row">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`pill-filter${preset === p.key ? ' active' : ''}`}
            onClick={() => setPreset(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fa-solid fa-triangle-exclamation" />
          {error}
        </div>
      )}

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon"><i className="fa-solid fa-eye" /></div>
          <div className="metric-body">
            <div className="metric-value">{(stats?.pageViews ?? 0).toLocaleString()}</div>
            <div className="metric-label">Page Views</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="fa-solid fa-users" /></div>
          <div className="metric-body">
            <div className="metric-value">{(stats?.uniqueVisitors ?? 0).toLocaleString()}</div>
            <div className="metric-label">Unique Visitors</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="fa-solid fa-stopwatch" /></div>
          <div className="metric-body">
            <div className="metric-value">{formatDuration(stats?.avgDuration)}</div>
            <div className="metric-label">Avg. Duration</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="fa-solid fa-arrow-right-from-bracket" /></div>
          <div className="metric-body">
            <div className="metric-value">{(stats?.bounceRate ?? 0)}%</div>
            <div className="metric-label">Bounce Rate</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title"><i className="fa-solid fa-chart-column" /> Traffic</h3>
        </div>
        <div className="card-body">
          {loading ? <p className="chart-empty">Loading…</p> : <DailyTrafficChart data={stats?.dailyStats || []} />}
        </div>
      </div>

      <div className="analytics-breakdown-grid">
        <div className="card">
          <div className="card-header card-header-row">
            <h3 className="card-title">Pages</h3>
            <CardTabs options={PAGES_TABS} active={pagesTab} onChange={setPagesTab} />
          </div>
          <div className="card-body"><BreakdownList rows={pagesRows} /></div>
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Top Referrers / Sources</h3></div>
          <div className="card-body"><BreakdownList rows={topReferrers} /></div>
        </div>
        <div className="card">
          <div className="card-header card-header-row">
            <h3 className="card-title">Devices</h3>
            <CardTabs options={DEVICES_TABS} active={devicesTab} onChange={setDevicesTab} />
          </div>
          <div className="card-body"><BreakdownList rows={devicesRows} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header card-header-row">
          <h3 className="card-title">Locations</h3>
          <CardTabs options={LOCATIONS_TABS} active={locationsTab} onChange={setLocationsTab} />
        </div>
        <div className="card-body">
          <div className="analytics-breakdown-grid analytics-breakdown-grid--two">
            <WorldMap data={stats?.topCountries || []} />
            <BreakdownList rows={locationsRows} />
          </div>
        </div>
      </div>
    </div>
  );
}
