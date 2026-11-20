import type { CheckoutQuote } from "../../../shared/checkout.js";
import { createHash } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, validateBody } from '../lib/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import { env } from '../config/env.js';
import { money, splitOrder } from '../lib/order-fulfillment.js';
import type { Store } from '../db/store.js';
import type { Order, OrderItem } from '../db/types.js';

const router = Router();
const idempotencyKey = z.string().uuid();
const referenceFor = (userId: number, key: string) => `KUJUK-${createHash('sha256').update(`${userId}:${key.toLowerCase()}`).digest('hex').slice(0, 32)}`;
const country = z.string().trim().transform(value => {
  const aliases: Record<string, 'Egypt' | 'Sudan'> = { egypt: 'Egypt', eg: 'Egypt', مصر: 'Egypt', sudan: 'Sudan', sd: 'Sudan', السودان: 'Sudan' };
  return Object.hasOwn(aliases, value.toLowerCase()) ? aliases[value.toLowerCase()] : undefined;
}).pipe(z.enum(['Egypt', 'Sudan']));
const checkoutInput = z.object({
  items: z.array(z.object({ productId: z.number().int().positive().safe(), quantity: z.number().int().min(1).max(50) })).min(1).max(30)
    .refine(items => new Set(items.map(i => i.productId)).size === items.length, 'Consolidate duplicate products'),
  country,
  couponCode: z.string().trim().toUpperCase().max(20).nullable().optional(),
  currency: z.enum(['EGP', 'SDG']).default('EGP'),
});
const orderSchema = checkoutInput.omit({ country: true }).extend({
  paymentMethod: z.literal('cod'),
  expectedTotal: z.number().finite().nonnegative(),
  customer: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{6,19}$/),
    country,
    city: z.string().trim().min(2).max(60),
    area: z.string().trim().min(2).max(80).optional(),
    address: z.string().trim().min(5).max(200),
    instructions: z.string().trim().max(300).nullable().optional(),
  }),
});

async function calculate(store: Store, input: z.infer<typeof checkoutInput>) {
  const { items, currency, couponCode } = input;
  const exchangeRate = currency === 'EGP' ? 1 : (await store.listExchangeRates()).find(r => r.base === 'EGP' && r.quote === 'SDG')?.rate;
  if (!exchangeRate) throw new HttpError(400, 'SDG exchange rate is not configured. Please choose EGP.');
  const orderItems: OrderItem[] = [];
  let subtotalEgp = 0;
  let subtotal = 0;
  const sellers = new Map<number, boolean>();
  for (const { productId, quantity } of items) {
    const product = await store.getProductById(productId);
    if (!product || product.stock < quantity) throw new HttpError(409, `Product #${productId} is not available in that quantity`);
    const sellerId = product.sellerId ?? null;
    if (sellerId !== null) {
      if (!sellers.has(sellerId)) sellers.set(sellerId, (await store.getSellerProfileByUserId(sellerId))?.status === 'approved');
      if (!sellers.get(sellerId)) throw new HttpError(409, 'A seller is no longer available');
    }
    const priceEgp = money(product.discountPrice ?? product.price);
    const price = money(priceEgp * exchangeRate);
    subtotalEgp += priceEgp * quantity;
    subtotal += price * quantity;
    orderItems.push({ productId, quantity, price, priceEgp, sellerId, slug: product.slug, nameEn: product.nameEn,
      nameAr: product.nameAr, image: product.images[0] ?? '' });
  }
  subtotal = money(subtotal);
  subtotalEgp = money(subtotalEgp);
  if (!Number.isFinite(subtotal) || subtotal > 1e10) throw new HttpError(400, 'Order value exceeds the supported limit');
  let discountEgp = 0;
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await store.getCouponByCode(couponCode);
    if (!coupon?.active || (coupon.expiresAt && Date.parse(coupon.expiresAt) < Date.now()) || subtotalEgp < coupon.minOrder)
      throw new HttpError(400, 'This coupon does not apply to the order');
    discountEgp = Math.min(subtotalEgp, money(coupon.type === 'fixed' ? coupon.value : subtotalEgp * coupon.value / 100));
    appliedCoupon = coupon.code;
  }
  const discount = Math.min(subtotal, money(discountEgp * exchangeRate));
  const fee = input.country === 'Sudan' ? env.shippingFeeSudan : env.shippingFee;
  const shippingEach = subtotalEgp - discountEgp >= env.freeShippingOver ? 0 : money(fee * exchangeRate);
  const sellerOrders = splitOrder(orderItems, discount, shippingEach, (await store.getCommission())?.bps ?? env.commissionBps);
  const shipping = money(shippingEach * sellerOrders.length);
  return { items: orderItems, subtotal, discount, shipping, total: money(subtotal - discount + shipping),
    couponCode: appliedCoupon, currency, exchangeRate, sellerOrders };
}

function publicOrder(order: Order) {
  const { checkoutHash: _, sellerOrders, ...rest } = order;
  const shipments = sellerOrders?.map(({ reference, status, total }) => ({ reference, status, total })) ?? [];
  const amountDue = shipments.length ? money(shipments.filter(p => p.status !== 'cancelled').reduce((a, p) => a + p.total, 0)) : order.total;
  return { ...rest, shipments, amountDue };
}

router.post('/quote', requireAuth, validateBody(checkoutInput), asyncHandler(async (req, res) => {
  const { subtotal, discount, shipping, total, currency, exchangeRate, sellerOrders } = await calculate(req.app.locals.store, req.body);
  res.json({ subtotal, discount, shipping, total, currency, exchangeRate, shipments: sellerOrders.length } satisfies CheckoutQuote);
}));

router.post('/', requireAuth, validateBody(orderSchema), asyncHandler(async (req, res) => {
  const store: Store = req.app.locals.store;
  const input: z.infer<typeof orderSchema> = req.body;
  const userId = req.user!.id;
  const key = req.get('Idempotency-Key');
  if (!key || !idempotencyKey.safeParse(key).success) throw new HttpError(400, 'A UUID Idempotency-Key header is required');
  input.items.sort((a, b) => a.productId - b.productId);
  const hash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  // Deterministic per buyer/key, with 128 bits of entropy derived from the client UUID.
  const reference = referenceFor(userId, key);
  const { order, replayed } = await store.checkout(userId, input.items.map(i => i.productId), async () => {
    const prior = await store.getOrderByReference(reference);
    if (prior) {
      if (prior.userId !== userId || prior.checkoutHash !== hash) throw new HttpError(409, 'This checkout key is already in use');
      return { order: prior, replayed: true };
    }
    const prices = await calculate(store, { ...input, country: input.customer.country });
    if (money(input.expectedTotal) !== prices.total) throw new HttpError(409, 'Order total changed. Please review the updated quote.');
    const order = await store.createOrder({ ...prices, reference, userId, checkoutHash: hash, status: 'pending', paymentMethod: 'cod',
      paymentStatus: 'pending', customer: { ...input.customer, instructions: input.customer.instructions ?? null } });
    return { order, replayed: false };
  });
  res.status(replayed ? 200 : 201).json({ order: publicOrder(order) });
}));

router.get('/recovery/:key', requireAuth, asyncHandler(async (req, res) => {
  const key = idempotencyKey.safeParse(req.params.key);
  if (!key.success) throw new HttpError(400, 'Invalid checkout key');
  const order: Order | null = await req.app.locals.store.getOrderByReference(referenceFor(req.user!.id, key.data));
  res.json({ order: order?.userId === req.user!.id ? publicOrder(order) : null });
}));

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const store: Store = req.app.locals.store;
  res.json({ items: (await store.listOrdersForUser(req.user!.id)).map(publicOrder) });
}));

router.get('/track/:reference', asyncHandler(async (req, res) => {
  const reference = req.params.reference.toLowerCase();
  if (!/^kujuk-[a-f0-9]{32}$/.test(reference)) throw new HttpError(404, 'Order not found');
  const order: Order | null = await req.app.locals.store.getOrderByReference(reference);
  if (!order) throw new HttpError(404, 'Order not found');
  const { createdAt, updatedAt, status, shipments } = publicOrder(order);
  res.json({ order: { reference: order.reference, createdAt, updatedAt, status, shipments: shipments.map(({ reference, status }) => ({ reference, status })) } });
}));

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const order: Order | null = await req.app.locals.store.getOrderById(Number(req.params.id));
  if (!order || (order.userId !== req.user!.id && req.user!.role !== 'admin')) throw new HttpError(404, 'Order not found');
  res.json({ order: publicOrder(order) });
}));

export default router;
