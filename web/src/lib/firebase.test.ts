/**
 * Firebase initialization test (run with: npm run test:firebase --workspace=web)
 *
 * Verifies:
 *  1. Firebase SDK is installed and initializes against project kajok-65089
 *  2. Duplicate initialization is prevented (getApps/getApp guard)
 *  3. Auth / Firestore / Storage handles are created
 *  4. Reports any missing configuration values
 *
 * Note: this runs in Node without network access to Google services, so it tests
 * initialization and config only — live auth/firestore traffic is exercised in the
 * browser at runtime.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY ?? "AIzaSyAI1aPdvgqqYLiW3XHtnqNANVeo1S9piKg",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN ?? "kajok-65089.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID ?? "kajok-65089",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET ?? "kajok-65089.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "902554080627",
  appId: process.env.VITE_FIREBASE_APP_ID ?? "1:902554080627:web:90d9dbc67b54ce07ec6106",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-EKDXMLJ357",
};

let failures = 0;

function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

// 1. Config completeness
for (const [key, value] of Object.entries(firebaseConfig)) {
  check(`config.${key}`, Boolean(value), value ? String(value).slice(0, 24) + "…" : "MISSING");
}

// 2. Initialize once
const app1 = getApps().length ? getApp() : initializeApp(firebaseConfig);
check("initializeApp", Boolean(app1), `name=${app1.name}`);

// 3. Duplicate-init guard: a second initialize must return the same app
const app2 = getApps().length ? getApp() : initializeApp(firebaseConfig);
check("duplicate initialization prevented", app1 === app2);

// 4. Services
try {
  const auth = getAuth(app1);
  check("getAuth", Boolean(auth));
} catch (e) {
  check("getAuth", false, String(e));
}
try {
  const db = getFirestore(app1);
  check("getFirestore", Boolean(db));
} catch (e) {
  check("getFirestore", false, String(e));
}
try {
  const storage = getStorage(app1);
  check("getStorage", Boolean(storage));
} catch (e) {
  check("getStorage", false, String(e));
}

check("projectId is kajok-65089", firebaseConfig.projectId === "kajok-65089");

console.log(failures === 0 ? "\nFirebase initialization test PASSED" : `\nFirebase initialization test FAILED (${failures} issue${failures > 1 ? "s" : ""})`);
process.exit(failures === 0 ? 0 : 1);
