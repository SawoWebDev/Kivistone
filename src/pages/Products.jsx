import { Link } from 'react-router-dom';
import Button from '../components/Button/Button.jsx';
import { categories, featuredCategories, standardCategories } from '../data/categories.js';
import './Products.css';

function ProductCard({ category, index, variant = 'standard' }) {
  return (
    <Link className={`prod-card ${variant}`} to={`/products/${category.slug}`}>
      <div className="img">
        <img src={category.image} alt={category.title} loading="lazy" />
        <span className="idx">{String(index).padStart(2, '0')}</span>
      </div>
      <div className="body">
        <h3>{category.title}</h3>
        <p>{variant === 'feature' ? category.description : category.short}</p>
        <ul className="specs">
          {category.specs.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="go">
          <span>View the range</span>
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

export default function Products() {
  return (
    <>
      <section className="products-hero">
        <div className="ph-media">
          <img src="/assets/home/prod_all1.jpg" alt="A curated arrangement of Kivistone soapstone products" />
          <div className="ph-scrim" />
          <div className="wrap ph-content">
            <h1>Products</h1>
            <p className="lede">
              The Kivistone is an impenetrable product — its beauty will last a lifetime. Have a timeless
              Kivistone for yourself, or for the people you'd like to keep something for. We also make
              custom-made designs to your requirements: send your requests or drawings to our sales team
              and we'll get back to you the soonest.
            </p>
            <div className="ph-actions">
              <Button variant="primary" to="/contact" icon="fa-solid fa-pen-ruler">
                Request a custom design
              </Button>
              <Button
                variant="secondary"
                href="http://www.kivistone.com/kivistone%20brochure_5.pdf"
                external
                icon="fa-solid fa-file-pdf"
              >
                Download the full catalog
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="products-index light">
        <div className="wrap">
          <nav className="chip-nav" aria-label="Product ranges">
            {categories.map((c) => (
              <Link key={c.slug} to={`/products/${c.slug}`}>
                {c.title}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="products-grid light">
        <div className="wrap">
          <div className="feature-row">
            {featuredCategories.map((c) => (
              <ProductCard
                key={c.slug}
                category={c}
                variant="feature"
                index={categories.indexOf(c) + 1}
              />
            ))}
          </div>

          <div className="standard-grid">
            {standardCategories.map((c) => (
              <ProductCard key={c.slug} category={c} index={categories.indexOf(c) + 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="custom-band">
        <div className="wrap">
          <div className="cb-card">
            <div className="cb-text">
              <h2>Bring us a drawing, we'll carve it</h2>
              <p>
                Corporate gifts, commemorative pieces, sauna fittings, a shape that only makes sense in your
                kitchen — if it can be drawn, it can usually be cut from soapstone. Send a sketch, a photo or a
                rough measurement and our sales team will come back with what it takes to make it.
              </p>
              <div className="cb-actions">
                <Button variant="gold" to="/contact" icon="fa-solid fa-envelope">
                  Talk to our sales team
                </Button>
                <Button variant="outline-inv" to="/about">
                  Why soapstone
                </Button>
              </div>
            </div>
            <ol className="cb-steps">
              <li>
                <span>01</span>
                <div>
                  <h4>Send your drawing</h4>
                  <p>A sketch, CAD file or even a photo of the thing you have in mind.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h4>We quote and sample</h4>
                  <p>Dimensions, finish and volume pricing come back from the workshop.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h4>Carved and shipped</h4>
                  <p>Each piece is hand-finished, checked, and packed for transport.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
