import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, getToken, setToken } from '../lib/api';

export interface User {
  id: number; email: string; full_name: string; phone: string | null;
  role: 'customer' | 'admin'; language: 'ar' | 'en'; country: 'EG' | 'SD'; currency: 'EGP' | 'SDG';
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { full_name: string; email: string; password: string; phone?: string; language?: string; country?: string; currency?: string }) => Promise<User>;
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, 'full_name' | 'phone' | 'language' | 'country' | 'currency'>>) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try {
      const data = await api<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback<AuthContextValue['register']>(async (payload) => {
    const data = await api<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(async (patch) => {
    const data = await api<{ user: User }>('/auth/profile', { method: 'PUT', body: JSON.stringify(patch) });
    setUser(data.user);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, loading, isAdmin: user?.role === 'admin',
    login, register, logout, updateProfile, refresh,
  }), [user, loading, login, register, logout, updateProfile, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
