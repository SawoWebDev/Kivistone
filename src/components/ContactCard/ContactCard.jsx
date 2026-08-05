import './ContactCard.css';

const ROWS = [
  {
    icon: 'fa-solid fa-location-dot',
    label: 'Factory / Office',
    value: ['SAWO INC.', 'Mactan Export Processing Zone 2', 'Cebu, Philippines 6015'],
  },
  { icon: 'fa-solid fa-envelope', label: 'Email', value: 'sales@kivistone.com', href: 'mailto:sales@kivistone.com' },
  { icon: 'fa-solid fa-phone', label: 'Telephone', value: '+63-32-341 2233', href: 'tel:+63323412233' },
  { icon: 'fa-solid fa-fax', label: 'Fax', value: '+63-32-341 2255' },
  { icon: 'fa-solid fa-globe', label: 'Website', value: 'kivistone.com', href: 'https://www.kivistone.com/' },
];

export default function ContactCard() {
  return (
    <div className="contact-card" id="contact">
      {ROWS.map((row) => (
        <div className="contact-row" key={row.label}>
          <div className="ic"><i className={row.icon} aria-hidden="true" /></div>
          <div className="contact-row-body">
            <span className="label">{row.label}</span>
            {row.href ? (
              <a href={row.href} target={row.href.startsWith('http') ? '_blank' : undefined} rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                {row.value}
              </a>
            ) : Array.isArray(row.value) ? (
              <span className="value address">
                {row.value.map((line) => <span key={line}>{line}</span>)}
              </span>
            ) : (
              <span className="value">{row.value}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
