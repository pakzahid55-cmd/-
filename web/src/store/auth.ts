import { create } from "zustand";
import { api, setToken } from "../lib/api";
import type { PublicUser } from "../lib/types";

interface AuthState {
  user: PublicUser | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<PublicUser>;
  logout: () => void;
  setUser: (user: PublicUser) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  initialized: false,

  initialize: async () => {
    const token = localStorage.getItem("kajok.token");
    if (!token) {
      set({ initialized: true });
      return;
    }
    try {
      const { user } = await api<{ user: PublicUser }>("/auth/me");
      set({ user, initialized: true });
    } catch {
      setToken(null);
      set({ user: null, initialized: true });
    }
  },

  login: async (email, password) => {
    const { token, user } = await api<{ token: string; user: PublicUser }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    setToken(token);
    set({ user });
    return user;
  },

  register: async (data) => {
    const { token, user } = await api<{ token: string; user: PublicUser }>("/auth/register", {
      method: "POST",
      body: data,
      auth: false,
    });
    setToken(token);
    set({ user });
    return user;
  },

  logout: () => {
    setToken(null);
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));
