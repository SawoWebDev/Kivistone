import Button from '../components/Button/Button.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import './NotFound.css';

export default function NotFound() {
  usePageMeta({
    title: 'Page Not Found | Kivistone',
    description: 'The page you were looking for doesn\'t exist. Browse the full Kivistone Finnish soapstone collection instead.',
    noIndex: true,
  });

  return (
    <section className="not-found">
      <div className="wrap not-found-inner">
        <span className="not-found-code">404</span>
        <h1>Page not found</h1>
        <p>The page you were looking for doesn&rsquo;t exist or may have moved.</p>
        <div className="not-found-actions">
          <Button variant="gold" to="/" icon="fa-solid fa-house">
            Back to home
          </Button>
          <Button variant="secondary-inv" to="/products" icon="fa-solid fa-chevron-right" iconPosition="right">
            Browse products
          </Button>
        </div>
      </div>
    </section>
  );
}
