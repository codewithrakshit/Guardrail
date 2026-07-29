'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('guardrail_token');
      if (!token) { setUser(null); setLoading(false); return; }
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('guardrail_token');
      localStorage.removeItem('guardrail_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('guardrail_token', res.data.token);
    localStorage.setItem('guardrail_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('guardrail_token');
    localStorage.removeItem('guardrail_user');
    setUser(null);
    window.location.href = '/login';
  };

  const hasRole = (role) => {
    if (!user) return false;
    const hierarchy = { viewer: 1, editor: 2, admin: 3 };
    return (hierarchy[user.role] || 0) >= (hierarchy[role] || 0);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
