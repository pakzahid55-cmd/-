import { Router } from "express";
import { z } from "zod";
import { asyncHandler, validateBody } from "../lib/validate.js";
import { requireAdmin, requireAuth, toPublicUser } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import type { OrderStatus } from "../db/types.js";

const router = Router();
router.use(requireAuth, requireAdmin);

// ---------- Dashboard ----------
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    res.json(await req.app.locals.store.adminStats());
  }),
);

// ---------- Products ----------
const productSchema = z.object({
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
  images: z.array(z.string().max(500)).max(12).default([]),
  specs: z.record(z.string(), z.string()).default({}),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
});

router.get(
  "/products",
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    res.json(await req.app.locals.store.listProducts({ page, limit, q }));
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
  image: z.string().max(500).default(""),
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

router.put("/orders/:id/status", validateBody(z.object({ status: z.enum(statuses as [OrderStatus, ...OrderStatus[]]) })), asyncHandler(async (req, res) => {
  const order = await req.app.locals.store.updateOrderStatus(Number(req.params.id), req.body.status);
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
  image: z.string().max(500).default(""),
  link: z.string().max(200).default("/"),
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

export default router;
