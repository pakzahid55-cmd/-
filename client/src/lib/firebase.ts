// Firebase configuration for KAJOK (project: kajok-65089)
// Note: the client SDK config is not secret — it identifies the project.
// NEVER put Firebase *Admin* credentials in the frontend.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAI1aPdvgqqYLiW3XHtnqNANVeo1S9piKg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'kajok-65089.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kajok-65089',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'kajok-65089.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '902554080627',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:902554080627:web:90d9dbc67b54ce07ec6106',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-EKDXMLJ357',
};

// Initialize Firebase only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only when supported (avoids crashes in unsupported/embedded contexts)
export const analytics = isSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch(() => null);

export default app;
