import { Link } from 'react-router-dom';
import { categories } from '../../data/categories.js';
import './Footer.css';

const SOCIAL = [
  { href: 'http://facebook.com/SAWOsaunaworld', icon: 'fab fa-facebook-f', label: 'Kivistone on Facebook' },
  { href: 'https://www.instagram.com/sawosauna/', icon: 'fab fa-instagram', label: 'Kivistone on Instagram' },
  { href: 'https://ph.linkedin.com/company/sawo-inc', icon: 'fab fa-linkedin-in', label: 'Kivistone on LinkedIn' },
  { href: 'https://www.youtube.com/@SAWOsauna', icon: 'fab fa-youtube', label: 'Kivistone on YouTube' },
  { href: 'https://www.tiktok.com/@sawosauna', icon: 'fab fa-tiktok', label: 'Kivistone on TikTok' },
];

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="logo"><span className="logo-text">Kivi<span className="logo-stone">stone</span><span className="logo-dot">.</span></span></div>
            <p className="about-blurb">
              A collection of beautiful products carved from Finnish soapstone, for interiors, household use, and gifting.
            </p>
            <div className="social-row">
              {SOCIAL.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <i className={s.icon} aria-hidden="true" />
                </a>
              ))}
              <a href="mailto:sales@kivistone.com" aria-label="Email Kivistone support">
                <i className="fas fa-envelope" aria-hidden="true" />
              </a>
              <a href="tel:+63323412233" aria-label="Call Kivistone">
                <i className="fas fa-phone" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <p className="footer-heading">Products</p>
            {categories.map((c) => (
              <Link key={c.slug} to={`/products/${c.slug}`}>{c.title}</Link>
            ))}
          </div>

          <div className="footer-col">
            <p className="footer-heading">Company</p>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <a href="https://www.kivistone.com/kivistone%20brochure_5.pdf" target="_blank" rel="noopener noreferrer">
              Download brochure
            </a>
          </div>

          <div className="footer-col">
            <p className="footer-heading">Get in touch</p>
            <a href="mailto:sales@kivistone.com">sales@kivistone.com</a>
            <a href="tel:+63323412233">+63-32-341 2233</a>
            <a href="https://www.kivistone.com/" target="_blank" rel="noopener noreferrer">kivistone.com</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Kivistone. All rights reserved.</span>
          <span>Finnish soapstone, hand-finished in small batches</span>
        </div>
      </div>
    </footer>
  );
}
