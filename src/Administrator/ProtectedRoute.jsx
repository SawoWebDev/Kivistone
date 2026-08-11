// src/Administrator/ProtectedRoute.jsx
// Unauthenticated visits to /admin/* render the same 404 page as any other
// unknown URL, rather than redirecting to /login — an unauthenticated
// visitor (or bot) hitting /admin/* has no way to tell an admin panel is
// there at all. /login itself is a separate, unprotected route in App.jsx.
import { lazy, Suspense } from 'react';
import { useAuth } from './AuthContext.jsx';

const NotFound = lazy(() => import('../pages/NotFound.jsx'));

export default function ProtectedRoute({ children }) {
  const { username, loading } = useAuth();

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <i className="fa-solid fa-circle-notch fa-spin" />
        <span>Loading…</span>
      </div>
    );
  }

  if (!username) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    );
  }

  return children;
}
