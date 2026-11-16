import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { z } from "zod";
import { asyncHandler, validateBody } from "../lib/validate.js";
import { requireAuth, requireSeller, toPublicUser } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import type { Order, OrderItem, OrderStatus, Product, SellerProfile } from "../db/types.js";

const router = Router();

/** Passport documents live OUTSIDE the public /uploads static dir — admin/seller access only. */
const DOC_DIR = path.resolve(process.cwd(), "data", "passports");
const docUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(DOC_DIR, { recursive: true });
      cb(null, DOC_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");
      cb(null, `passport-${req.user!.id}-${Date.now()}${ext || ".bin"}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error("Only JPG, PNG, WEBP or PDF passport documents are allowed"));
  },
});

const applySchema = z.object({
  shopNameEn: z.string().min(2).max(120),
  shopNameAr: z.string().min(2).max(120),
  legalName: z.string().min(2).max(160),
  passportNumber: z.string().min(4).max(40),
  passportCountry: z.string().min(2).max(80),
  passportExpiry: z.string().min(4).max(20),
  businessInfo: z.string().max(1000).nullable().optional(),
});

function maskPassport(p: string): string {
  return p.length <= 4 ? "****" : `****${p.slice(-4)}`;
}

// ---------- Seller onboarding (passport verification) ----------
router.post(
  "/apply",
  requireAuth,
  validateBody(applySchema),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const existing = await store.getSellerProfileByUserId(req.user!.id);
    if (existing && existing.status === "approved") {
      throw new HttpError(409, "This account is already an approved seller");
    }
    const data = {
      userId: req.user!.id,
      shopNameEn: req.body.shopNameEn,
      shopNameAr: req.body.shopNameAr,
      legalName: req.body.legalName,
      passportNumber: req.body.passportNumber,
      passportCountry: req.body.passportCountry,
      passportExpiry: req.body.passportExpiry,
      businessInfo: req.body.businessInfo ?? null,
    };
    // Re-applying after rejection/changes returns the record to manual review.
    const profile = existing
      ? await store.updateSellerProfile(existing.id, { ...data, status: "pending", reviewNote: null, reviewedBy: null })
      : await store.createSellerProfile({
          ...data,
          passportDocument: null,
          status: "pending",
          reviewNote: null,
          reviewedBy: null,
        });
    res.status(existing ? 200 : 201).json({ profile });
  }),
);

router.get(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const profile = await store.getSellerProfileByUserId(req.user!.id);
    res.json({ profile, user: toPublicUser(req.user!) });
  }),
);

// Passport document upload (the seller's own record only).
router.post(
  "/document",
  requireAuth,
  docUpload.single("file"),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const profile = await store.getSellerProfileByUserId(req.user!.id);
    if (!profile) throw new HttpError(404, "Submit your seller application first");
    if (!req.file) throw new HttpError(400, "No document uploaded");
    const updated = await store.updateSellerProfile(profile.id, { passportDocument: req.file.filename });
    res.status(201).json({ profile: updated });
  }),
);

// ---------- Seller Center (approved sellers; admins may inspect) ----------
router.get(
  "/products",
  requireSeller,
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const products = req.user!.role === "admin" ? (await store.listProducts({ page: 1, limit: 200 })).items : await store.listProductsBySeller(req.user!.id);
    res.json({ items: products });
  }),
);

const productInput = z.object({
  slug: z.string().min(2).max(120),
  nameEn: z.string().min(2).max(160),
  nameAr: z.string().min(2).max(160),
  descriptionEn: z.string().max(5000).default(""),
  descriptionAr: z.string().max(5000).default(""),
  price: z.number().min(0),
  discountPrice: z.number().min(0).nullable().default(null),
  brandId: z.number().int().nonnegative().default(0),
  categoryId: z.number().int().nonnegative().default(0),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().max(2_000_000)).max(12).default([]),
  video: z.string().max(2_000_000).nullish(),
  specs: z.record(z.string(), z.string()).default({}),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  sku: z.string().max(60).nullable().default(null),
});

async function assertApprovedSeller(req: any): Promise<SellerProfile> {
  const store = req.app.locals.store;
  const profile = await store.getSellerProfileByUserId(req.user!.id);
  if (!profile || profile.status !== "approved") {
    throw new HttpError(403, "Your seller account must be approved before you can list products");
  }
  return profile;
}

router.post(
  "/products",
  requireSeller,
  validateBody(productInput),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    if (req.user!.role !== "admin") await assertApprovedSeller(req);
    const product = await store.createProduct({ ...req.body, sellerId: req.user!.role === "admin" ? null : req.user!.id });
    res.status(201).json({ product });
  }),
);

router.put(
  "/products/:id",
  requireSeller,
  validateBody(productInput.partial()),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const existing = await store.getProductById(Number(req.params.id));
    if (!existing) throw new HttpError(404, "Product not found");
    if (req.user!.role !== "admin" && existing.sellerId !== req.user!.id) {
      throw new HttpError(403, "This product belongs to another seller");
    }
    const { sellerId: _ignored, ...safe } = req.body as Record<string, unknown>;
    const product = await store.updateProduct(existing.id, safe);
    res.json({ product });
  }),
);

router.delete(
  "/products/:id",
  requireSeller,
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const existing = await store.getProductById(Number(req.params.id));
    if (!existing) throw new HttpError(404, "Product not found");
    if (req.user!.role !== "admin" && existing.sellerId !== req.user!.id) {
      throw new HttpError(403, "This product belongs to another seller");
    }
    await store.deleteProduct(existing.id);
    res.json({ ok: true });
  }),
);

// ---------- Seller orders & financials (strict tenant isolation) ----------
router.get(
  "/orders",
  requireSeller,
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const own = await store.listProductsBySeller(req.user!.id);
    const ownIds = new Set(own.map((p: Product) => p.id));
    const all = await store.listOrders();
    const items = all
      .map((o: Order) => ({ ...o, items: o.items.filter((i: OrderItem) => ownIds.has(i.productId)) }))
      .filter((o: Order) => o.items.length > 0);
    res.json({ items });
  }),
);

router.get(
  "/stats",
  requireSeller,
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const own = await store.listProductsBySeller(req.user!.id);
    const ownIds = new Set(own.map((p: Product) => p.id));
    const all = await store.listOrders();
    let revenue = 0;
    let orders = 0;
    let pending = 0;
    for (const o of all as Order[]) {
      const mine = o.items.filter((i: OrderItem) => ownIds.has(i.productId));
      if (mine.length === 0) continue;
      orders += 1;
      if (o.status === "pending") pending += 1;
      if (o.status !== "cancelled") {
        revenue += mine.reduce((s: number, i: OrderItem) => s + i.price * i.quantity, 0) / (Number(o.exchangeRate) || 1);
      }
    }
    res.json({ totalRevenue: Math.round(revenue * 100) / 100, totalOrders: orders, pendingOrders: pending, totalProducts: own.length });
  }),
);

export default router;
