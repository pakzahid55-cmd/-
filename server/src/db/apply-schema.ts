/**
 * Apply the idempotent PostgreSQL schema (CREATE TABLE IF NOT EXISTS only).
 * Requires DATABASE_URL. Never drops or modifies existing tables/records.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { env, usingPostgres } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  if (!usingPostgres) {
    console.error("DATABASE_URL is not set. Export it first, e.g.\n  DATABASE_URL=postgres://user:pass@host:5432/kujuk npm run db:schema");
    process.exit(1);
  }
  const sql = fs.readFileSync(path.resolve(__dirname, "schema.sql"), "utf-8");
  const client = new pg.Client({ connectionString: env.databaseUrl });
  await client.connect();
  try {
    await client.query(sql);
    console.log("KUJUK PostgreSQL schema applied (all statements are CREATE IF NOT EXISTS — nothing was dropped).");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
