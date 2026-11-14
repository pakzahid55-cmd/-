import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../lib/types";

interface WishlistState {
  items: Product[];
  has: (productId: number) => boolean;
  toggle: (product: Product) => void;
  remove: (productId: number) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      has: (productId) => get().items.some((i) => i.id === productId),
      toggle: (product) =>
        set((state) => ({
          items: state.items.some((i) => i.id === product.id)
            ? state.items.filter((i) => i.id !== product.id)
            : [...state.items, product],
        })),
      remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),
    }),
    { name: "kajok.wishlist" },
  ),
);

interface RecentlyViewedState {
  items: Product[];
  add: (product: Product) => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      add: (product) =>
        set((state) => ({
          items: [product, ...state.items.filter((i) => i.id !== product.id)].slice(0, 10),
        })),
    }),
    { name: "kajok.recent" },
  ),
);
