import { Link } from 'react-router-dom';
import ContactCard from '../components/ContactCard/ContactCard.jsx';
import ContactForm from '../components/ContactForm/ContactForm.jsx';
import Button from '../components/Button/Button.jsx';
import { categories } from '../data/categories.js';
import usePageMeta from '../hooks/usePageMeta.js';
import './Contact.css';

const LOCAL_BUSINESS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Kivistone (SAWO Inc.)',
  image: 'https://www.kivistone.com/assets/home/water-kettle.webp',
  email: 'sales@kivistone.com',
  telephone: '+63-32-341-2233',
  faxNumber: '+63-32-341-2255',
  url: 'https://www.kivistone.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Mactan Export Processing Zone 2',
    addressLocality: 'Cebu',
    postalCode: '6015',
    addressCountry: 'PH',
  },
};

export default function Contact() {
  usePageMeta({
    title: 'Contact Kivistone — Enquiries, Samples & Bulk Quotes',
    description:
      'Get in touch with Kivistone for product enquiries, samples, and export quotes on Finnish soapstone candle holders, dish plates, coolers, and gifts. Our sales team at the SAWO factory in Cebu is ready to help.',
    image: '/assets/home/water-kettle.webp',
    path: '/contact',
    jsonLd: LOCAL_BUSINESS_JSON_LD,
  });

  return (
    <>
      <section className="contact-hero">
        <div className="contact-hero-media">
          <img
            src="/assets/home/water-kettle.webp"
            alt="Kivistone soapstone pieces ready for enquiry"
            fetchpriority="high"
          />
          <div className="contact-hero-scrim" />
          <div className="wrap contact-hero-content">
            <h1><span className="accent">Tell us</span><br />what you&rsquo;re looking for</h1>
            <p>
              From a single gift piece to an export order, our team is ready to help you find the right
              soapstone product and quote it accurately.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-page">
        <div className="wrap">
          <h2 className="block-title">Send an enquiry</h2>
          <div className="contact-grid">
            <div className="contact-main">
              <ContactForm />
            </div>

            <aside className="contact-side">
              <div className="side-block">
                <h2>Products</h2>
                <ul className="product-links">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link to={`/products/${c.slug}`}>
                        <i className="fa-solid fa-plus" aria-hidden="true" />
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="side-block brochure-block">
                <h2>Catalog</h2>
                <p>The full product range and specifications, as a PDF.</p>
                <Button
                  variant="gold"
                  href="http://www.kivistone.com/kivistone%20brochure_5.pdf"
                  external
                  icon="fa-solid fa-file-pdf"
                >
                  Download brochure
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="contact-band">
        <div className="wrap contact-band-inner">
          <div className="contact-band-copy">
            <h2>Tell us what you&rsquo;re looking for</h2>
            <p>
              Questions about a piece, a bulk order, or working with Finnish soapstone in general: our sales
              team at the SAWO factory in Cebu handles enquiries, samples, and export quotes.
            </p>
          </div>
          <ContactCard />
        </div>
      </section>

      <section className="contact-cta">
        <div className="wrap">
          <div className="contact-cta-card">
            <div>
              <h3>See the full range</h3>
              <p>Soapstone products and gift items, the complete catalog with specifications.</p>
            </div>
            <div className="contact-cta-actions">
              <Button
                variant="gold"
                href="http://www.kivistone.com/kivistone%20brochure_5.pdf"
                external
                icon="fa-solid fa-download"
              >
                Download brochure
              </Button>
              <Button variant="secondary-inv" to="/products" icon="fa-solid fa-chevron-right" iconPosition="right">
                Browse products
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
