import { Router } from "express";
import { z } from "zod";
import { asyncHandler, validateBody } from "../lib/validate.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import type { ExchangeRate } from "../db/types.js";

const router = Router();

/**
 * Currency & exchange-rate API.
 * The rate is entered MANUALLY by an admin. If no rate has been entered the
 * API returns rate: null — the platform must never fabricate a rate.
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const history = await store.listExchangeRates();
    const current = history.find((r: ExchangeRate) => r.base === "EGP" && r.quote === "SDG") ?? null;
    res.json({
      base: "EGP",
      quote: "SDG",
      rate: current ? current.rate : null,
      updatedAt: current ? current.createdAt : null,
      source: current ? "manual" : null,
    });
  }),
);

/** Full rate history (admin only) — auditable. */
router.get(
  "/history",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    res.json({ items: await store.listExchangeRates() });
  }),
);

const rateSchema = z.object({
  rate: z.number().min(0.0001).max(1_000_000).transform(rate => Math.round(rate * 10000) / 10000),
  note: z.string().max(200).nullable().optional(),
});

/** Set a new rate manually (admin only). A new record is appended — history preserved. */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateBody(rateSchema),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const row = await store.addExchangeRate({
      base: "EGP",
      quote: "SDG",
      rate: req.body.rate,
      note: req.body.note ?? null,
      createdBy: req.user!.email ?? String(req.user!.id),
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ rate: row });
  }),
);

export default router;
