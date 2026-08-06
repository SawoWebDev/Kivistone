import { Link } from 'react-router-dom';
import './Button.css';

export default function Button({
  variant, // eslint-disable-line no-unused-vars -- kept out of ...rest so it never leaks onto the DOM node; every button shares the one btn-gold style now
  to,
  href,
  external = false,
  icon,
  iconPosition = 'left',
  children,
  className = '',
  ...rest
}) {
  const classes = `btn btn-gold ${className}`.trim();
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
