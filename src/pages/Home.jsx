import Button from '../components/Button/Button.jsx';
import SectionHead from '../components/SectionHead/SectionHead.jsx';
import CategoryCard from '../components/CategoryCard/CategoryCard.jsx';
import { categories } from '../data/categories.js';
import './Home.css';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src="/assets/home/water-kettle.png" alt="Kivistone soapstone scent warmers styled on a sunlit windowsill" />
          <div className="hero-scrim" />
          <div className="wrap hero-content">
            <h1>Stone, shaped once, kept for generations</h1>
            <p className="lede">
              Kivistone is a collection of beautiful pieces carved from Finnish soapstone — each one designed
              for house interiors, everyday use, or as a personal or corporate gift. Explore a wide selection
              of concepts and designs, all carved from the same enduring stone.
            </p>
            <div className="hero-actions">
              <Button variant="gold" to="/products" icon="fa-solid fa-arrow-right">
                View the collection
              </Button>
              <Button variant="secondary-inv" to="/about">Learn about soapstone</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="wrap">
          <div className="about-card">
            <div className="about-text">
              <h2>About soapstone</h2>
              <p>
                Soapstone is a soft metamorphic rock, high in talc content. For centuries it has been a material
                of choice for artisans crafting sculptures, cooking slabs, and bowls. It's widely used for inlaid
                designs, artistic pieces, and heating appliances — soapstone stores heat and cold exceptionally
                well, which makes it well suited to drink coolers, sizzling plates, and pizza stones.
              </p>
              <p>
                Finland is one of the world's largest suppliers of soapstone, used as a prime material in most
                heating masonry for fireplaces. Its use keeps evolving — most sauna heater manufacturers in
                Finland, like{' '}
                <a className="inline-link" href="http://www.sawo.com/" target="_blank" rel="noopener noreferrer">SAWO</a>,
                now design electric sauna heaters with soapstone.
              </p>
              <p>
                A scratched soapstone surface is easy to restore. Buffing it with fine-grit sandpaper brings it
                back to like-new condition, and wiping it with mineral oil gives it a darker, richer look.
              </p>
            </div>
            <div className="about-image">
              <img src="/assets/home/prod_all1.jpg" alt="A selection of Kivistone soapstone products" />
            </div>
          </div>
        </div>
      </section>

      <section className="promo">
        <div className="wrap">
          <div className="promo-card">
            <div className="promo-media">
              <img src="/assets/home/get_20percent_less_when_ordering_in_bulk.jpg" alt="Save 20% when ordering Kivistone products in bulk" />
            </div>
            <div className="promo-body">
              <h3>Save 20% when you order in bulk</h3>
              <p>Stocking up for a shop, a project, or corporate gifting? Talk to our sales team about volume pricing.</p>
              <Button variant="outline" to="/contact" icon="fa-solid fa-envelope">
                Get a bulk quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="categories light">
        <div className="wrap">
          <SectionHead
            title="View the categories of Kivistone soapstone products"
            description="Browse the full range by category — each collection is hand-finished from the same Finnish soapstone."
          />
          <div className="card-grid">
            {categories.map((c) => (
              <CategoryCard
                key={c.slug}
                title={c.title}
                imageSrc={c.image}
                imageAlt={c.title}
                to={`/products/${c.slug}`}
              />
            ))}
          </div>
          <div className="categories-cta">
            <Button variant="outline" to="/products" icon="fa-solid fa-arrow-right" iconPosition="right">
              See all product ranges
            </Button>
          </div>
        </div>
      </section>

      <section className="brochure">
        <div className="wrap">
          <div className="brochure-card">
            <div className="brochure-info">
              <div className="file-ic"><i className="fa-solid fa-file-pdf" aria-hidden="true" /></div>
              <div>
                <h3>Kivistone Brochure</h3>
                <p>PDF · complete product range &amp; specifications</p>
              </div>
            </div>
            <Button
              variant="gold"
              href="http://www.kivistone.com/kivistone%20brochure_5.pdf"
              external
              icon="fa-solid fa-download"
            >
              Download brochure
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
