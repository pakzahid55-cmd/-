import { Router } from 'express';
import { z } from 'zod';
import { query, nextId, getCurrencySettings, resolvePrice, schedulePersist } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, parseBody } from '../utils/http.js';
import type { ProductRow } from './catalog.js';

export const ordersRouter = Router();

export const ORDER_STATUSES = ['new', 'confirming', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const;

const checkoutSchema = z.object({
  customer_name: z.string().min(2).max(120),
  phone: z.string().min(6).max(30),
  country: z.enum(['EG', 'SD']),
  city: z.string().min(1).max(80),
  address: z.string().min(3).max(300),
  notes: z.string().max(500).optional().or(z.literal('')),
  coupon_code: z.string().max(40).optional().or(z.literal('')),
  currency: z.enum(['EGP', 'SDG']),
  items: z.array(z.object({ product_id: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).min(1).max(50),
});

ordersRouter.post('/orders', requireAuth, asyncHandler(async (req, res) => {
  const body = parseBody(checkoutSchema, req, res); if (!body) return;
  const settings = await getCurrencySettings();
  const currency = body.currency;
  if (currency === 'EGP' && !settings.egpEnabled) return res.status(400).json({ error: 'CURRENCY_DISABLED', message: 'EGP payments are currently disabled' });
  if (currency === 'SDG' && !settings.sdgEnabled) return res.status(400).json({ error: 'CURRENCY_DISABLED', message: 'SDG payments are currently disabled' });

  // Load all products and validate stock BEFORE writing anything
  const loaded: Array<{ row: ProductRow; qty: number; unitFinal: number; unitBase: number; rate: number | null }> = [];
  for (const item of body.items) {
    const rows = (await query<ProductRow>('SELECT * FROM products WHERE id = $1', [item.product_id])).rows;
    const p = rows[0];
    if (!p) return res.status(400).json({ error: 'PRODUCT_NOT_FOUND', message: `Product #${item.product_id} not found` });
    if (p.stock < item.quantity) {
      return res.status(409).json({ error: 'OUT_OF_STOCK', message: `Insufficient stock for: ${p.name_en}`, product_id: p.id, available: p.stock });
    }
    const resolved = resolvePrice(p, currency, settings);
    const discount = Number(p.discount_percent) || 0;
    const unitFinal = Math.round(resolved.amount * (1 - discount / 100) * 100) / 100;
    loaded.push({ row: p, qty: item.quantity, unitFinal, unitBase: resolved.amount, rate: resolved.exchangeRate });
  }

  const subtotalBase = loaded.reduce((sum, l) => sum + l.unitBase * l.qty, 0);
  const itemsTotal = loaded.reduce((sum, l) => sum + l.unitFinal * l.qty, 0);
  const discountFromProducts = Math.round((subtotalBase - itemsTotal) * 100) / 100;

  // Coupon validation (discount applies on top of product discounts)
  let couponDiscount = 0;
  let coupon: any = null;
  if (body.coupon_code) {
    const code = body.coupon_code.trim().toUpperCase();
    const coupons = (await query('SELECT * FROM coupons WHERE code = $1', [code])).rows;
    coupon = coupons[0];
    if (!coupon || coupon.active !== 1) return res.status(400).json({ error: 'COUPON_INVALID', message: 'Coupon code is not valid' });
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return res.status(400).json({ error: 'COUPON_EXPIRED', message: 'Coupon has expired' });
    if (itemsTotal < Number(coupon.min_order)) return res.status(400).json({ error: 'COUPON_MIN_ORDER', message: `Coupon requires a minimum order of ${coupon.min_order}` });
    couponDiscount = coupon.type === 'percent'
      ? Math.round(itemsTotal * (Number(coupon.value) / 100) * 100) / 100
      : Math.min(Number(coupon.value), itemsTotal);
  }

  const shipping = body.country === 'SD' ? settings.shippingSD : settings.shippingEG;
  const total = Math.round((itemsTotal - couponDiscount + shipping) * 100) / 100;
  const minOrder = body.country === 'SD' ? settings.minOrderSD : settings.minOrderEG;
  if (itemsTotal < minOrder) {
    return res.status(400).json({ error: 'MIN_ORDER_NOT_MET', message: `Minimum order for this market is ${minOrder} ${currency}` });
  }

  const usedRate = loaded.find(l => l.rate !== null)?.rate ?? null;
  const orderId = await nextId('orders');
  const orderNumber = `KAJ-${Date.now().toString(36).toUpperCase()}-${String(Math.floor(Math.random() * 1296)).padStart(2, '0')}`;
  const createdAt = new Date().toISOString();

  await query(
    `INSERT INTO orders(id, order_number, user_id, customer_name, phone, country, city, address, notes, currency,
      subtotal, discount, shipping_fee, total, exchange_rate, payment_method, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'cod','new',$16)`,
    [orderId, orderNumber, req.user!.id, body.customer_name.trim(), body.phone.trim(), body.country, body.city.trim(),
     body.address.trim(), body.notes || '', currency, Math.round(subtotalBase * 100) / 100,
     Math.round((discountFromProducts + couponDiscount) * 100) / 100, shipping, total, usedRate, createdAt]
  );

  for (const l of loaded) {
    await query(
      'INSERT INTO order_items(id, order_id, product_id, name_ar, name_en, image, quantity, unit_price, currency) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [await nextId('order_items'), orderId, l.row.id, l.row.name_ar, l.row.name_en, l.row.image, l.qty, l.unitFinal, currency]
    );
    await query('UPDATE products SET stock = stock - $1::int, sold_count = sold_count + $1::int WHERE id = $2', [l.qty, l.row.id]);
  }
  if (coupon) await query('UPDATE coupons SET uses_left = uses_left - 1 WHERE id = $1 AND uses_left > 0', [coupon.id]);
  schedulePersist();

  res.status(201).json({
    order: {
      id: orderId, order_number: orderNumber, currency, subtotal: subtotalBase,
      discount: Math.round((discountFromProducts + couponDiscount) * 100) / 100,
      shipping_fee: shipping, total, exchange_rate: usedRate, status: 'new', created_at: createdAt,
    },
  });
}));

ordersRouter.get('/orders', requireAuth, asyncHandler(async (req, res) => {
  const rows = (await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC', [req.user!.id])).rows;
  res.json({ orders: rows });
}));

ordersRouter.get('/orders/:id', requireAuth, asyncHandler(async (req, res) => {
  const rows = (await query('SELECT * FROM orders WHERE id = $1', [Number(req.params.id)])).rows;
  const order = rows[0];
  if (!order) return res.status(404).json({ error: 'NOT_FOUND' });
  if (order.user_id !== req.user!.id && req.user!.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
  const items = (await query('SELECT * FROM order_items WHERE order_id = $1', [order.id])).rows;
  res.json({ order, items });
}));

const couponSchema = z.object({ code: z.string().min(2).max(40), subtotal: z.number().nonnegative().optional(), currency: z.enum(['EGP', 'SDG']).optional() });

ordersRouter.post('/coupons/validate', asyncHandler(async (req, res) => {
  const body = parseBody(couponSchema, req, res); if (!body) return;
  const code = body.code.trim().toUpperCase();
  const coupon = (await query('SELECT * FROM coupons WHERE code = $1', [code])).rows[0];
  if (!coupon || coupon.active !== 1) return res.status(404).json({ error: 'COUPON_INVALID', message: 'Coupon code is not valid' });
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return res.status(400).json({ error: 'COUPON_EXPIRED', message: 'Coupon has expired' });
  if (coupon.uses_left <= 0) return res.status(400).json({ error: 'COUPON_EXHAUSTED', message: 'Coupon usage limit reached' });
  const subtotal = Number(body.subtotal) || 0;
  if (subtotal < Number(coupon.min_order)) return res.status(400).json({ error: 'COUPON_MIN_ORDER', message: `Minimum order for this coupon is ${coupon.min_order}` });
  const discount = coupon.type === 'percent' ? Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100 : Math.min(Number(coupon.value), subtotal);
  res.json({ coupon: { code: coupon.code, type: coupon.type, value: Number(coupon.value), min_order: Number(coupon.min_order) }, discount });
}));

const wishlistSchema = z.object({ product_id: z.number().int().positive() });

ordersRouter.get('/wishlist', requireAuth, asyncHandler(async (req, res) => {
  const rows = (await query('SELECT product_id FROM wishlist WHERE user_id = $1', [req.user!.id])).rows;
  res.json({ product_ids: rows.map((r: any) => r.product_id) });
}));

ordersRouter.post('/wishlist/toggle', requireAuth, asyncHandler(async (req, res) => {
  const body = parseBody(wishlistSchema, req, res); if (!body) return;
  const existing = (await query('SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2', [req.user!.id, body.product_id])).rows;
  if (existing.length) {
    await query('DELETE FROM wishlist WHERE id = $1', [existing[0].id]);
    schedulePersist();
    return res.json({ in_wishlist: false });
  }
  await query('INSERT INTO wishlist(id, user_id, product_id) VALUES ($1,$2,$3)', [await nextId('wishlist'), req.user!.id, body.product_id]);
  schedulePersist();
  res.json({ in_wishlist: true });
}));

const reviewSchema = z.object({ product_id: z.number().int().positive(), rating: z.number().int().min(1).max(5), comment: z.string().max(1000).optional() });

ordersRouter.post('/reviews', requireAuth, asyncHandler(async (req, res) => {
  const body = parseBody(reviewSchema, req, res); if (!body) return;
  const p = (await query('SELECT id, name_en FROM products WHERE id = $1', [body.product_id])).rows[0];
  if (!p) return res.status(404).json({ error: 'NOT_FOUND' });
  const name = req.user!.full_name;
  await query('INSERT INTO reviews(id, product_id, user_id, author_name, rating, comment, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [await nextId('reviews'), body.product_id, req.user!.id, name, body.rating, body.comment || '', new Date().toISOString()]);
  const cur = (await query('SELECT rating, review_count FROM products WHERE id = $1', [body.product_id])).rows[0];
  const oldCount = Number(cur?.review_count) || 0;
  const oldRating = Number(cur?.rating) || 0;
  const newCount = oldCount + 1;
  const newRating = Math.round(((oldRating * oldCount) + body.rating) / newCount * 100) / 100;
  await query('UPDATE products SET rating = $1, review_count = $2 WHERE id = $3', [newRating, newCount, body.product_id]);
  schedulePersist();
  res.status(201).json({ ok: true });
}));
