// Firebase integration for KAJOK (project: kajok-65089)
//
// Responsibilities are clearly separated to avoid conflicting sources of truth:
//  - PostgreSQL (via the KAJOK API)  → products, orders, users, checkout, admin (canonical)
//  - Firebase Auth / Firestore / Storage → ready for supplementary features
//    (e.g. social login, realtime chat, media hosting) without replacing existing systems.
//
// Configuration uses VITE_FIREBASE_* environment variables where practical and
// falls back to the project's public web configuration. Firebase web API keys are
// public identifiers (restricted by Firebase Security Rules), not private credentials.
// NEVER place Firebase Admin SDK / service-account keys in this frontend file.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Firebase configuration (env-first, with project defaults for kajok-65089)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyAI1aPdvgqqYLiW3XHtnqNANVeo1S9piKg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "kajok-65089.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "kajok-65089",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "kajok-65089.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "902554080627",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:902554080627:web:90d9dbc67b54ce07ec6106",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-EKDXMLJ357",
};

// Initialize Firebase only once (prevents duplicate initialization on hot reload)
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Initialize Analytics only when supported (e.g. skipped in unsupported browsers / SSR)
export const analytics = isSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch(() => null);

/** Report which Firebase config values are present (for diagnostics). */
export function firebaseStatus() {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    initialized: getApps().length > 0,
    services: { auth: true, firestore: true, storage: true, analytics: "lazy" },
  };
}

export default app;
