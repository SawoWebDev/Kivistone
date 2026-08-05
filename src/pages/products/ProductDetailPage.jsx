import { Link, Navigate, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button.jsx';
import { getCategory } from '../../data/categories.js';
import { getProduct, getProductsForCategory } from '../../data/products.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { slug, productId } = useParams();
  const category = getCategory(slug);
  const product = category ? getProduct(category.slug, productId) : undefined;

  const related = product
    ? getProductsForCategory(category.slug).filter((p) => p.id !== product.id).slice(0, 4)
    : [];

  usePageMeta(
    product ? `${product.name} — ${category.title} | Kivistone` : undefined,
    product
      ? `${product.name}: ${category.title.toLowerCase()} in natural soapstone.${product.sizeMm ? ` Size(mm): ${product.sizeMm},` : ''} Weight: ${product.weightLabel || `${product.weightKg}kg`}.`
      : undefined
  );

  if (!category || !product) return <Navigate to="/products" replace />;

  return (
    <section className="product-detail light">
      <div className="wrap">
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/products">Products</Link>
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          <Link to={`/products/${category.slug}`}>{category.title}</Link>
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          <span>{product.name}</span>
        </nav>

        <div className="pd-main">
          <div className="pd-media">
            <img src={product.image} alt={product.name} />
          </div>

          <div className="pd-info">
            <span className="pd-category">{category.title}</span>
            <h1>{product.name}</h1>
            <ul className="pd-specs">
              {product.sizeMm && (
                <li>
                  <span className="pd-specs-label">Size (mm)</span>
                  <span>{product.sizeMm}</span>
                </li>
              )}
              <li>
                <span className="pd-specs-label">Weight</span>
                <span>{product.weightLabel || `${product.weightKg}kg`}</span>
              </li>
              <li>
                <span className="pd-specs-label">Material</span>
                <span>Natural soapstone</span>
              </li>
            </ul>
            <p className="pd-desc">{category.short}</p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="pd-related">
            <h2>More from {category.title}</h2>
            <div className="pd-related-grid">
              {related.map((p) => (
                <Link className="pd-related-tile" key={p.id} to={`/products/${category.slug}/${p.id}`}>
                  <div className="img">
                    <img src={p.image} alt={p.name} loading="lazy" />
                  </div>
                  <span>{p.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pd-closing-cta">
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
      </div>
    </section>
  );
}
