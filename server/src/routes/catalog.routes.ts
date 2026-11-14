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

export default router;
