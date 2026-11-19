import { hashPassword } from "../lib/password.js";
import { env, usingPostgres } from "../config/env.js";
import type { Store } from "./store.js";
import { MemoryStore } from "./memory-store.js";
import { PgStore } from "./pg-store.js";

/**
 * Store factory.
 * - DATABASE_URL set  → PostgreSQL (canonical production store, schema.sql)
 * - otherwise         → embedded store (server/data/db.json) for development
 *
 * The REST layer is identical for both adapters.
 */
export async function createStore(): Promise<Store> {
  if (usingPostgres) {
    const store = new PgStore(env.databaseUrl);
    console.log("[kajok-server] Using PostgreSQL store");
    return store;
  }
  console.log("[kajok-server] DATABASE_URL not set — using embedded development store (server/data/db.json)");
  console.log("[kajok-server] Set DATABASE_URL to switch to PostgreSQL without code changes.");
  const store = new MemoryStore(hashPassword);
  await store.init();
  return store;
}
