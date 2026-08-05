import { Link } from 'react-router-dom';
import './CategoryCard.css';

export default function CategoryCard({ title, description, imageSrc, imageAlt, to, href, ctaLabel = 'View range', dark = false }) {
  const Tag = to ? Link : 'a';
  const linkProps = to ? { to } : { href, target: '_blank', rel: 'noopener noreferrer' };

  return (
    <Tag className={`cat-card${dark ? ' dark' : ''}`} {...linkProps}>
      <div className="img">
        <img src={imageSrc} alt={imageAlt || title} loading="lazy" decoding="async" />
      </div>
      <div className="body">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        <span className="cat-card-go">
          <span className="cat-card-go-btn">
            {ctaLabel}
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </span>
        </span>
      </div>
    </Tag>
  );
}
