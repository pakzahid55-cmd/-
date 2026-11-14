import { Router } from 'express';
import { z } from 'zod';
import { query, nextId, schedulePersist, getCurrencySettings, setSetting } from '../db/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, parseBody, escapeLike } from '../utils/http.js';
import { ORDER_STATUSES } from './orders.js';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

/* ---------- Dashboard stats ---------- */
adminRouter.get('/stats', asyncHandler(async (_req, res) => {
  const orders = (await query('SELECT id, order_number, total, currency, status, created_at, country FROM orders')).rows;
  const customers = (await query("SELECT COUNT(*) AS c FROM users WHERE role = 'customer'")).rows[0];
  const products = (await query('SELECT COUNT(*) AS c, SUM(CASE WHEN stock <= 5 THEN 1 ELSE 0 END) AS low_stock FROM products')).rows[0];
  const completed = orders.filter(o => o.status !== 'cancelled');
  const byCurrency: Record<string, number> = {};
  for (const o of completed) byCurrency[o.currency] = (byCurrency[o.currency] || 0) + Number(o.total);
  // Sales per day, last 14 days
  const days: Array<{ day: string; total: number; orders: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const dayOrders = completed.filter(o => String(o.created_at).slice(0, 10) === key);
    days.push({ day: key, total: Math.round(dayOrders.reduce((s, o) => s + Number(o.total), 0) * 100) / 100, orders: dayOrders.length });
  }
  const topProducts = (await query('SELECT id, name_ar, name_en, image, sold_count, stock FROM products ORDER BY sold_count DESC LIMIT 5')).rows;
  const recentOrders = [...orders].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 6);
  res.json({
    stats: {
      total_revenue: byCurrency,
      total_orders: orders.length,
      revenue_orders: completed.length,
      customers: Number(customers.c),
      products: Number(products.c),
      low_stock: Number(products.low_stock || 0),
      pending_orders: orders.filter(o => ['new', 'confirming', 'confirmed', 'preparing'].includes(o.status)).length,
    },
    daily: days,
    top_products: topProducts,
    recent_orders: recentOrders,
  });
}));

/* ---------- Orders ---------- */
adminRouter.get('/orders', asyncHandler(async (req, res) => {
  const status = String(req.query.status || '');
  const search = String(req.query.search || '').trim();
  const where: string[] = [];
  const params: any[] = [];
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (search) { params.push(`%${escapeLike(search.toLowerCase())}%`); where.push(`(LOWER(order_number) LIKE $${params.length} ESCAPE '\\' OR LOWER(customer_name) LIKE $${params.length} ESCAPE '\\' OR LOWER(phone) LIKE $${params.length} ESCAPE '\\')`); }
  const rows = (await query(`SELECT * FROM orders ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT 500`, params)).rows;
  res.json({ orders: rows });
}));

adminRouter.get('/orders/:id', asyncHandler(async (req, res) => {
  const order = (await query('SELECT * FROM orders WHERE id = $1', [Number(req.params.id)])).rows[0];
  if (!order) return res.status(404).json({ error: 'NOT_FOUND' });
  const items = (await query('SELECT * FROM order_items WHERE order_id = $1', [order.id])).rows;
  res.json({ order, items });
}));

const statusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

adminRouter.put('/orders/:id/status', asyncHandler(async (req, res) => {
  const body = parseBody(statusSchema, req, res); if (!body) return;
  const order = (await query('SELECT * FROM orders WHERE id = $1', [Number(req.params.id)])).rows[0];
  if (!order) return res.status(404).json({ error: 'NOT_FOUND' });
  // Restock when cancelling a non-cancelled order
  if (body.status === 'cancelled' && order.status !== 'cancelled') {
    const items = (await query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [order.id])).rows;
    for (const item of items) {
      if (item.product_id) await query('UPDATE products SET stock = stock + $1::int, sold_count = GREATEST(sold_count - $1::int, 0) WHERE id = $2', [item.quantity, item.product_id]);
    }
  }
  await query('UPDATE orders SET status = $1 WHERE id = $2', [body.status, order.id]);
  schedulePersist();
  res.json({ ok: true });
}));

/* ---------- Products CRUD ---------- */
const productSchema = z.object({
  sku: z.string().min(2).max(60),
  name_ar: z.string().min(2).max(200),
  name_en: z.string().min(2).max(200),
  description_ar: z.string().max(2000).optional().or(z.literal('')),
  description_en: z.string().max(2000).optional().or(z.literal('')),
  category_id: z.number().int().positive().nullable().optional(),
  brand_id: z.number().int().positive().nullable().optional(),
  price_egp: z.number().positive(),
  price_sdg: z.number().positive().nullable().optional(),
  price_mode: z.enum(['independent', 'converted']).default('independent'),
  discount_percent: z.number().min(0).max(90).default(0),
  stock: z.number().int().min(0).default(0),
  image: z.string().max(500).optional().or(z.literal('')),
  specs_json: z.string().max(4000).optional(),
  featured: z.boolean().optional(),
  bestseller: z.boolean().optional(),
  new_arrival: z.boolean().optional(),
});

adminRouter.post('/products', asyncHandler(async (req, res) => {
  const body = parseBody(productSchema, req, res); if (!body) return;
  const id = await nextId('products');
  const skuExists = (await query('SELECT id FROM products WHERE sku = $1', [body.sku])).rows[0];
  if (skuExists) return res.status(409).json({ error: 'SKU_TAKEN', message: 'SKU already exists' });
  await query(
    `INSERT INTO products(id, sku, name_ar, name_en, description_ar, description_en, category_id, brand_id,
      price_egp, price_sdg, price_mode, discount_percent, stock, image, specs_json, featured, bestseller, new_arrival,
      sold_count, rating, review_count, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,0,0,0,$19)`,
    [id, body.sku, body.name_ar, body.name_en, body.description_ar || '', body.description_en || '',
     body.category_id ?? null, body.brand_id ?? null, body.price_egp, body.price_sdg ?? null,
     body.price_mode, body.discount_percent, body.stock, body.image || '', body.specs_json || '{}',
     body.featured ? 1 : 0, body.bestseller ? 1 : 0, body.new_arrival ? 1 : 0, new Date().toISOString()]
  );
  schedulePersist();
  res.status(201).json({ id });
}));

adminRouter.put('/products/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const body = parseBody(productSchema.partial(), req, res); if (!body) return;
  const existing = (await query('SELECT * FROM products WHERE id = $1', [id])).rows[0];
  if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
  const m = { ...existing, ...body };
  await query(
    `UPDATE products SET sku=$1, name_ar=$2, name_en=$3, description_ar=$4, description_en=$5, category_id=$6, brand_id=$7,
      price_egp=$8, price_sdg=$9, price_mode=$10, discount_percent=$11, stock=$12, image=$13, specs_json=$14,
      featured=$15, bestseller=$16, new_arrival=$17
     WHERE id=$18`,
    [m.sku, m.name_ar, m.name_en, m.description_ar, m.description_en, m.category_id ?? null, m.brand_id ?? null,
     m.price_egp, m.price_sdg ?? null, m.price_mode, m.discount_percent, m.stock, m.image, typeof m.specs_json === 'string' ? m.specs_json : JSON.stringify(m.specs_json ?? '{}'),
     m.featured ? 1 : 0, m.bestseller ? 1 : 0, m.new_arrival ? 1 : 0, id]
  );
  schedulePersist();
  res.json({ ok: true });
}));

adminRouter.delete('/products/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const referenced = (await query('SELECT COUNT(*) AS c FROM order_items WHERE product_id = $1', [id])).rows[0];
  if (Number(referenced.c) > 0) {
    // Preserve order history integrity: soft-delete by emptying stock and unfeaturing instead of deleting
    await query('UPDATE products SET stock = 0, featured = 0, bestseller = 0, new_arrival = 0 WHERE id = $1', [id]);
    schedulePersist();
    return res.json({ ok: true, soft_deleted: true, message: 'Product is referenced by orders; it was deactivated (stock zeroed) instead of deleted.' });
  }
  await query('DELETE FROM products WHERE id = $1', [id]);
  schedulePersist();
  res.json({ ok: true });
}));

/* ---------- Categories & brands CRUD ---------- */
const categorySchema = z.object({
  name_ar: z.string().min(2).max(120), name_en: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, digits, dashes'),
  icon: z.string().min(1).max(60).default('Tag'), sort_order: z.number().int().default(0),
});
adminRouter.get('/categories', asyncHandler(async (_req, res) => {
  res.json({ categories: (await query('SELECT * FROM categories ORDER BY sort_order, id')).rows });
}));
adminRouter.post('/categories', asyncHandler(async (req, res) => {
  const body = parseBody(categorySchema, req, res); if (!body) return;
  const id = await nextId('categories');
  await query('INSERT INTO categories(id, name_ar, name_en, slug, icon, sort_order) VALUES ($1,$2,$3,$4,$5,$6)', [id, body.name_ar, body.name_en, body.slug, body.icon, body.sort_order]);
  schedulePersist(); res.status(201).json({ id });
}));
adminRouter.put('/categories/:id', asyncHandler(async (req, res) => {
  const body = parseBody(categorySchema.partial(), req, res); if (!body) return;
  const ex = (await query('SELECT * FROM categories WHERE id = $1', [Number(req.params.id)])).rows[0];
  if (!ex) return res.status(404).json({ error: 'NOT_FOUND' });
  const m = { ...ex, ...body };
  await query('UPDATE categories SET name_ar=$1, name_en=$2, slug=$3, icon=$4, sort_order=$5 WHERE id=$6', [m.name_ar, m.name_en, m.slug, m.icon, m.sort_order, ex.id]);
  schedulePersist(); res.json({ ok: true });
}));
adminRouter.delete('/categories/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const used = (await query('SELECT COUNT(*) AS c FROM products WHERE category_id = $1', [id])).rows[0];
  if (Number(used.c) > 0) return res.status(400).json({ error: 'CATEGORY_IN_USE', message: 'Cannot delete a category that has products' });
  await query('DELETE FROM categories WHERE id = $1', [id]);
  schedulePersist(); res.json({ ok: true });
}));

const brandSchema = z.object({ name: z.string().min(1).max(80), slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/), color: z.string().max(20).default('#6C3BCE') });
adminRouter.get('/brands', asyncHandler(async (_req, res) => {
  res.json({ brands: (await query('SELECT * FROM brands ORDER BY name')).rows });
}));
adminRouter.post('/brands', asyncHandler(async (req, res) => {
  const body = parseBody(brandSchema, req, res); if (!body) return;
  const id = await nextId('brands');
  await query('INSERT INTO brands(id, name, slug, color) VALUES ($1,$2,$3,$4)', [id, body.name, body.slug, body.color]);
  schedulePersist(); res.status(201).json({ id });
}));
adminRouter.delete('/brands/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const used = (await query('SELECT COUNT(*) AS c FROM products WHERE brand_id = $1', [id])).rows[0];
  if (Number(used.c) > 0) return res.status(400).json({ error: 'BRAND_IN_USE', message: 'Cannot delete a brand that has products' });
  await query('DELETE FROM brands WHERE id = $1', [id]);
  schedulePersist(); res.json({ ok: true });
}));

/* ---------- Coupons ---------- */
const couponSchema = z.object({
  code: z.string().min(2).max(40).transform(s => s.toUpperCase()),
  type: z.enum(['percent', 'fixed']), value: z.number().positive(),
  min_order: z.number().nonnegative().default(0), expires_at: z.string().max(30).nullable().optional(),
  uses_left: z.number().int().min(0).default(1000), active: z.boolean().default(true),
});
adminRouter.get('/coupons', asyncHandler(async (_req, res) => {
  res.json({ coupons: (await query('SELECT * FROM coupons ORDER BY id DESC')).rows });
}));
adminRouter.post('/coupons', asyncHandler(async (req, res) => {
  const body = parseBody(couponSchema, req, res); if (!body) return;
  const id = await nextId('coupons');
  await query('INSERT INTO coupons(id, code, type, value, min_order, expires_at, active, uses_left) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [id, body.code, body.type, body.value, body.min_order, body.expires_at || null, body.active ? 1 : 0, body.uses_left]);
  schedulePersist(); res.status(201).json({ id });
}));
adminRouter.put('/coupons/:id', asyncHandler(async (req, res) => {
  const body = parseBody(couponSchema.partial(), req, res); if (!body) return;
  const ex = (await query('SELECT * FROM coupons WHERE id = $1', [Number(req.params.id)])).rows[0];
  if (!ex) return res.status(404).json({ error: 'NOT_FOUND' });
  const m: any = { ...ex, ...body };
  await query('UPDATE coupons SET code=$1, type=$2, value=$3, min_order=$4, expires_at=$5, active=$6, uses_left=$7 WHERE id=$8',
    [m.code, m.type, m.value, m.min_order, m.expires_at || null, m.active ? 1 : 0, m.uses_left, ex.id]);
  schedulePersist(); res.json({ ok: true });
}));
adminRouter.delete('/coupons/:id', asyncHandler(async (req, res) => {
  await query('DELETE FROM coupons WHERE id = $1', [Number(req.params.id)]);
  schedulePersist(); res.json({ ok: true });
}));

/* ---------- Banners ---------- */
const bannerSchema = z.object({
  title_ar: z.string().min(2).max(120), title_en: z.string().min(2).max(120),
  subtitle_ar: z.string().max(200).default(''), subtitle_en: z.string().max(200).default(''),
  image: z.string().max(500).default(''), link: z.string().max(200).default('/'),
  sort_order: z.number().int().default(0), active: z.boolean().default(true),
});
adminRouter.get('/banners', asyncHandler(async (_req, res) => {
  res.json({ banners: (await query('SELECT * FROM banners ORDER BY sort_order, id')).rows });
}));
adminRouter.post('/banners', asyncHandler(async (req, res) => {
  const body = parseBody(bannerSchema, req, res); if (!body) return;
  const id = await nextId('banners');
  await query('INSERT INTO banners(id, title_ar, title_en, subtitle_ar, subtitle_en, image, link, sort_order, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
    [id, body.title_ar, body.title_en, body.subtitle_ar, body.subtitle_en, body.image, body.link, body.sort_order, body.active ? 1 : 0]);
  schedulePersist(); res.status(201).json({ id });
}));
adminRouter.put('/banners/:id', asyncHandler(async (req, res) => {
  const body = parseBody(bannerSchema.partial(), req, res); if (!body) return;
  const ex = (await query('SELECT * FROM banners WHERE id = $1', [Number(req.params.id)])).rows[0];
  if (!ex) return res.status(404).json({ error: 'NOT_FOUND' });
  const m: any = { ...ex, ...body };
  await query('UPDATE banners SET title_ar=$1, title_en=$2, subtitle_ar=$3, subtitle_en=$4, image=$5, link=$6, sort_order=$7, active=$8 WHERE id=$9',
    [m.title_ar, m.title_en, m.subtitle_ar, m.subtitle_en, m.image, m.link, m.sort_order, m.active ? 1 : 0, ex.id]);
  schedulePersist(); res.json({ ok: true });
}));
adminRouter.delete('/banners/:id', asyncHandler(async (req, res) => {
  await query('DELETE FROM banners WHERE id = $1', [Number(req.params.id)]);
  schedulePersist(); res.json({ ok: true });
}));

/* ---------- Customers ---------- */
adminRouter.get('/users', asyncHandler(async (_req, res) => {
  const rows = (await query(`SELECT u.id, u.email, u.full_name, u.phone, u.role, u.country, u.currency, u.created_at,
      (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS orders_count,
      (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id AND o.status <> 'cancelled' AND o.currency = 'EGP') AS spent_egp,
      (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id AND o.status <> 'cancelled' AND o.currency = 'SDG') AS spent_sdg
    FROM users u ORDER BY u.id DESC`)).rows;
  res.json({ users: rows });
}));

/* ---------- Currency / market settings ---------- */
adminRouter.get('/settings', asyncHandler(async (_req, res) => {
  res.json({ settings: await getCurrencySettings() });
}));

const settingsSchema = z.object({
  egp_enabled: z.boolean().optional(),
  sdg_enabled: z.boolean().optional(),
  default_country: z.enum(['EG', 'SD']).optional(),
  default_currency: z.enum(['EGP', 'SDG']).optional(),
  exchange_rate_egp_sdg: z.number().positive().max(10000).optional(),
  conversion_margin_percent: z.number().min(0).max(30).optional(),
  shipping_fee_eg: z.number().min(0).optional(),
  shipping_fee_sd: z.number().min(0).optional(),
  min_order_eg: z.number().min(0).optional(),
  min_order_sd: z.number().min(0).optional(),
});

adminRouter.put('/settings', asyncHandler(async (req, res) => {
  const body = parseBody(settingsSchema, req, res); if (!body) return;
  const rateChanged = body.exchange_rate_egp_sdg !== undefined || body.conversion_margin_percent !== undefined;
  if (body.egp_enabled !== undefined) await setSetting('egp_enabled', String(body.egp_enabled));
  if (body.sdg_enabled !== undefined) await setSetting('sdg_enabled', String(body.sdg_enabled));
  if (body.default_country) await setSetting('default_country', body.default_country);
  if (body.default_currency) await setSetting('default_currency', body.default_currency);
  if (body.exchange_rate_egp_sdg !== undefined) await setSetting('exchange_rate_egp_sdg', String(body.exchange_rate_egp_sdg));
  if (body.conversion_margin_percent !== undefined) await setSetting('conversion_margin_percent', String(body.conversion_margin_percent));
  if (body.shipping_fee_eg !== undefined) await setSetting('shipping_fee_eg', String(body.shipping_fee_eg));
  if (body.shipping_fee_sd !== undefined) await setSetting('shipping_fee_sd', String(body.shipping_fee_sd));
  if (body.min_order_eg !== undefined) await setSetting('min_order_eg', String(body.min_order_eg));
  if (body.min_order_sd !== undefined) await setSetting('min_order_sd', String(body.min_order_sd));
  if (rateChanged) {
    await setSetting('exchange_rate_updated_at', new Date().toISOString());
    await setSetting('exchange_rate_source', 'manual');
  }
  res.json({ settings: await getCurrencySettings() });
}));
