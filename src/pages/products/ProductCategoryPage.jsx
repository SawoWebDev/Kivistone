import { Link, Navigate, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button.jsx';
import { getCategory, categories } from '../../data/categories.js';
import './ProductCategoryPage.css';

const PLACEHOLDER_COUNT = 6;

export default function ProductCategoryPage() {
  const { slug } = useParams();
  const category = getCategory(slug);
  if (!category) return <Navigate to="/products" replace />;

  const others = categories.filter((c) => c.slug !== category.slug).slice(0, 4);

  return (
    <>
      <section className="product-hero light">
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <Link to="/products">Products</Link>
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            <span>{category.title}</span>
          </nav>

          <div className="ph-grid">
            <div>
              <h1>{category.title}</h1>
              <p className="lede">{category.description}</p>
              <ul className="specs">
                {category.specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="ph-image">
              <img src={category.image} alt={category.title} />
            </div>
          </div>
        </div>
      </section>

      <section className="product-grid light">
        <div className="wrap">
          <div className="pg-head">
            <h2>Styles in this range</h2>
            <p>Every piece is cut and hand-finished individually, so no two are exactly alike.</p>
          </div>

          <div className="product-tiles">
            {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => i + 1).map((n) => (
              <div className="product-tile" key={n}>
                <div className="img">
                  <img
                    src={`https://picsum.photos/seed/${category.seed}-${n}/700/560`}
                    alt={`${category.title} — style ${String(n).padStart(2, '0')}`}
                    loading="lazy"
                  />
                </div>
                <div className="label">Style {String(n).padStart(2, '0')}</div>
              </div>
            ))}
          </div>

          <div className="product-cta">
            <Button variant="outline" to="/contact" icon="fa-solid fa-envelope">
              Enquire about this range
            </Button>
            <Button
              variant="gold"
              href="http://www.kivistone.com/"
              external
              icon="fa-solid fa-arrow-up-right-from-square"
            >
              View on kivistone.com
            </Button>
          </div>
        </div>
      </section>

      <section className="product-more light">
        <div className="wrap">
          <div className="more-head">
            <h2>Other ranges</h2>
            <Link className="more-all" to="/products">
              All products <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
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
        </div>
      </section>
    </>
  );
}
