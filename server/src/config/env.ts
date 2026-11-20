import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  superAdminUid: process.env.KUJUK_SUPER_ADMIN_UID ?? "",
  hostedPreview: process.env.NODE_ENV === "preview",
  port: Number(process.env.PORT ?? 4000),
  /** PostgreSQL connection string. When set, the PostgreSQL adapter is used. */
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "kujuk-dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  /** Comma separated list of allowed CORS origins (optional). */
  corsOrigins: (process.env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  /**
   * Public base URL of this API (e.g. https://kujuk.onrender.com) used to build
   * absolute media URLs when the storefront is hosted separately (GitHub Pages).
   * Empty for same-origin deployments.
   */
  publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? "").replace(/\/+$/, ""),
  /** Per-fulfillment COD shipping fee in EGP; free above the basket threshold. */
  shippingFee: Number(process.env.SHIPPING_FEE ?? 5.99),
  shippingFeeSudan: Number(process.env.SHIPPING_FEE_SUDAN ?? 15),
  freeShippingOver: Number(process.env.FREE_SHIPPING_OVER ?? 150),
  commissionBps: Number(process.env.COMMISSION_BPS ?? 1000),

};

export const usingPostgres = Boolean(env.databaseUrl);

for (const fee of [env.shippingFee, env.shippingFeeSudan, env.freeShippingOver]) {
  if (!Number.isFinite(fee) || fee < 0 || fee > 1000000) throw new Error('Invalid shipping configuration');
}
if (!Number.isInteger(env.commissionBps) || env.commissionBps < 0 || env.commissionBps > 10000) throw new Error('Invalid commission configuration');
if (env.nodeEnv === 'production' && !process.env.FIREBASE_PROJECT_ID && (!process.env.JWT_SECRET || env.jwtSecret.length < 32)) throw new Error('Set JWT_SECRET to a random secret (at least 32 characters)');
