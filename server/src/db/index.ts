/**
 * KAJOK unified database layer.
 *
 * - Production: set DATABASE_URL (postgresql://user:pass@host:port/db) to use a real
 *   PostgreSQL server via the `pg` driver. PostgreSQL is the system of record.
 * - This sandbox / zero-config mode: an embedded PostgreSQL-compatible engine
 *   (pg-mem) is used with automatic JSON snapshot persistence to data/kajok-snapshot.json.
 *
 * Both modes expose the same `query(text, params)` contract with $1..$n placeholders.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.KAJOK_DATA_DIR || path.resolve(__dirname, '../../../data');
const SNAPSHOT_PATH = path.join(DATA_DIR, 'kajok-snapshot.json');

export interface DbResult<T = any> { rows: T[]; rowCount: number }

let pool: { query: (text: string, params?: any[]) => Promise<DbResult> } | null = null;
let persistTimer: NodeJS.Timeout | null = null;
export let isUsingRealPostgres = false;

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  language TEXT DEFAULT 'ar',
  country TEXT DEFAULT 'EG',
  currency TEXT DEFAULT 'EGP',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS addresses (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  label TEXT,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  street TEXT NOT NULL,
  phone TEXT,
  is_default INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Tag',
  sort_order INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6C3BCE'
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ar TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  category_id INTEGER,
  brand_id INTEGER,
  price_egp NUMERIC(12,2) NOT NULL,
  price_sdg NUMERIC(14,2),
  price_mode TEXT NOT NULL DEFAULT 'independent',
  discount_percent NUMERIC(5,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  image TEXT,
  specs_json TEXT DEFAULT '{}',
  featured INTEGER DEFAULT 0,
  bestseller INTEGER DEFAULT 0,
  new_arrival INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'percent',
  value NUMERIC(12,2) NOT NULL,
  min_order NUMERIC(12,2) DEFAULT 0,
  expires_at TEXT,
  active INTEGER DEFAULT 1,
  uses_left INTEGER DEFAULT 1000
);
CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  subtitle_ar TEXT DEFAULT '',
  subtitle_en TEXT DEFAULT '',
  image TEXT,
  link TEXT DEFAULT '/',
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id INTEGER,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT DEFAULT '',
  currency TEXT NOT NULL,
  subtotal NUMERIC(14,2) NOT NULL,
  discount NUMERIC(14,2) DEFAULT 0,
  shipping_fee NUMERIC(14,2) DEFAULT 0,
  total NUMERIC(14,2) NOT NULL,
  exchange_rate NUMERIC(14,6),
  payment_method TEXT NOT NULL DEFAULT 'cod',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  image TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  user_id INTEGER,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  UNIQUE(user_id, product_id)
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0
);
`;

const DUMP_ORDER = ['users', 'categories', 'brands', 'banners', 'products', 'coupons', 'addresses', 'wishlist', 'orders', 'order_items', 'reviews', 'settings', 'password_resets'];

export async function initDb(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pgMod: any = await import('pg');
    const PoolCtor = pgMod.Pool || pgMod.default?.Pool;
    pool = new PoolCtor({
      connectionString: url,
      ssl: /sslmode=require|supabase|render|neon/i.test(url) ? { rejectUnauthorized: false } : undefined,
    });
    isUsingRealPostgres = true;
    for (const stmt of DDL.split(';').map(s => s.trim()).filter(Boolean)) {
      await pool!.query(stmt + ';');
    }
    return;
  }
  // Embedded PostgreSQL-compatible mode with snapshot persistence
  const { newDb } = await import('pg-mem');
  const mem = newDb();
  const { Pool: MemPool } = mem.adapters.createPg();
  pool = new MemPool();
  for (const stmt of DDL.split(';').map(s => s.trim()).filter(Boolean)) {
    await pool!.query(stmt + ';');
  }
  await restoreSnapshot();
}

function readSnapshot(): Record<string, any[]> | null {
  try {
    if (!fs.existsSync(SNAPSHOT_PATH)) return null;
    const parsed = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
    return parsed.tables ?? null;
  } catch (err) {
    console.warn('[db] could not read snapshot, starting fresh:', (err as Error).message);
    return null;
  }
}

async function restoreSnapshot(): Promise<void> {
  const tables = readSnapshot();
  if (!tables) return;
  for (const table of DUMP_ORDER) {
    const rows = tables[table];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const cols = Object.keys(rows[0]);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(',');
    for (const row of rows) {
      const values = cols.map(c => row[c]);
      try {
        await pool!.query(`INSERT INTO ${table}(${cols.join(',')}) VALUES (${placeholders})`, values);
      } catch (err) {
        console.warn(`[db] snapshot restore skipped a row in ${table}:`, (err as Error).message);
      }
    }
  }
  console.log('[db] embedded database restored from snapshot');
}

export async function persistNow(): Promise<void> {
  if (isUsingRealPostgres) return; // real PG persists itself
  const tables: Record<string, any[]> = {};
  for (const table of DUMP_ORDER) {
    try {
      const res = await pool!.query(`SELECT * FROM ${table}`);
      tables[table] = res.rows;
    } catch {
      tables[table] = [];
    }
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify({ version: 1, savedAt: new Date().toISOString(), tables }));
}

/** Debounced persistence — call after any mutating statement. */
export function schedulePersist(): void {
  if (isUsingRealPostgres) return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => { persistNow().catch(e => console.warn('[db] persist failed:', e.message)); }, 250);
}

export async function query<T = any>(text: string, params: any[] = []): Promise<DbResult<T>> {
  if (!pool) throw new Error('Database not initialized');
  const res = await pool.query(text, params);
  return { rows: res.rows as T[], rowCount: res.rowCount ?? res.rows.length };
}

export async function nextId(table: string): Promise<number> {
  const res = await query<{ next: string | number }>(`SELECT COALESCE(MAX(id), 0) + 1 AS next FROM ${table}`);
  return Number(res.rows[0].next);
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const res = await query<{ value: string }>('SELECT value FROM settings WHERE key = $1', [key]);
  return res.rows[0]?.value ?? fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await query('INSERT INTO settings(key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, value]);
  schedulePersist();
}

export interface CurrencySettings {
  egpEnabled: boolean;
  sdgEnabled: boolean;
  defaultCountry: 'EG' | 'SD';
  defaultCurrency: 'EGP' | 'SDG';
  exchangeRate: number;          // 1 EGP = exchangeRate SDG
  marginPercent: number;         // optional conversion margin applied on top of the rate
  shippingEG: number;            // EGP
  shippingSD: number;            // SDG
  minOrderEG: number;            // EGP
  minOrderSD: number;            // SDG
  rateUpdatedAt: string;
  rateSource: string;
}

export async function getCurrencySettings(): Promise<CurrencySettings> {
  const get = async (k: string, fb: string) => getSetting(k, fb);
  return {
    egpEnabled: (await get('egp_enabled', 'true')) === 'true',
    sdgEnabled: (await get('sdg_enabled', 'true')) === 'true',
    defaultCountry: ((await get('default_country', 'EG')) as 'EG' | 'SD'),
    defaultCurrency: ((await get('default_currency', 'EGP')) as 'EGP' | 'SDG'),
    exchangeRate: Number(await get('exchange_rate_egp_sdg', '68')),
    marginPercent: Number(await get('conversion_margin_percent', '2')),
    shippingEG: Number(await get('shipping_fee_eg', '50')),
    shippingSD: Number(await get('shipping_fee_sd', '5000')),
    minOrderEG: Number(await get('min_order_eg', '100')),
    minOrderSD: Number(await get('min_order_sd', '10000')),
    rateUpdatedAt: await get('exchange_rate_updated_at', ''),
    rateSource: await get('exchange_rate_source', 'manual'),
  };
}

export interface PriceInfo { amount: number; currency: 'EGP' | 'SDG'; exchangeRate: number | null }

/**
 * Resolve the sell price of a product for a target currency.
 * Independent SDG price wins when price_mode = 'independent'; otherwise the
 * configured exchange rate (plus optional margin) is applied.
 */
export function resolvePrice(
  p: { price_egp: number | string; price_sdg: number | string | null; price_mode: string },
  currency: 'EGP' | 'SDG',
  settings: CurrencySettings
): PriceInfo {
  const base = Number(p.price_egp);
  if (currency === 'EGP') return { amount: base, currency, exchangeRate: null };
  const independent = p.price_sdg !== null && p.price_sdg !== undefined ? Number(p.price_sdg) : null;
  if (p.price_mode === 'independent' && independent && independent > 0) {
    return { amount: independent, currency, exchangeRate: null };
  }
  const rate = settings.exchangeRate * (1 + settings.marginPercent / 100);
  const converted = Math.round((base * rate) / 5) * 5; // round to nearest 5 SDG for market-friendly pricing
  return { amount: converted, currency, exchangeRate: rate };
}
