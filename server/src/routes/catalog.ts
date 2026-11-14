import { Router } from 'express';
import { query, getCurrencySettings, resolvePrice } from '../db/index.js';
import { asyncHandler, escapeLike } from '../utils/http.js';

export const catalogRouter = Router();

export interface ProductRow {
  id: number; sku: string; name_ar: string; name_en: string;
  description_ar: string; description_en: string;
  category_id: number; brand_id: number;
  price_egp: number | string; price_sdg: number | string | null; price_mode: string;
  discount_percent: number | string; stock: number; image: string; specs_json: string;
  featured: number; bestseller: number; new_arrival: number;
  sold_count: number; rating: number | string; review_count: number; created_at: string;
  category_slug?: string; category_name_ar?: string; category_name_en?: string;
  brand_name?: string;
}

const PRODUCT_SELECT = `
  SELECT p.*, c.slug AS category_slug, c.name_ar AS category_name_ar, c.name_en AS category_name_en, b.name AS brand_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN brands b ON b.id = p.brand_id
`;

export function serializeProduct(p: ProductRow, currency: 'EGP' | 'SDG', settings: Awaited<ReturnType<typeof getCurrencySettings>>) {
  const resolved = resolvePrice(p, currency, settings);
  const discount = Number(p.discount_percent) || 0;
  const finalPrice = Math.round(resolved.amount * (1 - discount / 100) * 100) / 100;
  return {
    id: p.id, sku: p.sku,
    name_ar: p.name_ar, name_en: p.name_en,
    description_ar: p.description_ar, description_en: p.description_en,
    category_id: p.category_id, category_slug: p.category_slug,
    category_name_ar: p.category_name_ar, category_name_en: p.category_name_en,
    brand_id: p.brand_id, brand_name: p.brand_name,
    price: finalPrice,
    base_price: resolved.amount,
    price_egp: Number(p.price_egp),
    price_sdg: p.price_sdg !== null ? Number(p.price_sdg) : null,
    price_mode: p.price_mode,
    discount_percent: discount,
    stock: p.stock, image: p.image, specs: safeJson(p.specs_json),
    featured: !!p.featured, bestseller: !!p.bestseller, new_arrival: !!p.new_arrival,
    sold_count: p.sold_count, rating: Number(p.rating), review_count: p.review_count,
    created_at: p.created_at, currency,
    converted: resolved.exchangeRate !== null,
    exchange_rate: resolved.exchangeRate,
  };
}

const safeJson = (s: string) => { try { return JSON.parse(s || '{}'); } catch { return {}; } };

catalogRouter.get('/categories', asyncHandler(async (_req, res) => {
  const rows = await query('SELECT * FROM categories ORDER BY sort_order, id');
  res.json({ categories: rows.rows });
}));

catalogRouter.get('/brands', asyncHandler(async (_req, res) => {
  const rows = await query('SELECT * FROM brands ORDER BY name');
  res.json({ brands: rows.rows });
}));

catalogRouter.get('/banners', asyncHandler(async (_req, res) => {
  const rows = await query('SELECT * FROM banners WHERE active = 1 ORDER BY sort_order, id');
  res.json({ banners: rows.rows });
}));

catalogRouter.get('/products', asyncHandler(async (req, res) => {
  const settings = await getCurrencySettings();
  const currency = (req.query.currency === 'SDG' ? 'SDG' : req.query.currency === 'EGP' ? 'EGP' : settings.defaultCurrency) as 'EGP' | 'SDG';
  const q = String(req.query.search || '').trim();
  const category = String(req.query.category || '').trim();
  const brand = String(req.query.brand || '').trim();
  const ids = String(req.query.ids || '').trim().split(',').map(s => Number(s)).filter(n => Number.isInteger(n) && n > 0);
  const sort = String(req.query.sort || 'newest');
  const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : null;
  const featured = req.query.featured === '1';
  const bestseller = req.query.bestseller === '1';
  const newArrival = req.query.new_arrival === '1';
  const onSale = req.query.on_sale === '1';
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 24));

  const where: string[] = [];
  const params: any[] = [];
  if (ids.length) { const ph = ids.map(id => { params.push(id); return '$' + params.length; }).join(','); where.push(`p.id IN (${ph})`); }
  if (category) { params.push(category); where.push(`c.slug = $${params.length}`); }
  if (brand) { params.push(brand); where.push(`LOWER(b.name) = LOWER($${params.length})`); }
  if (featured) where.push('p.featured = 1');
  if (bestseller) where.push('p.bestseller = 1');
  if (newArrival) where.push('p.new_arrival = 1');
  if (onSale) where.push('p.discount_percent > 0');
  if (q) {
    const like = `%${escapeLike(q.toLowerCase())}%`;
    params.push(like);
    const i = params.length;
    where.push(`(LOWER(p.name_ar) LIKE $${i} ESCAPE '\\' OR LOWER(p.name_en) LIKE $${i} ESCAPE '\\' OR LOWER(p.description_ar) LIKE $${i} ESCAPE '\\' OR LOWER(p.description_en) LIKE $${i} ESCAPE '\\' OR LOWER(p.sku) LIKE $${i} ESCAPE '\\' OR LOWER(COALESCE(b.name,'')) LIKE $${i} ESCAPE '\\' OR LOWER(COALESCE(c.name_ar,'')) LIKE $${i} ESCAPE '\\' OR LOWER(COALESCE(c.name_en,'')) LIKE $${i} ESCAPE '\\')`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = (await query<ProductRow>(`${PRODUCT_SELECT} ${whereSql}`, params)).rows;

  let items = rows.map(r => serializeProduct(r, currency, settings));
  // Price filter — applied in the customer's selected currency, after dual-price resolution
  if (minPrice !== null && !Number.isNaN(minPrice)) items = items.filter(i => i.price >= minPrice);
  if (maxPrice !== null && !Number.isNaN(maxPrice)) items = items.filter(i => i.price <= maxPrice);
  // Sorting
  switch (sort) {
    case 'price_asc': items.sort((a, b) => a.price - b.price); break;
    case 'price_desc': items.sort((a, b) => b.price - a.price); break;
    case 'bestselling': items.sort((a, b) => b.sold_count - a.sold_count); break;
    case 'rating': items.sort((a, b) => b.rating - a.rating); break;
    case 'discount': items.sort((a, b) => b.discount_percent - a.discount_percent); break;
    case 'oldest': items.sort((a, b) => a.created_at.localeCompare(b.created_at)); break;
    default: items.sort((a, b) => b.created_at.localeCompare(a.created_at)); // newest
  }
  const total = items.length;
  const start = (page - 1) * limit;
  res.json({ products: items.slice(start, start + limit), total, page, pages: Math.ceil(total / limit), currency });
}));

catalogRouter.get('/products/:id', asyncHandler(async (req, res) => {
  const settings = await getCurrencySettings();
  const currency = (req.query.currency === 'SDG' ? 'SDG' : req.query.currency === 'EGP' ? 'EGP' : settings.defaultCurrency) as 'EGP' | 'SDG';
  const rows = (await query<ProductRow>(`${PRODUCT_SELECT} WHERE p.id = $1`, [Number(req.params.id)])).rows;
  if (!rows[0]) return res.status(404).json({ error: 'NOT_FOUND', message: 'Product not found' });
  const product = serializeProduct(rows[0], currency, settings);
  const reviews = (await query('SELECT id, author_name, rating, comment, created_at FROM reviews WHERE product_id = $1 ORDER BY id DESC', [product.id])).rows;
  const similar = (await query<ProductRow>(`${PRODUCT_SELECT} WHERE c.slug = $1 AND p.id <> $2 ORDER BY p.sold_count DESC LIMIT 6`, [rows[0].category_slug || '', product.id])).rows
    .map(r => serializeProduct(r, currency, settings));
  res.json({ product, reviews, similar });
}));

catalogRouter.get('/search/suggest', asyncHandler(async (req, res) => {
  const settings = await getCurrencySettings();
  const currency = (req.query.currency === 'SDG' ? 'SDG' : 'EGP') as 'EGP' | 'SDG';
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ suggestions: [] });
  const like = `%${escapeLike(q.toLowerCase())}%`;
  const rows = (await query<ProductRow>(
    `${PRODUCT_SELECT} WHERE LOWER(p.name_ar) LIKE $1 ESCAPE '\\' OR LOWER(p.name_en) LIKE $1 ESCAPE '\\' OR LOWER(COALESCE(b.name,'')) LIKE $1 ESCAPE '\\' OR LOWER(p.sku) LIKE $1 ESCAPE '\\' ORDER BY p.sold_count DESC LIMIT 8`,
    [like]
  )).rows;
  res.json({ suggestions: rows.map(r => serializeProduct(r, currency, settings)) });
}));

catalogRouter.get('/settings/public', asyncHandler(async (_req, res) => {
  const s = await getCurrencySettings();
  res.json({ settings: s, store: { name: 'KAJOK', support_phone: (await query('SELECT value FROM settings WHERE key = $1', ['support_phone'])).rows[0]?.value || '19000' } });
}));
