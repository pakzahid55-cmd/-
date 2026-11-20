import { HttpError } from "../middleware/error.js";
import type { Store } from "../db/store.js";
import { Router } from "express";
import { asyncHandler } from "../lib/validate.js";

const router = Router();

router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    res.json({ items: await req.app.locals.store.listCategories() });
  }),
);

router.get(
  "/brands",
  asyncHandler(async (req, res) => {
    res.json({ items: await req.app.locals.store.listBrands() });
  }),
);

router.get(
  "/banners",
  asyncHandler(async (req, res) => {
    res.json({ items: await req.app.locals.store.listBanners(true) });
  }),
);

router.get('/shops/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) throw new HttpError(404, 'Shop not found');
  const store: Store = req.app.locals.store;
  const profile = await store.getSellerProfileByUserId(id);
  if (!profile || profile.status !== 'approved') throw new HttpError(404, 'Shop not found');
  const { shopNameEn, shopNameAr, descriptionEn, descriptionAr, logo, cover } = profile;
  const page = Math.min(100000, Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1));
  const result = await store.listProducts({ sellerId: id, page, limit: 12 });
  res.json({ shop: { id, shopNameEn, shopNameAr, descriptionEn, descriptionAr, logo, cover }, ...result });
}));

export default router;
