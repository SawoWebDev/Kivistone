import Button from '../components/Button/Button.jsx';
import SectionHead from '../components/SectionHead/SectionHead.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import './About.css';

const STANDARDS = [
  {
    icon: 'fa-solid fa-certificate',
    label: 'ISO 9001:2000',
    title: 'Quality management',
    text: 'SAWO Inc. is a certified company, and the same quality management system governs how Kivistone soapstone pieces are produced and inspected.',
  },
  {
    icon: 'fa-solid fa-leaf',
    label: 'ISO 14001:2004',
    title: 'Environmental management',
    text: 'In our soapstone production process the highest international standards on environment protection are put into practice, exceeding local requirements.',
  },
  {
    icon: 'fa-solid fa-scale-balanced',
    label: 'Labour practice',
    title: 'Fair, supervised, verified',
    text: 'SAWO Inc. strictly follows local and international labour laws and good practices, under the supervision of an independent third party and local officials.',
  },
];

export default function About() {
  usePageMeta({
    title: 'About Kivistone — Finnish Soapstone, Made by SAWO Inc.',
    description:
      'Kivistone is owned and managed by the Finnish team behind SAWO Inc., a leading sauna product manufacturer. Every piece shares the same soapstone sourcing, production standards, and ISO certifications.',
    image: '/assets/home/a4.webp',
    path: '/about',
  });

  return (
    <>
      <section className="story">
        <div className="story-media">
          <img
            src="/assets/home/a4.webp"
            alt="Finnish soapstone hand-finished into a sizzling serving plate"
            fetchpriority="high"
          />
          <div className="story-scrim" />
          <div className="wrap story-content">
            <h1 className="hero-heading"><span className="accent">Finnish stone,</span><br />Finnish standards</h1>
            <p>
              The Kivistone brand name is owned and managed by Finns, who also own and manage the worldwide
              known sauna product manufacturer{' '}
              <a className="inline-link" href="http://www.sawo.com/" target="_blank" rel="noopener noreferrer">SAWO Inc.</a>
              , one of the biggest manufacturers in the sauna industry.
            </p>
            <p>
              That shared ownership is why a gift item and a sauna heater come out of the same discipline: the
              same soapstone sourcing, the same production floor standards, and the same certifications behind
              every piece we ship.
            </p>
            <div className="actions">
              <Button variant="gold" to="/contact" icon="fa-solid fa-envelope">Get in touch</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="standards light">
        <div className="wrap">
          <SectionHead
            title="SAWO Incorporated"
            description="Kivistone is made under the certifications, environmental controls, and labour practices SAWO Inc. is audited against."
          />
          <div className="standard-grid">
            {STANDARDS.map((s) => (
              <div className="standard-card" key={s.label}>
                <div className="standard-ic"><i className={s.icon} aria-hidden="true" /></div>
                <span className="standard-label">{s.label}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>

          <div className="about-cta-card">
            <div>
              <h3>See the full range</h3>
              <p>Soapstone products and gift items, the complete catalog with specifications.</p>
            </div>
            <div className="about-cta-actions">
              <Button
                variant="gold"
                href="https://www.kivistone.com/kivistone%20brochure_5.pdf"
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
