import { create } from 'zustand';
import { api, setToken } from '../lib/api';
import { firebaseAuth, firebaseEnabled } from '../lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut, updateProfile } from '@firebase/auth';
import type { PublicUser } from '../lib/types';

export class EmailVerificationSent extends Error {}

interface AuthState {
  user: PublicUser | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<PublicUser>;
  loginWithFirebase: (idToken: string) => Promise<PublicUser>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<PublicUser>;
  logout: () => void;
  setUser: (user: PublicUser) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,
  initialize: async () => {
    try {
      if (firebaseEnabled) {
        await firebaseAuth().authStateReady();
        if (firebaseAuth().currentUser) {
          try { set({ user: (await api<{ user: PublicUser }>('/auth/me')).user }); }
          catch (error) {
            if ((error as { status?: number }).status !== 401) throw error;
            await get().loginWithFirebase(await firebaseAuth().currentUser!.getIdToken());
          }
          return;
        }
      } else if (localStorage.getItem('kujuk.token')) {
        const { user } = await api<{ user: PublicUser }>('/auth/me');
        set({ user });
      }
    } catch { set({ user: null }); }
    finally { set({ initialized: true }); }
  },
  login: async (email, password) => {
    if (firebaseEnabled) {
      const { user } = await signInWithEmailAndPassword(firebaseAuth(), email, password);
      return get().loginWithFirebase(await user.getIdToken());
    }
    const { token, user } = await api<{ token: string; user: PublicUser }>('/auth/login', { method: 'POST', auth: false, body: { email, password } });
    setToken(token);
    set({ user });
    return user;
  },
  loginWithFirebase: async (idToken) => {
    const { user } = await api<{ user: PublicUser }>('/auth/firebase', { method: 'POST', auth: false, body: { idToken } });
    set({ user });
    return user;
  },
  register: async data => {
    if (firebaseEnabled) {
      const { user } = await createUserWithEmailAndPassword(firebaseAuth(), data.email, data.password);
      await updateProfile(user, { displayName: data.name });
      await sendEmailVerification(user);
      await signOut(firebaseAuth());
      throw new EmailVerificationSent();
    }
    const { token, user } = await api<{ token: string; user: PublicUser }>('/auth/register', { method: 'POST', auth: false, body: data });
    setToken(token);
    set({ user });
    return user;
  },
  logout: () => {
    setToken(null);
    if (firebaseEnabled) void import("../lib/push").then(m => m.disablePush()).catch(() => undefined).finally(() => signOut(firebaseAuth()));
    set({ user: null });
  },
  setUser: user => set({ user }),
}));
