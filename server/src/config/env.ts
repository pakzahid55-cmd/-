import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  /** PostgreSQL connection string. When set, the PostgreSQL adapter is used. */
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "kajok-dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  /** Comma separated list of allowed CORS origins (optional). */
  corsOrigins: (process.env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  /**
   * Public base URL of this API (e.g. https://kajok.onrender.com) used to build
   * absolute media URLs when the storefront is hosted separately (GitHub Pages).
   * Empty for same-origin deployments.
   */
  publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? "").replace(/\/+$/, ""),
  /** Shipping flat fee (USD) applied at checkout. */
  shippingFee: Number(process.env.SHIPPING_FEE ?? 5.99),
  /** Free shipping threshold (USD). */
  freeShippingOver: Number(process.env.FREE_SHIPPING_OVER ?? 150),
  /** Online payments are prepared but intentionally disabled until a real
   *  payment provider is connected. Never simulate successful payments. */
  onlinePaymentsEnabled: process.env.ONLINE_PAYMENTS_ENABLED === "true",
};

export const usingPostgres = Boolean(env.databaseUrl);
