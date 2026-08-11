// scripts/sync-cms-data.mjs
// Build-time sync: pulls live D1 data down into the static JSON files the
// site actually builds from (src/data/categories.json, src/data/products.json).
// Runs as part of `npm run build` via the `prebuild` script chain, before
// scripts/generate-sitemap.mjs (which reads those same JSON files).
//
// Talks to D1 via `wrangler d1 execute --remote --json`, not the D1 HTTP
// API directly, so it reuses whatever wrangler auth is already configured
// on the machine/CI runner (no separate API token wiring needed here).

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const DB_NAME = 'kivistone-cms';

function runQuery(sql) {
  let stdout;
  try {
    stdout = execFileSync(
      'wrangler',
      ['d1', 'execute', DB_NAME, '--remote', '--json', '--command', sql],
      { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 64, shell: process.platform === 'win32' }
    );
  } catch (err) {
    console.error(`sync-cms-data: "wrangler d1 execute" failed for query:\n  ${sql}\n`);
    console.error(err.stderr ? err.stderr.toString() : err.message);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch (err) {
    console.error('sync-cms-data: failed to parse wrangler JSON output:', err.message);
    console.error(stdout);
    process.exit(1);
  }

  // `wrangler d1 execute --json` outputs an array of
  // { results: [...], success: true, meta: {...} } objects, one per
  // statement. We only ever send a single statement per call.
  const first = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!first || first.success === false) {
    console.error('sync-cms-data: query did not succeed:', JSON.stringify(first));
    process.exit(1);
  }

  return first.results || [];
}

function buildCategoriesJson(categoryRows) {
  return categoryRows.map((row) => {
    let specs = [];
    if (row.specs) {
      try {
        specs = JSON.parse(row.specs);
      } catch {
        specs = [];
      }
    }
    return {
      slug: row.slug,
      title: row.title,
      seed: row.seed,
      image: row.image,
      feature: !!row.feature,
      description: row.description,
      short: row.short,
      specs,
    };
  });
}

function buildProductsJson(productRows) {
  const out = {};
  for (const row of productRows) {
    // Skip products that shouldn't appear on the public site.
    if (!row.visible || row.status !== 'published') continue;

    const product = {
      id: row.id,
      name: row.name,
    };
    if (row.size_mm != null) product.sizeMm = row.size_mm;
    if (row.weight_kg != null) product.weightKg = row.weight_kg;
    if (row.weight_label != null) product.weightLabel = row.weight_label;
    if (row.image != null) product.image = row.image;

    if (!out[row.category_slug]) out[row.category_slug] = [];
    out[row.category_slug].push(product);
  }
  return out;
}

function main() {
  console.log('sync-cms-data: pulling categories from D1...');
  const categoryRows = runQuery('SELECT * FROM categories ORDER BY sort_order, title;');

  console.log('sync-cms-data: pulling products from D1...');
  const productRows = runQuery('SELECT * FROM products ORDER BY sort_order, name;');

  const categoriesJson = buildCategoriesJson(categoryRows);
  const productsJson = buildProductsJson(productRows);

  const categoriesPath = path.join(rootDir, 'src/data/categories.json');
  const productsPath = path.join(rootDir, 'src/data/products.json');

  writeFileSync(categoriesPath, JSON.stringify(categoriesJson, null, 2) + '\n', 'utf-8');
  writeFileSync(productsPath, JSON.stringify(productsJson, null, 2) + '\n', 'utf-8');

  console.log(
    `sync-cms-data: wrote ${categoriesJson.length} categories and ${
      Object.values(productsJson).reduce((n, arr) => n + arr.length, 0)
    } products.`
  );
}

main();
