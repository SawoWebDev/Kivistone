import { Link } from 'react-router-dom';
import './CategoryCard.css';

export default function CategoryCard({ title, imageSrc, imageAlt, to, href, ctaLabel = 'Browse category' }) {
  const Wrapper = to ? Link : 'a';
  const wrapperProps = to
    ? { to }
    : { href, target: '_blank', rel: 'noopener noreferrer' };

  return (
    <Wrapper className="cat-card" {...wrapperProps}>
      <div className="img">
        <img src={imageSrc} alt={imageAlt || title} />
      </div>
      <div className="body">
        <h3>{title}</h3>
        <div className="go">
          <span>{ctaLabel}</span>
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </div>
      </div>
    </Wrapper>
  );
}
