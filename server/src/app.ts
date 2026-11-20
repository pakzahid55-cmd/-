import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from 'express-rate-limit';
import { streamMedia } from './lib/media-storage.js';
import { asyncHandler } from './lib/validate.js';
import { env } from "./config/env.js";
import type { Store } from "./db/store.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/products.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import couponRoutes from "./routes/coupons.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadsRouter from "./routes/uploads.routes.js";
import currencyRoutes from "./routes/currency.routes.js";
import notifications from "./routes/notifications.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

export function createApp(store: Store): express.Express {
  const app = express();
  app.locals.store = store;
  app.disable('x-powered-by');
  const trustedProxies = Number(process.env.KUJUK_TRUST_PROXY_HOPS || 0);
  if (trustedProxies > 0 && Number.isSafeInteger(trustedProxies)) app.set('trust proxy', trustedProxies);
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'private, no-store');
    next();
  });

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.corsOrigins.length ? env.corsOrigins : false,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "kujuk-api", store: store.kind, hostedPreview: env.hostedPreview, time: new Date().toISOString() });
  });

  if (env.hostedPreview) {
    app.use(['/api/seller', '/api/admin', '/api/uploads'], (_req, res) => {
      res.status(403).json({ error: 'Seller and admin tools are disabled in the public preview.' });
    });
  }

  const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: process.env.NODE_ENV === 'production' ? 30 : 200, standardHeaders: true, legacyHeaders: false,
    validate: { xForwardedForHeader: false }, message: { error: 'Too many authentication requests. Try again later.' } });
  for (const route of ['/login', '/register', '/firebase']) app.post(`/api/auth${route}`, authLimit);
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api", catalogRoutes);
  app.use("/api/coupons", couponRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/currency", currencyRoutes);
  app.use("/api/seller", sellerRoutes);
  app.use("/api/notifications", notifications);

  app.get('/uploads/:name', asyncHandler(async (req, res) => { await streamMedia('catalog', req.params.name, res); }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
