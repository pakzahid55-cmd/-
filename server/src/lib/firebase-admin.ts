import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export function adminApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID is required');
  return getApps()[0] ?? initializeApp({ projectId, credential: applicationDefault(), storageBucket: process.env.FIREBASE_STORAGE_BUCKET });
}
export const firebaseAdminAuth = () => getAuth(adminApp());
export const firebaseDb = () => getFirestore(adminApp());
export const firebaseBucket = () => getStorage(adminApp()).bucket();
