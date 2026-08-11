// src/Administrator/DailyTrafficChart.jsx
//
// Hand-rolled SVG line/area chart — no charting library, keeps the admin
// bundle small. `data` is [{ date: "YYYY-MM-DD", views, visitors }], already
// zero-filled/sorted ascending by computeStats().
import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_W = 640;
const CHART_H = 220;
const PAD_X = 8;
const PAD_TOP = 14;
const PAD_BOTTOM = 24;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;

function formatDayLabel(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatFullDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

// Catmull-Rom -> cubic Bezier conversion (tension 1/6), so the line/area
// curve smoothly through every point instead of the sharp joints a
// straight-segment polyline gives.
function smoothCurveCommands(points) {
  const cmds = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    cmds.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
  }
  return cmds;
}

function smoothLinePath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  return `M${points[0].x},${points[0].y} ${smoothCurveCommands(points).join(' ')}`;
}

export default function DailyTrafficChart({ data }) {
  const canvasRef = useRef(null);
  const [width, setWidth] = useState(DEFAULT_W);
  const [hoverIndex, setHoverIndex] = useState(null);
  const list = data || [];
  const n = list.length;

  // The SVG's viewBox is kept in sync with its real rendered pixel width
  // (instead of stretching a fixed 640-wide viewBox with
  // preserveAspectRatio="none") so the coordinate system scales 1:1 in both
  // axes — otherwise circles drawn for the hover dots get squashed into
  // ellipses whenever the card is wider than 640px.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const maxValue = useMemo(
    () => Math.max(1, ...list.map((d) => Math.max(d.views || 0, d.visitors || 0))),
    [list],
  );

  const x = (i) => (n <= 1 ? width / 2 : PAD_X + (i * (width - PAD_X * 2)) / (n - 1));
  const y = (value) => PAD_TOP + (1 - value / maxValue) * PLOT_H;

  const viewsPoints = useMemo(() => list.map((d, i) => ({ x: x(i), y: y(d.views || 0) })), [list, maxValue, width]);
  const visitorsPoints = useMemo(() => list.map((d, i) => ({ x: x(i), y: y(d.visitors || 0) })), [list, maxValue, width]);

  const viewsLinePath = useMemo(() => smoothLinePath(viewsPoints), [viewsPoints]);
  const visitorsLinePath = useMemo(() => smoothLinePath(visitorsPoints), [visitorsPoints]);

  const areaPath = useMemo(() => {
    if (!viewsPoints.length) return '';
    const baseline = PAD_TOP + PLOT_H;
    const first = viewsPoints[0];
    const last = viewsPoints[viewsPoints.length - 1];
    const curve = smoothCurveCommands(viewsPoints).join(' ');
    return `M${first.x},${baseline} L${first.x},${first.y} ${curve} L${last.x},${baseline} Z`;
  }, [viewsPoints]);

  if (!n) {
    return <p className="chart-empty">No data available for this period.</p>;
  }

  const labelEvery = n <= 10 ? 1 : Math.ceil(n / 10);
  const hovered = hoverIndex != null ? list[hoverIndex] : null;

  const handleMove = (clientX, rect) => {
    const fraction = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    setHoverIndex(Math.round(fraction * (n - 1)));
  };

  return (
    <div className="traffic-chart">
      <div className="traffic-chart-legend">
        <span><span className="legend-dot legend-dot--views" /> Page Views</span>
        <span><span className="legend-dot legend-dot--visitors" /> Unique Visitors</span>
      </div>

      <div
        ref={canvasRef}
        className="traffic-chart-canvas"
        onMouseMove={(e) => handleMove(e.clientX, e.currentTarget.getBoundingClientRect())}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg viewBox={`0 0 ${width} ${CHART_H}`} className="traffic-chart-svg">
          {[0, 0.5, 1].map((frac) => (
            <line
              key={frac}
              x1={PAD_X}
              x2={width - PAD_X}
              y1={PAD_TOP + PLOT_H * (1 - frac)}
              y2={PAD_TOP + PLOT_H * (1 - frac)}
              className="traffic-chart-gridline"
            />
          ))}

          <path d={areaPath} className="traffic-chart-area" />
          <path d={viewsLinePath} className="traffic-chart-line traffic-chart-line--views" />
          <path d={visitorsLinePath} className="traffic-chart-line traffic-chart-line--visitors" />

          {hovered && (
            <g>
              <line
                x1={x(hoverIndex)}
                x2={x(hoverIndex)}
                y1={PAD_TOP}
                y2={PAD_TOP + PLOT_H}
                className="traffic-chart-crosshair"
              />
              <circle cx={x(hoverIndex)} cy={y(hovered.views || 0)} r="4" className="traffic-chart-dot traffic-chart-dot--views" />
              <circle cx={x(hoverIndex)} cy={y(hovered.visitors || 0)} r="4" className="traffic-chart-dot traffic-chart-dot--visitors" />
            </g>
          )}
        </svg>

        {hovered && (
          <div
            className="traffic-chart-tooltip"
            style={{ left: `${Math.min(Math.max((hoverIndex / Math.max(n - 1, 1)) * 100, 8), 92)}%` }}
          >
            <div className="traffic-chart-tooltip-date">{formatFullDate(hovered.date)}</div>
            <div><span className="legend-dot legend-dot--views" /> {(hovered.views || 0).toLocaleString()} views</div>
            <div><span className="legend-dot legend-dot--visitors" /> {(hovered.visitors || 0).toLocaleString()} visitors</div>
          </div>
        )}
      </div>

      <div className="traffic-chart-axis">
        {list.map((day, i) => (i % labelEvery === 0 ? (
          <span key={day.date} className="traffic-chart-axis-label" style={{ left: `${(x(i) / width) * 100}%` }}>
            {formatDayLabel(day.date)}
          </span>
        ) : null))}
      </div>
    </div>
  );
}
