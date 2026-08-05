import { Outlet, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import BackToTop from '../components/BackToTop/BackToTop.jsx';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default function MainLayout() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <Header />
      <main style={{ position: 'relative' }}>
        <Outlet />
        <div key={pathname} className="page-fade-overlay" aria-hidden="true" />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
