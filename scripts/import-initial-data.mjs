// scripts/import-initial-data.mjs
// One-off (but re-runnable) seed: loads the current src/data/categories.json
// and src/data/products.json into D1's categories/products tables. Useful
// for the initial CMS bring-up (D1 starts empty) and for reseeding a fresh
// database later. Writes a temp .sql file and applies it via
// `wrangler d1 execute --file`, which handles quoting far more reliably
// than passing a giant --command string through a shell.

import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const DB_NAME = 'kivistone-cms';

function sqlString(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function main() {
  const categories = JSON.parse(readFileSync(path.join(rootDir, 'src/data/categories.json'), 'utf-8'));
  const productsByCategory = JSON.parse(readFileSync(path.join(rootDir, 'src/data/products.json'), 'utf-8'));

  const statements = [];

  categories.forEach((cat, index) => {
    statements.push(
      `INSERT INTO categories (slug, title, seed, image, feature, description, short, specs, sort_order) VALUES (${sqlString(cat.slug)}, ${sqlString(cat.title)}, ${sqlString(cat.seed)}, ${sqlString(cat.image)}, ${cat.feature ? 1 : 0}, ${sqlString(cat.description)}, ${sqlString(cat.short)}, ${sqlString(JSON.stringify(cat.specs || []))}, ${index});`
    );
  });

  for (const [categorySlug, products] of Object.entries(productsByCategory)) {
    products.forEach((p, index) => {
      statements.push(
        `INSERT INTO products (id, category_slug, name, size_mm, weight_kg, weight_label, image, sort_order) VALUES (${sqlString(p.id)}, ${sqlString(categorySlug)}, ${sqlString(p.name)}, ${sqlString(p.sizeMm)}, ${p.weightKg != null ? p.weightKg : 'NULL'}, ${sqlString(p.weightLabel)}, ${sqlString(p.image)}, ${index});`
      );
    });
  }

  const sqlFile = path.join(os.tmpdir(), `kivistone-import-${Date.now()}.sql`);
  writeFileSync(sqlFile, statements.join('\n') + '\n', 'utf-8');

  console.log(`import-initial-data: applying ${statements.length} statements to D1...`);
  try {
    execSync(`npx wrangler d1 execute ${DB_NAME} --remote --file="${sqlFile}"`, {
      stdio: 'inherit',
      maxBuffer: 1024 * 1024 * 64,
    });
  } finally {
    unlinkSync(sqlFile);
  }
  console.log('import-initial-data: done.');
}

main();
