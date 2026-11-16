import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
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
import sellerRoutes from "./routes/seller.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

export function createApp(store: Store): express.Express {
  const app = express();
  app.locals.store = store;

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.corsOrigins.length ? env.corsOrigins : true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "kajok-api", store: store.kind, time: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api", catalogRoutes);
  app.use("/api/coupons", couponRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/currency", currencyRoutes);
  app.use("/api/seller", sellerRoutes);

  // Uploaded media (product images, promo videos) served statically.
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads"), { maxAge: "7d", fallthrough: true }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
