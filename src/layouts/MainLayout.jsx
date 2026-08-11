import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useLayoutEffect } from 'react';
import Header from '../components/Header/Header.jsx';
import Footer from '../components/Footer/Footer.jsx';
import BackToTop from '../components/BackToTop/BackToTop.jsx';
import { trackDuration, trackPageview } from '../lib/track.js';

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

  // Fire-and-forget analytics: a pageview per route change, plus a
  // sendBeacon'd time-on-page once the visitor leaves the route (either by
  // navigating within the SPA or closing/unloading the tab). Never throws —
  // trackPageview/trackDuration swallow their own errors, so a missing/down
  // tracking backend can't affect the page.
  useEffect(() => {
    let pageviewId = null;
    let cancelled = false;
    const enteredAt = Date.now();

    trackPageview(pathname).then((id) => {
      if (!cancelled) pageviewId = id;
    });

    const reportDuration = () => {
      if (pageviewId) trackDuration(pageviewId, (Date.now() - enteredAt) / 1000);
    };

    window.addEventListener('pagehide', reportDuration);

    return () => {
      cancelled = true;
      reportDuration();
      window.removeEventListener('pagehide', reportDuration);
    };
  }, [pathname]);

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
