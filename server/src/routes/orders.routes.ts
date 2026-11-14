import { Router } from "express";
import { z } from "zod";
import { asyncHandler, validateBody } from "../lib/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { env } from "../config/env.js";
import type { OrderItem } from "../db/types.js";

const router = Router();

const orderSchema = z.object({
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(50) })).min(1),
  customer: z.object({
    name: z.string().min(2).max(80),
    phone: z.string().min(6).max(20),
    country: z.string().min(2).max(60),
    city: z.string().min(2).max(60),
    address: z.string().min(5).max(200),
    instructions: z.string().max(300).nullable().optional(),
  }),
  paymentMethod: z.enum(["cod", "online"]),
  couponCode: z.string().max(20).nullable().optional(),
});

function makeReference(): string {
  return `KJ-${Math.floor(100000 + Math.random() * 900000)}`;
}

router.post(
  "/",
  requireAuth,
  validateBody(orderSchema),
  asyncHandler(async (req, res) => {
    const store = req.app.locals.store;
    const { items, customer, paymentMethod, couponCode } = req.body;

    // Online payments are prepared for future activation only.
    // Never simulate a successful payment without a real payment provider.
    if (paymentMethod === "online" && !env.onlinePaymentsEnabled) {
      throw new HttpError(400, "Online payment is not yet activated. Please choose Cash on Delivery.");
    }

    const orderItems: OrderItem[] = [];
    let subtotal = 0;
    for (const item of items) {
      const product = await store.getProductById(item.productId);
      if (!product) throw new HttpError(400, `Product #${item.productId} not found`);
      if (product.stock < item.quantity) {
        throw new HttpError(400, `Only ${product.stock} left in stock for "${product.nameEn}"`);
      }
      const price = product.discountPrice ?? product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        productId: product.id,
        slug: product.slug,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        image: product.images[0] ?? "",
        price,
        quantity: item.quantity,
      });
    }

    let discount = 0;
    let appliedCoupon: string | null = null;
    if (couponCode) {
      const coupon = await store.getCouponByCode(couponCode);
      const valid =
        coupon &&
        coupon.active &&
        (!coupon.expiresAt || new Date(coupon.expiresAt).getTime() >= Date.now()) &&
        subtotal >= coupon.minOrder;
      if (!valid) throw new HttpError(400, "The coupon code is invalid or does not apply to this order");
      discount = coupon!.type === "percent" ? Math.round(subtotal * coupon!.value) / 100 : coupon!.value;
      discount = Math.min(discount, subtotal);
      appliedCoupon = coupon!.code;
    }

    const shipping = subtotal - discount >= env.freeShippingOver ? 0 : env.shippingFee;
    const total = Math.round((subtotal - discount + shipping) * 100) / 100;

    const order = await store.createOrder({
      reference: makeReference(),
      userId: req.user!.id,
      items: orderItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      shipping,
      total,
      couponCode: appliedCoupon,
      paymentMethod,
      paymentStatus: "pending",
      status: "pending",
      customer: { ...customer, instructions: customer.instructions ?? null },
    });
    res.status(201).json({ order });
  }),
);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ items: await req.app.locals.store.listOrdersForUser(req.user!.id) });
  }),
);

/** Public order tracking by reference (limited fields only). */
router.get(
  "/track/:reference",
  asyncHandler(async (req, res) => {
    const order = await req.app.locals.store.getOrderByReference(req.params.reference);
    if (!order) throw new HttpError(404, "No order found with this reference");
    res.json({
      order: {
        reference: order.reference,
        status: order.status,
        items: order.items.map((i: import("../db/types.js").OrderItem) => ({ nameEn: i.nameEn, nameAr: i.nameAr, image: i.image, quantity: i.quantity })),
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        city: order.customer.city,
        country: order.customer.country,
      },
    });
  }),
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await req.app.locals.store.getOrderById(Number(req.params.id));
    if (!order) throw new HttpError(404, "Order not found");
    if (order.userId !== req.user!.id && req.user!.role !== "admin") {
      throw new HttpError(403, "You do not have access to this order");
    }
    res.json({ order });
  }),
);

export default router;
