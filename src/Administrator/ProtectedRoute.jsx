// src/Administrator/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

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
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
