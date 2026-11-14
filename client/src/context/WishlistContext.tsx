import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, getToken } from '../lib/api';
import { useAuth } from './AuthContext';

interface WishlistContextValue {
  ids: number[];
  toggle: (id: number) => void;
  has: (id: number) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const WISH_KEY = 'kajok_wishlist';

const loadLocal = (): number[] => { try { return JSON.parse(localStorage.getItem(WISH_KEY) || '[]'); } catch { return []; } };

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<number[]>(loadLocal);

  // On login, merge server-side wishlist with local
  useEffect(() => {
    if (!user) return;
    api<{ product_ids: number[] }>('/wishlist')
      .then(d => { setIds(prev => Array.from(new Set([...prev, ...d.product_ids]))); })
      .catch(() => {});
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { localStorage.setItem(WISH_KEY, JSON.stringify(ids)); }, [ids]);

  const toggle = useCallback((id: number) => {
    setIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    if (getToken()) api('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ product_id: id }) }).catch(() => {});
  }, []);

  const has = useCallback((id: number) => ids.includes(id), [ids]);

  const value = useMemo(() => ({ ids, toggle, has, count: ids.length }), [ids, toggle, has]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
