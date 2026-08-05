import Button from '../components/Button/Button.jsx';
import SectionHead from '../components/SectionHead/SectionHead.jsx';
import CategoryCard from '../components/CategoryCard/CategoryCard.jsx';
import ContactCard from '../components/ContactCard/ContactCard.jsx';
import { categories } from '../data/categories.js';
import './Home.css';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src="/assets/home/water-kettle.webp" alt="Kivistone soapstone scent warmers styled on a sunlit windowsill" />
          <div className="hero-scrim" />
          <div className="wrap hero-content">
            <h1><span className="accent">Carved once.</span><br />Kept forever.</h1>
            <p className="lede">
              Kivistone is a collection of beautiful pieces carved from Finnish soapstone, each one designed
              for house interiors, everyday use, or as a personal or corporate gift. Explore a wide selection
              of concepts and designs, all carved from the same enduring stone.
            </p>
            <div className="hero-actions">
              <Button variant="gold" to="/products" icon="fa-solid fa-chevron-right" iconPosition="right">
                View the collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="wrap">
          <div className="about-card">
            <div className="about-text">
              <h2>About Us</h2>
              <p>
                The Kivistone brand is owned and managed by Finns, who also own and manage{' '}
                <a className="inline-link" href="http://www.sawo.com/" target="_blank" rel="noopener noreferrer">SAWO Inc.</a>,
                a globally known sauna product manufacturer and one of the biggest names in the sauna industry.
              </p>
              <p>
                That shared ownership is why a gift item and a sauna heater come out of the same discipline: the
                same soapstone sourcing, the same production floor standards, and the same certifications behind
                every piece we ship.
              </p>
              <Button variant="gold" to="/about" icon="fa-solid fa-chevron-right" iconPosition="right" className="about-more">
                Learn More
              </Button>
            </div>
            <div className="about-image">
              <img src="/assets/home/prod_all1.webp" alt="A selection of Kivistone soapstone products" />
            </div>
          </div>
        </div>
      </section>

      <section className="soapstone">
        <div className="wrap soapstone-inner">
          <div className="soapstone-image">
            <img src="/assets/products/stone-coaster.webp" alt="Detail of hand-finished Kivistone soapstone" />
          </div>
          <div className="soapstone-text">
            <h2>About Soapstone</h2>
            <p>
              Soapstone is a soft metamorphic rock, high in talc content. For centuries it has been a material
              of choice for artisans crafting sculptures, cooking slabs, and bowls. It's widely used for inlaid
              designs, artistic pieces, and heating appliances: soapstone stores heat and cold exceptionally
              well, which makes it well suited to drink coolers, sizzling plates, and pizza stones.
            </p>
            <p>
              Finland is one of the world's largest suppliers of soapstone, used as a prime material in most
              heating masonry for fireplaces. Its use keeps evolving, most sauna heater manufacturers in
              Finland, like{' '}
              <a className="inline-link" href="http://www.sawo.com/" target="_blank" rel="noopener noreferrer">SAWO</a>,
              now design electric sauna heaters with soapstone.
            </p>
            <p>
              A scratched soapstone surface is easy to restore. Buffing it with fine-grit sandpaper brings it
              back to like-new condition, and wiping it with mineral oil gives it a darker, richer look.
            </p>
            <Button
              variant="dark"
              href="http://www.kivistone.com/kivistone%20brochure_5.pdf"
              external
              icon="fa-solid fa-file-pdf"
              iconPosition="right"
            >
              Download brochure
            </Button>
          </div>
        </div>
      </section>

      <section className="categories dark">
        <div className="wrap">
          <SectionHead
            title="View the categories of Kivistone soapstone products"
            description="Browse the full range by category, each collection is hand-finished from the same Finnish soapstone."
          />
          <div className="card-grid">
            {categories.map((c) => (
              <CategoryCard
                key={c.slug}
                title={c.title}
                description={c.short}
                imageSrc={c.image}
                imageAlt={c.title}
                to={`/products/${c.slug}`}
                dark
              />
            ))}
          </div>
          <div className="categories-cta">
            <Button variant="gold" to="/products" icon="fa-solid fa-chevron-right" iconPosition="right">
              See all product ranges
            </Button>
            <Button variant="secondary-inv" to="/contact" icon="fa-solid fa-percent">
              Save 20% on bulk orders
            </Button>
          </div>
        </div>
      </section>

      <section className="home-contact">
        <div className="wrap home-contact-inner">
          <div className="home-contact-copy">
            <h2>Tell us what you&rsquo;re looking for</h2>
            <p>
              Questions about a piece, a bulk order, or working with Finnish soapstone in general: our sales
              team at the SAWO factory in Cebu handles enquiries, samples, and export quotes.
            </p>
            <Button variant="dark" to="/contact" icon="fa-solid fa-envelope">
              Get in touch
            </Button>
          </div>
          <ContactCard />
        </div>
      </section>
    </>
  );
}
