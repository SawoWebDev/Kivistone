import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Button from '../Button/Button.jsx';
import { categories } from '../../data/categories.js';
import './Header.css';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [silver, setSilver] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('kivistone-theme') === 'silver'
  );
  const itemRef = useRef(null);
  const lastY = useRef(0);
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', silver ? 'silver' : 'gold');
    localStorage.setItem('kivistone-theme', silver ? 'silver' : 'gold');
  }, [silver]);

  useEffect(() => {
    function onClickOutside(e) {
      if (itemRef.current && !itemRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // close the menus whenever navigation happens, including to the page we're on
  useEffect(() => {
    setOpen(false);
    setMobileOpen(false);
    setMobileProductsOpen(false);
  }, [pathname]);

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // hide the header on scroll-down, reveal it again on scroll-up
  useEffect(() => {
    lastY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 80) setHidden(false);
      else if (delta > 4) setHidden(true);
      else if (delta < -4) setHidden(false);
      lastY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onProducts = pathname.startsWith('/products');

  return (
    <header className={`site-header${hidden ? ' hidden' : ''}`}>
      <div className="wrap">
        <NavLink to="/" className="logo">
          <span className="logo-text">Kivi<span className="logo-stone">stone</span><span className="logo-dot">.</span></span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>

          <div className={`nav-item${open ? ' open' : ''}`} ref={itemRef}>
            <NavLink to="/products" className={onProducts ? 'nav-trigger active' : 'nav-trigger'}>
              Products
            </NavLink>
            <button
              type="button"
              className="nav-caret"
              aria-label="Show product ranges"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <i className="fa-solid fa-chevron-down" aria-hidden="true" />
            </button>

            <div className="dropdown">
              <NavLink className="dd-all" to="/products" end>
                All products
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </NavLink>
              <div className="dd-list">
                {categories.map((c) => (
                  <NavLink key={c.slug} to={`/products/${c.slug}`}>
                    {c.title}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="header-right">
          <Button
            variant="dark"
            className="nav-cta"
            to="/products"
            icon="fa-solid fa-chevron-right"
            iconPosition="right"
          >
            Explore
          </Button>

          <button
            type="button"
            className="theme-toggle"
            role="switch"
            aria-checked={silver}
            aria-label="Toggle silver mode"
            onClick={() => setSilver((v) => !v)}
          >
            <span className={silver ? '' : 'active'} aria-hidden="true">G</span>
            <span className={silver ? 'active' : ''} aria-hidden="true">S</span>
          </button>

          <button
            type="button"
            className={`menu-toggle${mobileOpen ? ' open' : ''}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        <nav className="mobile-nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>

          <div className={`mobile-nav-item${mobileProductsOpen ? ' open' : ''}`}>
            <div className="mobile-nav-row">
              <NavLink to="/products" className={onProducts ? 'active' : ''}>
                Products
              </NavLink>
              <button
                type="button"
                className="mobile-caret"
                aria-label="Show product ranges"
                aria-expanded={mobileProductsOpen}
                onClick={() => setMobileProductsOpen((v) => !v)}
              >
                <i className="fa-solid fa-chevron-down" aria-hidden="true" />
              </button>
            </div>
            <div className="mobile-dropdown">
              {categories.map((c) => (
                <NavLink key={c.slug} to={`/products/${c.slug}`}>
                  {c.title}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/contact">Contact</NavLink>
        </nav>

        <div className="mobile-nav-footer">
          <Button
            variant="dark"
            className="nav-cta"
            to="/products"
            icon="fa-solid fa-chevron-right"
            iconPosition="right"
          >
            Explore
          </Button>

          <button
            type="button"
            className="theme-toggle"
            role="switch"
            aria-checked={silver}
            aria-label="Toggle silver mode"
            onClick={() => setSilver((v) => !v)}
          >
            <span className={silver ? '' : 'active'} aria-hidden="true">G</span>
            <span className={silver ? 'active' : ''} aria-hidden="true">S</span>
          </button>
        </div>
      </div>
    </header>
  );
}
