import { firebaseDb } from '../lib/firebase-admin.js';
import { FirestoreStore } from './firestore-store.js';
import { hashPassword } from "../lib/password.js";
import { env, usingPostgres } from "../config/env.js";
import type { Store } from "./store.js";
import { MemoryStore } from "./memory-store.js";
import { PgStore } from "./pg-store.js";

/** Firestore for new production deployments; PostgreSQL for existing data; JSON for local testing only. */
export async function createStore(): Promise<Store> {
  if (env.hostedPreview) {
    const file = process.env.KUJUK_PREVIEW_DATA_FILE;
    if (!file || env.jwtSecret.length < 32 || process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_STORAGE_BUCKET || usingPostgres) {
      throw new Error('Use npm run start:hosted-preview with no Firebase or PostgreSQL configuration');
    }
    const store = new MemoryStore(hashPassword, file, false);
    await store.init();
    return store;
  }
  if (env.nodeEnv === "production" && (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.STORAGE_EMULATOR_HOST)) throw new Error('Production cannot use Firebase emulators');
  if (env.nodeEnv === "production" && (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_STORAGE_BUCKET || !env.superAdminUid)) throw new Error("Production requires FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET and KUJUK_SUPER_ADMIN_UID");
  if (process.env.KUJUK_STORE === 'firestore') return new FirestoreStore(firebaseDb());
  if (usingPostgres) {
    const store = new PgStore(env.databaseUrl);
    console.log("[kujuk-server] Using PostgreSQL store");
    return store;
  }
  if (env.nodeEnv === "production") throw new Error("Production requires KUJUK_STORE=firestore or DATABASE_URL");
  console.log("[kujuk-server] DATABASE_URL not set — using embedded development store (server/data/db.json)");
  console.log("[kujuk-server] Set DATABASE_URL to switch to PostgreSQL without code changes.");
  const store = new MemoryStore(hashPassword);
  await store.init();
  return store;
}
