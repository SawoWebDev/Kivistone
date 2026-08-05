import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { categories } from '../src/data/categories.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://kivistone.vercel.app';

const productsPath = path.join(rootDir, 'src/data/products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

const staticPaths = ['/', '/about', '/contact', '/products'].map((urlPath) => ({
  path: urlPath,
  image: null,
}));

const categoryPaths = categories.map((category) => ({
  path: `/products/${category.slug}`,
  image: category.image,
}));

const productPaths = categories.flatMap((category) => {
  const categoryProducts = products[category.slug] || [];
  return categoryProducts.map((product) => ({
    path: `/products/${category.slug}/${product.id}`,
    image: product.image,
  }));
});

const allEntries = [...staticPaths, ...categoryPaths, ...productPaths];

const urlEntries = allEntries
  .map(({ path: urlPath, image }) => {
    const loc = urlPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${urlPath}`;
    if (!image) {
      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    }
    const imageLoc = `${BASE_URL}${image}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <image:image>\n      <image:loc>${imageLoc}</image:loc>\n    </image:image>\n  </url>`;
  })
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlEntries}\n</urlset>\n`;

const outputPath = path.join(rootDir, 'public/sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf-8');

console.log(`Sitemap written to ${outputPath} with ${allEntries.length} URLs.`);
