import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { searchSite } from '../../data/searchIndex.js';
import './SearchBar.css';

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const trimmed = query.trim();
  const results = searchSite(trimmed);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // route changed (including a result being picked) — reset for next time
  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
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

  function onSubmit(e) {
    e.preventDefault();
    if (results.length) navigate(results[0].path);
  }

  return (
    <div className={`site-search${open ? ' open' : ''}`} ref={containerRef}>
      {/* input grows out from behind the toggle button, staying in the
          header's own row — not a panel dropping down below it */}
      <form className="search-inline" onSubmit={onSubmit} role="search">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search products and pages"
          tabIndex={open ? 0 : -1}
        />
      </form>

      <button
        type="button"
        className="search-toggle"
        aria-label={open ? 'Close search' : 'Search'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <i className={open ? 'fa-solid fa-xmark' : 'fa-solid fa-magnifying-glass'} aria-hidden="true" />
      </button>

      {open && trimmed && (
        <div className="search-results">
          {results.length === 0 ? (
            <p className="search-empty">No matches for &ldquo;{trimmed}&rdquo;.</p>
          ) : (
            results.map((r) => (
              <Link key={r.path} to={r.path} className="search-result">
                {r.type === 'product' ? (
                  <img className="search-result-thumb" src={r.image} alt="" loading="lazy" decoding="async" />
                ) : (
                  <span className="search-result-thumb search-result-icon">
                    <i className="fa-solid fa-layer-group" aria-hidden="true" />
                  </span>
                )}
                <span className="search-result-text">
                  <span className="search-result-title">{r.title}</span>
                  <span className="search-result-subtitle">{r.subtitle}</span>
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
