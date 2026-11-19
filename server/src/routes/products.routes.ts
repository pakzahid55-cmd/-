import { Router } from "express";
import { z } from "zod";
import { asyncHandler, validateBody } from "../lib/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import type { ProductQuery } from "../db/types.js";

const router = Router();

function parseQuery(raw: Record<string, unknown>): ProductQuery {
  const q: ProductQuery = {};
  if (typeof raw.q === "string" && raw.q.trim()) q.q = raw.q.trim();
  if (typeof raw.category === "string" && raw.category) q.category = raw.category;
  if (typeof raw.brand === "string" && raw.brand) q.brand = raw.brand;
  if (raw.minPrice !== undefined && raw.minPrice !== "") q.minPrice = Number(raw.minPrice);
  if (raw.maxPrice !== undefined && raw.maxPrice !== "") q.maxPrice = Number(raw.maxPrice);
  if (typeof raw.sort === "string") q.sort = raw.sort as ProductQuery["sort"];
  if (raw.page !== undefined && raw.page !== "") q.page = Number(raw.page);
  if (raw.limit !== undefined && raw.limit !== "") q.limit = Number(raw.limit);
  if (raw.featured === "true" || raw.featured === true) q.featured = true;
  if (raw.new === "true" || raw.new === true) q.isNew = true;
  if (typeof raw.ids === "string" && raw.ids) q.ids = raw.ids.split(",").map(Number).filter((n) => Number.isFinite(n));
  return q;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await req.app.locals.store.listProducts(parseQuery(req.query as Record<string, unknown>));
    res.json(result);
  }),
);

router.get(
  "/suggest",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "").trim();
    if (q.length < 2) {
      res.json({ products: [], categories: [], brands: [] });
      return;
    }
    const store = req.app.locals.store as import("../db/store.js").Store;
    const [products, categories, brands] = await Promise.all([
      store.listProducts({ q, limit: 6, sort: "popularity" }),
      store.listCategories(),
      store.listBrands(),
    ]);
    const lower = q.toLowerCase();
    res.json({
      products: products.items.map((p: import("../db/types.js").Product) => ({ id: p.id, slug: p.slug, nameEn: p.nameEn, nameAr: p.nameAr, image: p.images[0] ?? "", price: p.price, discountPrice: p.discountPrice })),
      categories: categories.filter((c: import("../db/types.js").Category) => c.nameEn.toLowerCase().includes(lower) || c.nameAr.includes(q)).slice(0, 3),
      brands: brands.filter((b: import("../db/types.js").Brand) => b.name.toLowerCase().includes(lower)).slice(0, 3),
    });
  }),
);

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});

router.post(
  "/:id/reviews",
  requireAuth,
  validateBody(reviewSchema),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const productId = Number(req.params.id);
    const product = await store.getProductById(productId);
    if (!product) throw new HttpError(404, "Product not found");
    const review = await store.createReview({
      productId,
      userId: req.user!.id,
      userName: req.user!.name,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    res.status(201).json({ review });
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const product = await store.getProductBySlug(req.params.slug);
    if (!product) throw new HttpError(404, "Product not found");
    const [reviews, related] = await Promise.all([store.listReviews(product.id), store.relatedProducts(product)]);
    res.json({ product, reviews, related });
  }),
);

export default router;
