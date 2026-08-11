// src/Administrator/computeStats.js
//
// Pure, backend-agnostic stat computation over the raw rows returned by
// GET /api/admin/analytics. No fetch/DOM/React here on purpose — easy to
// reason about and (if ever needed) unit test in isolation.
const dayKey = (iso) => String(iso || '').slice(0, 10); // "YYYY-MM-DD" from an ISO timestamp

// Zero-filled { date, views, visitors } series across [from, to] (inclusive,
// both "YYYY-MM-DD") so DailyTrafficChart never shows a gap for a day with
// no traffic.
function buildDailyStats(rows, from, to) {
  const viewsByDay = {};
  const sessionsByDay = {};
  rows.forEach((r) => {
    const key = dayKey(r.timestamp);
    viewsByDay[key] = (viewsByDay[key] || 0) + 1;
    if (!sessionsByDay[key]) sessionsByDay[key] = new Set();
    sessionsByDay[key].add(r.session_id);
  });

  const dailyStats = [];
  const cursor = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) return dailyStats;

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    dailyStats.push({
      date: key,
      views: viewsByDay[key] || 0,
      visitors: sessionsByDay[key] ? sessionsByDay[key].size : 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return dailyStats;
}

function rankedCounts(rows, getKey, limit = 10) {
  const counts = new Map();
  rows.forEach((row) => {
    const key = getKey(row) || 'Unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

// Same ranking/slicing as rankedCounts, but over an already-extracted list of
// values rather than raw rows — used for session-derived tallies (entry/exit
// pages), where the thing being counted is "this session's first/last
// page_path", not a per-row field.
function rankedValues(values, limit = 10) {
  const counts = new Map();
  values.forEach((v) => {
    const key = v || 'Unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * @param {Array} rows raw rows from GET /api/admin/analytics
 * @param {{ from?: string, to?: string }} range optional "YYYY-MM-DD" bounds
 *   used to zero-fill dailyStats — normally the same from/to used to fetch
 *   `rows` in the first place. Falls back to the earliest row's day / today.
 */
export function computeStats(rows, range = {}) {
  const list = Array.isArray(rows) ? rows : [];
  const today = todayIso();

  const earliestDay = list.length
    ? list.reduce((min, r) => (dayKey(r.timestamp) < min ? dayKey(r.timestamp) : min), dayKey(list[0].timestamp))
    : today;

  const from = range.from || earliestDay;
  const to = range.to || today;

  // Session index — session_id -> rows, needed for unique-visitor and
  // bounce-rate calculations (a session's pageview count, not its row count).
  const sessions = new Map();
  list.forEach((r) => {
    if (!sessions.has(r.session_id)) sessions.set(r.session_id, []);
    sessions.get(r.session_id).push(r);
  });
  // Sort each session's rows chronologically so "first row" / "last row"
  // below are actually entry/exit, not just insertion order from the API.
  sessions.forEach((sessionRows) => {
    sessionRows.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  });

  const pageViews = list.length;
  const uniqueVisitors = sessions.size;

  const totalDuration = list.reduce((sum, r) => sum + (Number(r.time_on_page) || 0), 0);
  const avgDuration = pageViews > 0 ? Math.round(totalDuration / pageViews) : 0;

  let bouncedSessions = 0;
  sessions.forEach((views) => {
    if (views.length === 1) bouncedSessions += 1;
  });
  const bounceRate = uniqueVisitors > 0 ? Math.round((bouncedSessions / uniqueVisitors) * 100) : 0;

  const dailyStats = buildDailyStats(list, from, to);

  const topPages = rankedCounts(list, (r) => r.page_path)
    .map(({ key, count }) => ({ path: key, count }));

  const topReferrers = rankedCounts(list, (r) => r.utm_source || r.referrer)
    .map(({ key, count }) => ({ referrer: key, count }));

  const topCountries = rankedCounts(list, (r) => r.country)
    .map(({ key, count }) => ({ country: key, count }));

  // Device/browser/OS breakdowns — same row-level tally as topPages/
  // topReferrers/topCountries above (one row = one pageview = one vote).
  const browsers = rankedCounts(list, (r) => r.browser)
    .map(({ key, count }) => ({ browser: key, count }));

  const os = rankedCounts(list, (r) => r.os)
    .map(({ key, count }) => ({ os: key, count }));

  const deviceTypes = rankedCounts(list, (r) => r.device_type)
    .map(({ key, count }) => ({ device: key, count }));

  const regions = rankedCounts(list, (r) => r.region)
    .map(({ key, count }) => ({ region: key, count }));

  const cities = rankedCounts(list, (r) => r.city)
    .map(({ key, count }) => ({ city: key, count }));

  // Entry/exit pages — per session (rows sorted above), the first/last
  // page_path is what that session landed on / left from. Tallying those
  // (rather than every row) answers "what page do sessions most commonly
  // start/end on", not just "which page has the most views".
  const entryPages = rankedValues([...sessions.values()].map((sessionRows) => sessionRows[0]?.page_path))
    .map(({ key, count }) => ({ path: key, count }));

  const exitPages = rankedValues([...sessions.values()].map((sessionRows) => sessionRows[sessionRows.length - 1]?.page_path))
    .map(({ key, count }) => ({ path: key, count }));

  return {
    pageViews,
    uniqueVisitors,
    avgDuration,
    bounceRate,
    dailyStats,
    topPages,
    topReferrers,
    topCountries,
    browsers,
    os,
    deviceTypes,
    regions,
    cities,
    entryPages,
    exitPages,
  };
}
