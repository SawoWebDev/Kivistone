import { Link } from 'react-router-dom';
import './Button.css';

/*
  Two buttons, site-wide: the gold primary and the glass secondary from the
  home hero. `secondary-inv` is the same secondary button, just re-tinted for
  dark sections and photo scrims — not a third design.
*/
const VARIANT_CLASS = {
  gold: 'btn-gold',
  secondary: 'btn-secondary',
  'secondary-inv': 'btn-secondary-inv',
};

export default function Button({
  variant = 'gold',
  to,
  href,
  external = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  ...rest
}) {
  const classes = `btn ${VARIANT_CLASS[variant] || VARIANT_CLASS.gold} ${className}`.trim();
  const iconEl = icon ? <i className={icon} aria-hidden="true" /> : null;
  const content = (
    <>
      {iconPosition === 'left' && iconEl}
      {children}
      {iconPosition === 'right' && iconEl}
    </>
  );

  if (to) {
    return (
      <Link className={classes} to={to} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
