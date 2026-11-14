import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartItem { id: number; qty: number }

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (id: number, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = 'kajok_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)); }, [items]);

  const add = useCallback((id: number, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) return prev.map(i => i.id === id ? { ...i, qty: Math.min(99, i.qty + qty) } : i);
      return [...prev, { id, qty }];
    });
  }, []);

  const remove = useCallback((id: number) => setItems(prev => prev.filter(i => i.id !== id)), []);
  const setQty = useCallback((id: number, qty: number) => {
    setItems(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty: Math.min(99, qty) } : i));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => ({
    items, count: items.reduce((s, i) => s + i.qty, 0), add, remove, setQty, clear,
  }), [items, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
