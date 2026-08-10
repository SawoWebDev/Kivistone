import { categories } from './categories.js';
import { productsByCategory } from './products.js';

/* Flat, precomputed list of everything global search can match: the four
   static pages, every product category page, and every individual product.
   Built once at module load since none of this data changes at runtime. */
const PAGES = [
  {
    type: 'page',
    title: 'Home',
    subtitle: 'Page',
    path: '/',
    keywords: 'home kivistone finnish soapstone candle holders dish plates cups coolers aroma cups bathroom essentials gifts corporate gifting',
  },
  {
    type: 'page',
    title: 'About',
    subtitle: 'Page',
    path: '/about',
    keywords: 'about kivistone sawo inc finnish soapstone iso 9001 14001 certification quality environmental labour standards',
  },
  {
    type: 'page',
    title: 'Products',
    subtitle: 'Page',
    path: '/products',
    keywords: 'products shop kivistone candle holders dish plates cups coolers aroma cups bathroom essentials',
  },
  {
    type: 'page',
    title: 'Contact',
    subtitle: 'Page',
    path: '/contact',
    keywords: 'contact kivistone enquiries samples bulk quotes sales cebu sawo factory export',
  },
];

const CATEGORY_PAGES = categories.map((c) => ({
  type: 'page',
  title: c.title,
  subtitle: 'Product range',
  path: `/products/${c.slug}`,
  keywords: `${c.title} ${c.short} ${c.description}`,
}));

const PRODUCTS = categories.flatMap((c) =>
  (productsByCategory[c.slug] || []).map((p) => ({
    type: 'product',
    title: p.name,
    subtitle: c.title,
    path: `/products/${c.slug}/${p.id}`,
    image: p.image,
    keywords: `${p.name} ${p.id} ${c.title} ${p.sizeMm || ''}`,
  })),
);

export const searchIndex = [...PAGES, ...CATEGORY_PAGES, ...PRODUCTS];

/* Ranked substring search: title-starts-with beats title-contains beats a
   match buried in the keyword blob (description text, size, etc). */
export function searchSite(query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = [];
  for (const item of searchIndex) {
    const title = item.title.toLowerCase();
    let score;
    if (title.startsWith(q)) score = 0;
    else if (title.includes(q)) score = 1;
    else if (item.keywords.toLowerCase().includes(q)) score = 2;
    else continue;
    scored.push({ item, score });
  }

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit).map((s) => s.item);
}
