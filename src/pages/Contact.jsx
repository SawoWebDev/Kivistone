import { Link } from 'react-router-dom';
import ContactCard from '../components/ContactCard/ContactCard.jsx';
import ContactForm from '../components/ContactForm/ContactForm.jsx';
import Button from '../components/Button/Button.jsx';
import { categories } from '../data/categories.js';
import './Contact.css';

export default function Contact() {
  return (
    <section className="contact-page">
      <div className="wrap">
        <div className="contact-banner">
          <div className="banner-copy">
            <h1>Tell us what you&rsquo;re looking for</h1>
            <p>
              Questions about a piece, a bulk order, or working with Finnish soapstone in general — our sales
              team at the SAWO factory in Cebu handles enquiries, samples, and export quotes.
            </p>
          </div>
          <ContactCard />
        </div>

        <div className="contact-grid">
          <div className="contact-main">
            <h2 className="block-title">Send an enquiry</h2>
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
                variant="outline"
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
  );
}
