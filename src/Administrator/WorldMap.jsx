// src/Administrator/WorldMap.jsx
//
// Choropleth world map for the Locations card — each visited country gets
// its own color from a fixed categorical palette (ranked by view count),
// with a hover tooltip and a small legend. Topojson ships from node_modules
// (world-atlas), so this makes no runtime request for map data.
import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import worldTopo from 'world-atlas/countries-110m.json';

// Our tracking Function derives country from Cloudflare's request.cf, which
// reports common English names; world-atlas uses Natural Earth names. Bridge
// the ones that differ.
const NAME_ALIASES = {
  'United States': 'United States of America',
  'Czech Republic': 'Czechia',
  'Russian Federation': 'Russia',
  'South Korea': 'South Korea',
  'Republic of Korea': 'South Korea',
  'North Korea': 'North Korea',
  'Dominican Republic': 'Dominican Rep.',
  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'Democratic Republic of the Congo': 'Dem. Rep. Congo',
  'DR Congo': 'Dem. Rep. Congo',
  'Republic of the Congo': 'Congo',
  'Viet Nam': 'Vietnam',
  'United Republic of Tanzania': 'Tanzania',
  'Ivory Coast': "Côte d'Ivoire",
  "Cote d'Ivoire": "Côte d'Ivoire",
  'Myanmar (Burma)': 'Myanmar',
  'Central African Republic': 'Central African Rep.',
  'South Sudan': 'S. Sudan',
  'Equatorial Guinea': 'Eq. Guinea',
  'Western Sahara': 'W. Sahara',
  'Solomon Islands': 'Solomon Is.',
  'The Netherlands': 'Netherlands',
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
};

// Fixed-order categorical palette (8 slots). Reuses the admin shell's own
// semantic tokens (brand steel, warning amber, info blue, success sage,
// danger rust) plus three extra warm-neutral hexes so the map reads as part
// of Kivistone's admin, not an imported brand — see admin.css's --a-* tokens
// for the design-token mapping these lean on.
const PALETTE = [
  'var(--a-brand)',
  '#a5680c',
  '#2a5fa5',
  '#4B7A5C',
  '#9C4E40',
  '#8a6d3b',
  '#6b5b95',
  '#3c7a89',
];

const OTHER_COLOR = 'var(--a-text-3)';

/**
 * @param {Array<{country: string, count: number}>} data ranked country tally
 *   — same shape as computeStats()'s `topCountries`.
 * @param {number|string} [height=320]
 */
export default function WorldMap({ data, height = 320 }) {
  const [tooltip, setTooltip] = useState(null); // { x, y, label }

  const { byTopoName, colorByTopoName, legend } = useMemo(() => {
    const aggregated = {}; // topoName -> { count, displayName }
    (data || []).forEach(({ country, count }) => {
      if (!country || country === 'Unknown') return;
      const topoName = NAME_ALIASES[country] || country;
      if (!aggregated[topoName]) aggregated[topoName] = { count: 0, displayName: country };
      aggregated[topoName].count += count;
    });
    const sorted = Object.entries(aggregated)
      .map(([topoName, v]) => ({ topoName, ...v }))
      .sort((a, b) => b.count - a.count);

    const byTopoName = {};
    const colorByTopoName = {};
    const legendRows = [];
    let otherCount = 0;
    let otherPlaces = 0;

    sorted.forEach((c, idx) => {
      byTopoName[c.topoName] = c.count;
      if (idx < PALETTE.length) {
        colorByTopoName[c.topoName] = PALETTE[idx];
        legendRows.push({ color: PALETTE[idx], name: c.displayName, count: c.count });
      } else {
        colorByTopoName[c.topoName] = OTHER_COLOR;
        otherCount += c.count;
        otherPlaces += 1;
      }
    });
    if (otherPlaces > 0) {
      legendRows.push({ color: OTHER_COLOR, name: `Other (${otherPlaces})`, count: otherCount });
    }

    return { byTopoName, colorByTopoName, legend: legendRows };
  }, [data]);

  return (
    <div className="world-map" style={{ height }}>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 150 }}
        width={800}
        height={400}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <Geographies geography={worldTopo}>
          {({ geographies }) =>
            geographies
              // Antarctica: all map, no visitors — drop it for a tighter fit.
              .filter((geo) => geo.properties.name !== 'Antarctica')
              .map((geo) => {
                const name = geo.properties.name;
                const count = byTopoName[name] || 0;
                const color = colorByTopoName[name]; // undefined = no visits
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseMove={(e) => {
                      const bounds = e.currentTarget.closest('svg').parentNode.getBoundingClientRect();
                      setTooltip({
                        x: e.clientX - bounds.left,
                        y: e.clientY - bounds.top,
                        label: `${name}: ${count.toLocaleString()} view${count !== 1 ? 's' : ''}`,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: {
                        fill: color || 'rgba(var(--a-brand-rgb), 0.14)',
                        stroke: 'var(--a-border)',
                        strokeWidth: 0.75,
                        outline: 'none',
                      },
                      hover: {
                        fill: color || 'rgba(var(--a-brand-rgb), 0.32)',
                        stroke: 'var(--a-brand)',
                        strokeWidth: 1.1,
                        outline: 'none',
                        cursor: 'default',
                      },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
          }
        </Geographies>
      </ComposableMap>

      {legend.length > 0 && (
        <div className="world-map-legend">
          <div className="world-map-legend-header">
            <span>Country</span>
            <span>Views</span>
          </div>
          <div className="world-map-legend-rows">
            {legend.map((row) => (
              <div key={row.name} className="world-map-legend-row">
                <span className="world-map-legend-swatch" style={{ background: row.color }} />
                <span className="world-map-legend-name" title={row.name}>{row.name}</span>
                <span className="world-map-legend-count">{row.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tooltip && (
        <div className="world-map-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 34 }}>
          {tooltip.label}
        </div>
      )}
    </div>
  );
}
