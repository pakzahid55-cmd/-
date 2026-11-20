import { initializeApp, getApps, getApp } from '@firebase/app';
import { getAuth } from '@firebase/auth';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};
export const googleEnabled = process.env.NEXT_PUBLIC_FIREBASE_ENABLE_GOOGLE === "true";
export const phoneEnabled = process.env.NEXT_PUBLIC_FIREBASE_ENABLE_PHONE === "true";
export const firebaseEnabled = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
export function firebaseApp() {
  if (!firebaseEnabled) throw new Error('Firebase Authentication has not been configured.');
  return getApps().length ? getApp() : initializeApp(config);
}
export function firebaseAuth() { return getAuth(firebaseApp()); }
