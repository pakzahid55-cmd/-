import { catalogPrice, mediaRef, slug } from "../lib/catalog-validation.js";
import { env } from "../config/env.js";
import { money } from "../lib/order-fulfillment.js";
import type { Store } from "../db/store.js";
import { Router } from "express";
import { streamMedia } from "../lib/media-storage.js";
import { z } from "zod";
import { asyncHandler, validateBody } from "../lib/validate.js";
import { requireAdmin, requireAuth, toPublicUser } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import type { OrderStatus, SellerProfile, User } from "../db/types.js";

const router = Router();
router.use(requireAuth, requireAdmin);

// ---------- Dashboard ----------
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const store: Store = req.app.locals.store;
    const stats = await store.adminStats();
    if (stats.totalSellers === undefined) {
      const [sellers, orders] = await Promise.all([store.listSellerProfiles(), store.listOrders()]);
      stats.totalSellers = sellers.filter(s => s.status === 'approved').length;
      stats.pendingSellers = sellers.filter(s => ['pending', 'under_review'].includes(s.status)).length;
      stats.totalCommission = money(orders.reduce((sum, order) => sum + (order.sellerOrders ?? []).filter(p => p.status === 'delivered').reduce((a, p) => a + p.commission, 0) / order.exchangeRate, 0));
    }
    res.json(stats);
  }),
);

router.get('/commission', asyncHandler(async (req, res) => {
  res.json(await req.app.locals.store.getCommission() ?? { bps: env.commissionBps, updatedAt: null });
}));
router.put('/commission', validateBody(z.object({ bps: z.number().int().min(0).max(10000) })), asyncHandler(async (req, res) => {
  const setting = { bps: req.body.bps, updatedAt: new Date().toISOString(), updatedBy: req.user!.id };
  await req.app.locals.store.setCommission(setting);
  res.json(setting);
}));

// ---------- Products ----------
const productSchema = z.object({
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
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  sku: z.string().max(60).nullable().default(null),
  sellerId: z.number().int().positive().nullable().default(null),
});

router.get(
  "/products",
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    res.json(await req.app.locals.store.listProducts({ page, limit, q, admin: true }));
  }),
);

router.post(
  "/products",
  validateBody(productSchema),
  asyncHandler(async (req, res) => {
    const product = await req.app.locals.store.createProduct(req.body);
    res.status(201).json({ product });
  }),
);

router.put(
  "/products/:id",
  validateBody(productSchema.partial()),
  asyncHandler(async (req, res) => {
    const product = await req.app.locals.store.updateProduct(Number(req.params.id), req.body);
    if (!product) throw new HttpError(404, "Product not found");
    res.json({ product });
  }),
);

router.delete(
  "/products/:id",
  asyncHandler(async (req, res) => {
    const ok = await req.app.locals.store.deleteProduct(Number(req.params.id));
    if (!ok) throw new HttpError(404, "Product not found");
    res.json({ ok: true });
  }),
);

// ---------- Categories ----------
const categorySchema = z.object({
  slug: z.string().min(2).max(80),
  nameEn: z.string().min(2).max(80),
  nameAr: z.string().min(2).max(80),
  image: mediaRef.default(""),
  sort: z.number().int().default(0),
});

router.get("/categories", asyncHandler(async (req, res) => res.json({ items: await req.app.locals.store.listCategories() })));
router.post("/categories", validateBody(categorySchema), asyncHandler(async (req, res) => res.status(201).json({ category: await req.app.locals.store.createCategory(req.body) })));
router.put("/categories/:id", validateBody(categorySchema.partial()), asyncHandler(async (req, res) => {
  const category = await req.app.locals.store.updateCategory(Number(req.params.id), req.body);
  if (!category) throw new HttpError(404, "Category not found");
  res.json({ category });
}));
router.delete("/categories/:id", asyncHandler(async (req, res) => {
  const ok = await req.app.locals.store.deleteCategory(Number(req.params.id));
  if (!ok) throw new HttpError(404, "Category not found");
  res.json({ ok: true });
}));

// ---------- Brands ----------
const brandSchema = z.object({ slug: z.string().min(2).max(80), name: z.string().min(2).max(80) });
router.get("/brands", asyncHandler(async (req, res) => res.json({ items: await req.app.locals.store.listBrands() })));
router.post("/brands", validateBody(brandSchema), asyncHandler(async (req, res) => res.status(201).json({ brand: await req.app.locals.store.createBrand(req.body) })));
router.put("/brands/:id", validateBody(brandSchema.partial()), asyncHandler(async (req, res) => {
  const brand = await req.app.locals.store.updateBrand(Number(req.params.id), req.body);
  if (!brand) throw new HttpError(404, "Brand not found");
  res.json({ brand });
}));
router.delete("/brands/:id", asyncHandler(async (req, res) => {
  const ok = await req.app.locals.store.deleteBrand(Number(req.params.id));
  if (!ok) throw new HttpError(404, "Brand not found");
  res.json({ ok: true });
}));

// ---------- Orders ----------
const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

router.get("/orders", asyncHandler(async (req, res) => {
  const status = typeof req.query.status === "string" && statuses.includes(req.query.status as OrderStatus) ? (req.query.status as OrderStatus) : undefined;
  res.json({ items: await req.app.locals.store.listOrders(status) });
}));

router.put("/orders/:id/status", validateBody(z.object({ status: z.enum(statuses as [OrderStatus, ...OrderStatus[]]), sellerId: z.number().int().positive().safe().nullable().optional() })), asyncHandler(async (req, res) => {
  const order = await req.app.locals.store.updateOrderStatus(Number(req.params.id), req.body.status, req.body.sellerId);
  if (!order) throw new HttpError(404, "Order not found");
  res.json({ order });
}));

// ---------- Customers ----------
router.get("/customers", asyncHandler(async (req, res) => {
  const users = await req.app.locals.store.listUsers() as import("../db/types.js").User[];
  const orders = await req.app.locals.store.listOrders() as import("../db/types.js").Order[];
  res.json({
    items: users.map((u) => ({
      ...toPublicUser(u),
      orderCount: orders.filter((o) => o.userId === u.id).length,
    })),
  });
}));

// ---------- Coupons ----------
const couponSchema = z.object({
  code: z.string().min(3).max(20),
  type: z.enum(["percent", "fixed"]),
  value: z.number().min(0),
  minOrder: z.number().min(0).default(0),
  active: z.boolean().default(true),
  expiresAt: z.string().nullable().default(null),
});

router.get("/coupons", asyncHandler(async (req, res) => res.json({ items: await req.app.locals.store.listCoupons() })));
router.post("/coupons", validateBody(couponSchema), asyncHandler(async (req, res) => res.status(201).json({ coupon: await req.app.locals.store.createCoupon(req.body) })));
router.put("/coupons/:id", validateBody(couponSchema.partial()), asyncHandler(async (req, res) => {
  const coupon = await req.app.locals.store.updateCoupon(Number(req.params.id), req.body);
  if (!coupon) throw new HttpError(404, "Coupon not found");
  res.json({ coupon });
}));
router.delete("/coupons/:id", asyncHandler(async (req, res) => {
  const ok = await req.app.locals.store.deleteCoupon(Number(req.params.id));
  if (!ok) throw new HttpError(404, "Coupon not found");
  res.json({ ok: true });
}));

// ---------- Banners ----------
const bannerSchema = z.object({
  titleEn: z.string().min(2).max(120),
  titleAr: z.string().min(2).max(120),
  subtitleEn: z.string().max(240).default(""),
  subtitleAr: z.string().max(240).default(""),
  image: mediaRef.default(""),
  video: mediaRef.nullish(),
  link: z.string().max(200).regex(/^\/(?![\\/])[^\s\\]*$/).default("/"),
  active: z.boolean().default(true),
  sort: z.number().int().default(0),
});

router.get("/banners", asyncHandler(async (req, res) => res.json({ items: await req.app.locals.store.listBanners(false) })));
router.post("/banners", validateBody(bannerSchema), asyncHandler(async (req, res) => res.status(201).json({ banner: await req.app.locals.store.createBanner(req.body) })));
router.put("/banners/:id", validateBody(bannerSchema.partial()), asyncHandler(async (req, res) => {
  const banner = await req.app.locals.store.updateBanner(Number(req.params.id), req.body);
  if (!banner) throw new HttpError(404, "Banner not found");
  res.json({ banner });
}));
router.delete("/banners/:id", asyncHandler(async (req, res) => {
  const ok = await req.app.locals.store.deleteBanner(Number(req.params.id));
  if (!ok) throw new HttpError(404, "Banner not found");
  res.json({ ok: true });
}));

// ---------- Sellers (manual passport review — never automated) ----------
function maskPassport(p: string): string {
  return p.length <= 4 ? "****" : `****${p.slice(-4)}`;
}

router.get(
  "/sellers",
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const profiles = await store.listSellerProfiles();
    const users = (await store.listUsers()) as User[];
    const byId = new Map<number, User>();
    for (const u of users) byId.set(u.id, u);
    res.json({
      items: profiles.map((p: SellerProfile) => ({
        id: p.id,
        userId: p.userId,
        userName: byId.get(p.userId)?.name ?? "—",
        userEmail: byId.get(p.userId)?.email ?? "—",
        shopNameEn: p.shopNameEn,
        shopNameAr: p.shopNameAr,
        legalName: p.legalName,
        passportNumberMasked: maskPassport(p.passportNumber),
        passportCountry: p.passportCountry,
        passportExpiry: p.passportExpiry,
        status: p.status,
        reviewNote: p.reviewNote,
        hasDocument: Boolean(p.passportDocument),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  }),
);

router.get(
  "/sellers/:id",
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const profile = await store.getSellerProfileById(Number(req.params.id));
    if (!profile) throw new HttpError(404, "Seller application not found");
    const user = await store.findUserById(profile.userId);
    res.json({ profile, user: user ? toPublicUser(user) : null });
  }),
);

router.get(
  "/sellers/:id/document",
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const profile = await store.getSellerProfileById(Number(req.params.id));
    if (!profile || !profile.passportDocument) throw new HttpError(404, "No passport document on file");
    await streamMedia("passports", profile.passportDocument, res);
  }),
);

const statusSchema = z.object({
  status: z.enum(["pending", "under_review", "approved", "rejected", "suspended"]),
  reviewNote: z.string().max(500).nullable().optional(),
});

router.put(
  "/sellers/:id/status",
  validateBody(statusSchema),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const profile = await store.getSellerProfileById(Number(req.params.id));
    if (!profile) throw new HttpError(404, "Seller application not found");
    if (req.body.status === "approved" && !profile.passportDocument) throw new HttpError(409, "Review the submitted verification document before approving");
    const updated = await store.updateSellerProfile(profile.id, {
      status: req.body.status,
      reviewNote: req.body.reviewNote ?? profile.reviewNote,
      reviewedBy: req.user!.email ?? String(req.user!.id),
    });
    // Promotion to the seller role happens only on approval.
    if (req.body.status === "approved" && store.kind !== "firestore") {
      await store.updateUser(profile.userId, { role: "seller" });
    }
    res.json({ profile: updated });
  }),
);

export default router;
