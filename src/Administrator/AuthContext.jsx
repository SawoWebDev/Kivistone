// src/Administrator/AuthContext.jsx
//
// Small session context wrapping /api/auth/me + login/logout, mounted once
// around the /admin/* route tree. All admin accounts have equal access (no
// roles/capabilities), so this only ever needs to answer "is someone logged
// in, and as whom" — ProtectedRoute and AdminLayout both read off this.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { request } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await request('/api/auth/me');
      setUsername(data?.username || null);
      setDisplayName(data?.displayName || null);
    } catch {
      setUsername(null);
      setDisplayName(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (user, password) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: { username: user, password },
    });
    setUsername(data?.username || user);
    setDisplayName(data?.displayName || null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setUsername(null);
      setDisplayName(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ username, displayName, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>');
  return ctx;
}
