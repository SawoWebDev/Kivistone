import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button.jsx';
import { getCategory, categories } from '../../data/categories.js';
import { getProductsForCategory } from '../../data/products.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import './ProductCategoryPage.css';

const PLACEHOLDER_COUNT = 6;

export default function ProductCategoryPage() {
  const { slug } = useParams();
  const category = getCategory(slug);
  const [query, setQuery] = useState('');

  const items = category ? getProductsForCategory(category.slug) : [];
  const others = category ? categories.filter((c) => c.slug !== category.slug).slice(0, 4) : [];

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => p.name.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => setQuery(''), [slug]);

  usePageMeta(
    category
      ? {
          title: `${category.title} | Kivistone`,
          description: category.short,
          image: category.image,
          path: `/products/${category.slug}`,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.kivistone.com/' },
              { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.kivistone.com/products' },
              { '@type': 'ListItem', position: 3, name: category.title, item: `https://www.kivistone.com/products/${category.slug}` },
            ],
          },
        }
      : undefined
  );

  if (!category) return <Navigate to="/products" replace />;

  const [titleAccent, ...titleRestWords] = category.title.split(' ');
  const titleRest = titleRestWords.join(' ');

  return (
    <>
      <section className="product-hero">
        <div className="pc-hero-media">
          <img src={category.image} alt={`${category.title} range of Kivistone soapstone products`} fetchpriority="high" />
          <div className="pc-hero-scrim" />
          <div className="wrap pc-hero-content">
            <h1>
              <span className="accent">{titleAccent}</span>
              {titleRest && <><br />{titleRest}</>}
            </h1>
            <p className="lede">{category.description}</p>
            <Button
              variant="secondary-inv"
              href="http://www.kivistone.com/kivistone%20brochure_5.pdf"
              external
              icon="fa-solid fa-file-pdf"
              className="pc-hero-brochure"
            >
              Brochure
            </Button>
          </div>
        </div>
      </section>

      <section className="product-grid light">
        <div className="wrap">
          <div className="pg-head">
            <div>
              <h2>Styles in this range</h2>
              <p>Every piece is cut and hand-finished individually, so no two are exactly alike.</p>
            </div>
            {items.length > 0 && (
              <div className="pg-search">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${category.title.toLowerCase()}…`}
                  aria-label={`Search ${category.title}`}
                />
              </div>
            )}
          </div>

          {items.length > 0 && filteredItems.length === 0 ? (
            <p className="pg-empty">No styles match &ldquo;{query}&rdquo;.</p>
          ) : (
          <div className="product-tiles">
            {items.length > 0
              ? filteredItems.map((p) => (
                  <Link
                    className="product-tile"
                    key={p.id}
                    to={`/products/${category.slug}/${p.id}`}
                  >
                    <div className="img">
                      <img
                        src={p.image}
                        alt={`${p.name} — ${category.title.toLowerCase()} in Kivistone soapstone`}
                        loading="lazy"
                      />
                    </div>
                    <div className="label">
                      <span className="label-name">{p.name}</span>
                      <span className="label-specs">
                        {p.sizeMm && <>Size(mm): {p.sizeMm}<br /></>}
                        Weight: {p.weightLabel || `${p.weightKg}kg`}
                      </span>
                    </div>
                  </Link>
                ))
              : Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => i + 1).map((n) => (
                  <div className="product-tile" key={n}>
                    <div className="img">
                      <img
                        src={`https://picsum.photos/seed/${category.seed}-${n}/700/560`}
                        alt={`${category.title} style ${String(n).padStart(2, '0')}`}
                        loading="lazy"
                      />
                    </div>
                    <div className="label">Style {String(n).padStart(2, '0')}</div>
                  </div>
                ))}
          </div>
          )}

          <div className="product-cta">
            <Button variant="gold" to="/contact" icon="fa-solid fa-envelope">
              Enquire about this range
            </Button>
          </div>
        </div>
      </section>

      <section className="product-more">
        <div className="wrap">
          <div className="more-head">
            <h2>Other ranges</h2>
          </div>
          <div className="more-grid">
            {others.map((c) => (
              <Link className="more-card" key={c.slug} to={`/products/${c.slug}`}>
                <div className="img">
                  <img src={c.image} alt={c.title} loading="lazy" />
                </div>
                <h3>{c.title}</h3>
              </Link>
            ))}
          </div>
          <div className="more-cta">
            <Button variant="secondary-inv" to="/products" icon="fa-solid fa-chevron-right" iconPosition="right">
              All products
            </Button>
          </div>
        </div>
      </section>

      <section className="product-closing-cta">
        <div className="wrap">
          <div className="closing-cta-card">
            <div>
              <h3>Have a question about {category.title}?</h3>
              <p>Sizes, finishes, samples, or a bulk quote — reach out and our sales team will get back to you.</p>
            </div>
            <Button variant="gold" to="/contact" icon="fa-solid fa-envelope" iconPosition="right">
              Contact us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
