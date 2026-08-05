/*
  Post-build static prerenderer.

  Boots a tiny SPA-fallback static server over dist/, then drives a real
  headless Chrome (via puppeteer) to each route so this app's client-side
  usePageMeta() effects actually run and mutate <head> before we snapshot the
  DOM. The snapshot is written back into dist/<route>/index.html so crawlers
  and social-media link-preview bots (which don't execute JS) get real,
  per-page <title>/meta/canonical/OG/Twitter/JSON-LD instead of the single
  generic index.html shell.

  Route enumeration mirrors scripts/generate-sitemap.mjs: static routes plus
  every /products/:slug and /products/:slug/:productId derived from
  src/data/categories.js + src/data/products.json.
*/
import { readFileSync, writeFileSync, mkdirSync, createReadStream, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import http from 'node:http';

import puppeteer from 'puppeteer';

import { categories } from '../src/data/categories.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!existsSync(distDir)) {
  console.error('dist/ not found — run `vite build` before prerendering.');
  process.exit(1);
}

const productsPath = path.join(rootDir, 'src/data/products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

const staticRoutes = ['/', '/about', '/contact', '/products'];
const categoryRoutes = categories.map((category) => `/products/${category.slug}`);
const productRoutes = categories.flatMap((category) => {
  const categoryProducts = products[category.slug] || [];
  return categoryProducts.map((product) => `/products/${category.slug}/${product.id}`);
});

const routes = [...staticRoutes, ...categoryRoutes, ...productRoutes];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

/* Serves static files from dist/, falling back to the root index.html for
   any path that isn't a real file, so puppeteer can deep-link directly into
   client-side routes exactly like a production SPA host would. */
function createStaticServer() {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(distDir, urlPath);

    if (urlPath === '/' || !existsSync(filePath) || filePath.endsWith(path.sep)) {
      const asIndex = path.join(distDir, urlPath, 'index.html');
      if (urlPath !== '/' && existsSync(asIndex)) {
        filePath = asIndex;
      } else if (!existsSync(filePath) || filePath.endsWith(path.sep)) {
        filePath = path.join(distDir, 'index.html');
      }
    }

    const ext = path.extname(filePath);
    res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
    const stream = createReadStream(filePath);
    stream.on('error', () => {
      res.statusCode = 404;
      res.end('Not found');
    });
    stream.pipe(res);
  });
}

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function main() {
  const server = createStaticServer();
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({ headless: true });

  console.log(`Prerendering ${routes.length} routes...`);

  try {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0' });

      // usePageMeta runs in a useEffect on mount/route-change; wait for the
      // robots meta tag it always sets so we don't snapshot before <head>
      // has been rewritten for this specific route.
      await page.waitForFunction(
        () => document.querySelector('meta[name="robots"]') !== null,
        { timeout: 5000 },
      );

      const html = await page.content();
      await page.close();

      const outDir = route === '/' ? distDir : path.join(distDir, route);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
      console.log(`  ${route} -> ${path.relative(rootDir, path.join(outDir, 'index.html'))}`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log('Prerendering complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
