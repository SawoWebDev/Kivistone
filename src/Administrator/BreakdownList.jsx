// src/Administrator/BreakdownList.jsx
//
// Reusable ranked list with a proportional background bar, shared by
// Analytics.jsx's Top Pages / Top Referrers / Top Countries cards.
export default function BreakdownList({ rows, emptyLabel = 'No data yet' }) {
  const list = rows || [];
  const max = Math.max(1, ...list.map((r) => r.count || 0));

  if (!list.length) {
    return <p className="breakdown-empty">{emptyLabel}</p>;
  }

  return (
    <ul className="breakdown-list">
      {list.map((row) => (
        <li key={row.label} className="breakdown-row">
          <div className="breakdown-bar" style={{ width: `${Math.max(4, (row.count / max) * 100)}%` }} />
          <span className="breakdown-label" title={row.label}>{row.label}</span>
          <span className="breakdown-value">{row.count.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}
