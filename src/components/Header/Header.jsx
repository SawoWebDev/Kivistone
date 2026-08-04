import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Button from '../Button/Button.jsx';
import { categories } from '../../data/categories.js';
import './Header.css';

export default function Header() {
  const [open, setOpen] = useState(false);
  const itemRef = useRef(null);
  const { pathname } = useLocation();

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

  // close the menu whenever navigation happens, including to the page we're on
  useEffect(() => setOpen(false), [pathname]);

  const onProducts = pathname.startsWith('/products');

  return (
    <header className="site-header">
      <div className="wrap">
        <NavLink to="/" className="logo">
          <span className="mark" />Kivistone
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>

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
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
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
          <NavLink to="/about">About</NavLink>
        </nav>

        <Button
          variant="primary"
          className="nav-cta"
          to="/products"
          icon="fa-solid fa-chevron-right"
          iconPosition="right"
        >
          Explore
        </Button>
      </div>
    </header>
  );
}
