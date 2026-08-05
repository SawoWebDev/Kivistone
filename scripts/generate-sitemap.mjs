import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { categories } from '../src/data/categories.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://www.kivistone.com';

const productsPath = path.join(rootDir, 'src/data/products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

const staticPaths = ['/', '/about', '/contact', '/products'];

const categoryPaths = categories.map((category) => `/products/${category.slug}`);

const productPaths = categories.flatMap((category) => {
  const categoryProducts = products[category.slug] || [];
  return categoryProducts.map((product) => `/products/${category.slug}/${product.id}`);
});

const allPaths = [...staticPaths, ...categoryPaths, ...productPaths];

const urlEntries = allPaths
  .map((urlPath) => {
    const loc = urlPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${urlPath}`;
    return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;

const outputPath = path.join(rootDir, 'public/sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf-8');

console.log(`Sitemap written to ${outputPath} with ${allPaths.length} URLs.`);
