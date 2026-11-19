import { Router } from "express";
import { z } from "zod";
import { asyncHandler, validateBody } from "../lib/validate.js";
import { HttpError } from "../middleware/error.js";

const router = Router();

const validateSchema = z.object({
  code: z.string().min(3).max(20),
  subtotal: z.number().min(0),
});

router.post(
  "/validate",
  validateBody(validateSchema),
  asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;
    const coupon = await req.app.locals.store.getCouponByCode(code);
    if (!coupon || !coupon.active) throw new HttpError(400, "Invalid coupon code");
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      throw new HttpError(400, "This coupon has expired");
    }
    if (subtotal < coupon.minOrder) {
      throw new HttpError(400, `This coupon requires a minimum order of $${coupon.minOrder.toFixed(2)}`);
    }
    const discount = coupon.type === "percent" ? Math.round(subtotal * coupon.value) / 100 : coupon.value;
    res.json({ coupon: { code: coupon.code, type: coupon.type, value: coupon.value }, discount: Math.min(discount, subtotal) });
  }),
);

export default router;
