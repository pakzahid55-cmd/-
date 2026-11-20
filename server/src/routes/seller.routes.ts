import { catalogPrice, mediaRef, slug } from "../lib/catalog-validation.js";
import { Router } from "express";
import { saveMedia } from "../lib/media-storage.js";
import multer from "multer";
import { z } from "zod";
import { asyncHandler, validateBody } from "../lib/validate.js";
import { requireAuth, requireSeller, toPublicUser } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { money, sellerView } from "../lib/order-fulfillment.js";
import type { Store } from "../db/store.js";
import type { SellerProfile } from "../db/types.js";

const router = Router();

const docUpload = multer({ limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 } });

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
    if (req.user!.role === "admin") throw new HttpError(403, "Use a separate account for selling");
    if (existing && ["approved", "suspended"].includes(existing.status)) {
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

const branding = z.object({ logo: mediaRef.nullable(), cover: mediaRef.nullable(), descriptionEn: z.string().trim().max(1500), descriptionAr: z.string().trim().max(1500) });
router.put('/shop', requireSeller, validateBody(branding), asyncHandler(async (req, res) => {
  const profile = await assertApprovedSeller(req);
  res.json({ profile: await req.app.locals.store.updateSellerProfile(profile.id, req.body) });
}));

// Passport document upload (the seller's own record only).
router.post(
  "/document",
  requireAuth,
  docUpload.single("file"),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const profile = await store.getSellerProfileByUserId(req.user!.id);
    if (!profile) throw new HttpError(404, "Submit your seller application first");
    if (profile.status === "approved" || profile.status === "suspended") throw new HttpError(409, "Contact the administrator to change the verification document");
    if (!req.file) throw new HttpError(400, "No document uploaded");
    const file = await saveMedia("passports", req.file.buffer);
    const updated = await store.updateSellerProfile(profile.id, { passportDocument: file.name });
    res.status(201).json({ profile: updated });
  }),
);

// ---------- Seller Center (approved sellers; admins may inspect) ----------
router.get(
  "/products",
  requireSeller,
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    await assertApprovedSeller(req);
    const products = await store.listProductsBySeller(req.user!.id);
    res.json({ items: products });
  }),
);

const productInput = z.object({
  slug,
  nameEn: z.string().min(2).max(160),
  nameAr: z.string().min(2).max(160),
  descriptionEn: z.string().max(5000).default(""),
  descriptionAr: z.string().max(5000).default(""),
  price: catalogPrice,
  discountPrice: catalogPrice.nullable().default(null),
  brandId: z.number().int().nonnegative().default(0),
  categoryId: z.number().int().nonnegative().default(0),
  stock: z.number().int().min(0).max(1_000_000).default(0),
  images: z.array(mediaRef).max(12).default([]),
  video: mediaRef.nullish(),
  specs: z.record(z.string().max(60), z.string().max(250)).refine(row => Object.keys(row).length <= 30).default({}),

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
    await assertApprovedSeller(req);
    const product = await store.createProduct({ ...req.body, isFeatured: false, sellerId: req.user!.id });
    res.status(201).json({ product });
  }),
);

router.put(
  "/products/:id",
  requireSeller,
  validateBody(productInput.partial()),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    await assertApprovedSeller(req);
    const existing = await store.getProductById(Number(req.params.id));
    if (!existing || existing.sellerId !== req.user!.id) throw new HttpError(404, "Product not found");
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
    await assertApprovedSeller(req);
    const existing = await store.getProductById(Number(req.params.id));
    if (!existing || existing.sellerId !== req.user!.id) throw new HttpError(404, "Product not found");
    await store.deleteProduct(existing.id);
    res.json({ ok: true });
  }),
);

// ---------- Seller orders & financials (strict tenant isolation) ----------
router.get('/orders', requireSeller, asyncHandler(async (req, res) => {
  await assertApprovedSeller(req);
  const store: Store = req.app.locals.store;
  const items = await store.listOrdersForSeller(req.user!.id);
  res.json({ items });
}));

router.put('/orders/:id/status', requireSeller, validateBody(z.object({ status: z.enum(['processing', 'shipped', 'delivered']) })), asyncHandler(async (req, res) => {
  await assertApprovedSeller(req);
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(404, 'Order not found');
  const store: Store = req.app.locals.store;
  const order = await store.updateOrderStatus(id, req.body.status, req.user!.id);
  if (!order) throw new HttpError(404, 'Order not found');
  res.json({ order: sellerView(order, req.user!.id) });
}));

router.get('/stats', requireSeller, asyncHandler(async (req, res) => {
  await assertApprovedSeller(req);
  const store: Store = req.app.locals.store;
  const [items, products] = await Promise.all([store.listOrdersForSeller(req.user!.id), store.listProductsBySeller(req.user!.id)]);
  const delivered = items.filter(order => order.status === 'delivered');
  res.json({ totalRevenue: money(delivered.reduce((n, o) => n + (o.subtotal - o.discount) / o.exchangeRate, 0)),
    totalCommission: money(delivered.reduce((n, o) => n + o.commission / o.exchangeRate, 0)),
    totalEarnings: money(delivered.reduce((n, o) => n + o.earnings / o.exchangeRate, 0)),
    totalOrders: items.length, pendingOrders: items.filter(o => o.status === 'pending').length, totalProducts: products.length });
}));

export default router;
