import { Pool, type PoolClient } from "pg";
import { AsyncLocalStorage } from 'node:async_hooks';
import { HttpError } from '../middleware/error.js';
import { changeFulfillment, sellerView } from '../lib/order-fulfillment.js';
import type {
  Address,
  AdminStats,
  Banner,
  Brand,
  Category,
  Coupon,
  ExchangeRate,
  Order,
  SellerProfile,
  OrderStatus,
  Paged,
  Product,
  ProductQuery,
  Review,
  User,
} from "./types.js";
import type { Store } from "./store.js";

/**
 * PostgreSQL adapter — the canonical production store for KUJUK.
 * Requires DATABASE_URL. Schema lives in schema.sql (idempotent).
 * Never drops or migrates existing tables: all DDL is CREATE IF NOT EXISTS.
 */
export class PgStore implements Store {
  readonly kind = "postgres" as const;
  private pool: Pool;
  private tx = new AsyncLocalStorage<PoolClient>();

  constructor(databaseUrl: string) {
    this.pool = new Pool({ connectionString: databaseUrl, max: 10 });
  }

  private async q<T extends Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
    const res = await (this.tx.getStore() ?? this.pool).query(text, params);
    return res.rows as T[];
  }

  private mapUser(r: Record<string, any>): User {
    return {
      id: Number(r.id),
      name: r.name,
      email: r.email,
      passwordHash: r.password_hash,
      role: r.role,
      phone: r.phone ?? null,
      firebaseUid: r.firebase_uid ?? null,
      photoUrl: r.photo_url ?? null,
      country: r.country ?? null,
      emailVerified: Boolean(r.email_verified),
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  private mapProduct(r: Record<string, any>): Product {
    return {
      id: Number(r.id),
      slug: r.slug,
      nameEn: r.name_en,
      nameAr: r.name_ar,
      descriptionEn: r.description_en,
      descriptionAr: r.description_ar,
      price: Number(r.price),
      discountPrice: r.discount_price === null ? null : Number(r.discount_price),
      brandId: r.brand_id === null ? 0 : Number(r.brand_id),
      categoryId: r.category_id === null ? 0 : Number(r.category_id),
      stock: Number(r.stock),
      images: Array.isArray(r.images) ? r.images : [],
      video: r.video ?? null,
      specs: r.specs ?? {},
      rating: Number(r.rating),
      reviewCount: Number(r.review_count),
      isFeatured: Boolean(r.is_featured),
      isNew: Boolean(r.is_new),
      salesCount: Number(r.sales_count),
      sellerId: r.seller_id === null || r.seller_id === undefined ? null : Number(r.seller_id),
      sku: r.sku ?? null,
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  private mapOrder(r: Record<string, any>): Order {
    return {
      id: Number(r.id),
      reference: r.reference,
      userId: Number(r.user_id),
      items: r.items ?? [],
      subtotal: Number(r.subtotal),
      discount: Number(r.discount),
      shipping: Number(r.shipping),
      total: Number(r.total),
      couponCode: r.coupon_code ?? null,
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      status: r.status,
      currency: r.currency ?? "EGP",
      exchangeRate: Number(r.exchange_rate ?? 1),
      customer: r.customer ?? {},
      sellerOrders: r.seller_orders ?? [],
      checkoutHash: r.checkout_hash ?? undefined,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    };
  }

  // ---------- Users ----------
  async findUserByEmail(email: string): Promise<User | null> {
    const rows = await this.q("SELECT * FROM users WHERE lower(email) = lower($1)", [email]);
    return rows[0] ? this.mapUser(rows[0]) : null;
  }
  async findUserById(id: number): Promise<User | null> {
    const rows = await this.q("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] ? this.mapUser(rows[0]) : null;
  }
  async createUser(data: Omit<User, "id" | "createdAt">): Promise<User> {
    const rows = await this.q(
      "INSERT INTO users (name, email, password_hash, role, phone, firebase_uid, photo_url, country, email_verified) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [data.name, data.email, data.passwordHash, data.role, data.phone, data.firebaseUid ?? null, data.photoUrl ?? null, data.country ?? null, data.emailVerified ?? false],
    );
    return this.mapUser(rows[0]);
  }
  async findUserByFirebaseUid(uid: string): Promise<User | null> {
    const rows = await this.q("SELECT * FROM users WHERE firebase_uid = $1", [uid]);
    return rows[0] ? this.mapUser(rows[0]) : null;
  }
  async updateUser(id: number, data: Partial<Pick<User, "role" | "name" | "phone" | "passwordHash" | "firebaseUid" | "photoUrl" | "country" | "emailVerified">>): Promise<User | null> {
    const sets: string[] = [];
    const params: unknown[] = [id];
    if (data.role !== undefined) { params.push(data.role); sets.push(`role = $${params.length}`); }
    if (data.name !== undefined) { params.push(data.name); sets.push(`name = $${params.length}`); }
    if (data.phone !== undefined) { params.push(data.phone); sets.push(`phone = $${params.length}`); }
    if (data.passwordHash !== undefined) { params.push(data.passwordHash); sets.push(`password_hash = $${params.length}`); }
    if (data.firebaseUid !== undefined) { params.push(data.firebaseUid); sets.push(`firebase_uid = $${params.length}`); }
    if (data.photoUrl !== undefined) { params.push(data.photoUrl); sets.push(`photo_url = $${params.length}`); }
    if (data.country !== undefined) { params.push(data.country); sets.push(`country = $${params.length}`); }
    if (data.emailVerified !== undefined) { params.push(data.emailVerified); sets.push(`email_verified = $${params.length}`); }
    if (!sets.length) return this.findUserById(id);
    const rows = await this.q(`UPDATE users SET ${sets.join(", ")} WHERE id = $1 RETURNING *`, params);
    return rows[0] ? this.mapUser(rows[0]) : null;
  }
  async listUsers(): Promise<User[]> {
    const rows = await this.q("SELECT * FROM users ORDER BY created_at DESC");
    return rows.map((r) => this.mapUser(r));
  }

  // ---------- Addresses ----------
  private mapAddress(r: Record<string, any>): Address {
    return {
      id: Number(r.id),
      userId: Number(r.user_id),
      label: r.label,
      fullName: r.full_name,
      phone: r.phone,
      country: r.country,
      city: r.city,
      address: r.address,
      instructions: r.instructions ?? null,
      isDefault: Boolean(r.is_default),
    };
  }
  async listAddresses(userId: number): Promise<Address[]> {
    const rows = await this.q("SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id", [userId]);
    return rows.map((r) => this.mapAddress(r));
  }
  async createAddress(data: Omit<Address, "id">): Promise<Address> {
    if (data.isDefault) await this.q("UPDATE addresses SET is_default = false WHERE user_id = $1", [data.userId]);
    const rows = await this.q(
      "INSERT INTO addresses (user_id, label, full_name, phone, country, city, address, instructions, is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [data.userId, data.label, data.fullName, data.phone, data.country, data.city, data.address, data.instructions, data.isDefault],
    );
    return this.mapAddress(rows[0]);
  }
  async updateAddress(id: number, userId: number, data: Partial<Address>): Promise<Address | null> {
    const existing = await this.q("SELECT * FROM addresses WHERE id = $1 AND user_id = $2", [id, userId]);
    if (!existing[0]) return null;
    const merged = { ...this.mapAddress(existing[0]), ...data };
    if (merged.isDefault) await this.q("UPDATE addresses SET is_default = false WHERE user_id = $1 AND id <> $2", [userId, id]);
    const rows = await this.q(
      "UPDATE addresses SET label=$3, full_name=$4, phone=$5, country=$6, city=$7, address=$8, instructions=$9, is_default=$10 WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId, merged.label, merged.fullName, merged.phone, merged.country, merged.city, merged.address, merged.instructions, merged.isDefault],
    );
    return rows[0] ? this.mapAddress(rows[0]) : null;
  }
  async deleteAddress(id: number, userId: number): Promise<boolean> {
    const rows = await this.q("DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id", [id, userId]);
    return rows.length > 0;
  }

  // ---------- Categories ----------
  private mapCategory(r: Record<string, any>): Category {
    return { id: Number(r.id), slug: r.slug, nameEn: r.name_en, nameAr: r.name_ar, image: r.image, sort: Number(r.sort) };
  }
  async listCategories(): Promise<Category[]> {
    const rows = await this.q("SELECT * FROM categories ORDER BY sort, id");
    return rows.map((r) => this.mapCategory(r));
  }
  async createCategory(data: Omit<Category, "id">): Promise<Category> {
    const rows = await this.q(
      "INSERT INTO categories (slug, name_en, name_ar, image, sort) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [data.slug, data.nameEn, data.nameAr, data.image, data.sort],
    );
    return this.mapCategory(rows[0]);
  }
  async updateCategory(id: number, data: Partial<Category>): Promise<Category | null> {
    const existing = await this.q("SELECT * FROM categories WHERE id = $1", [id]);
    if (!existing[0]) return null;
    const merged = { ...this.mapCategory(existing[0]), ...data };
    const rows = await this.q(
      "UPDATE categories SET slug=$2, name_en=$3, name_ar=$4, image=$5, sort=$6 WHERE id=$1 RETURNING *",
      [id, merged.slug, merged.nameEn, merged.nameAr, merged.image, merged.sort],
    );
    return this.mapCategory(rows[0]);
  }
  async deleteCategory(id: number): Promise<boolean> {
    const rows = await this.q("DELETE FROM categories WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }

  // ---------- Brands ----------
  private mapBrand(r: Record<string, any>): Brand {
    return { id: Number(r.id), slug: r.slug, name: r.name };
  }
  async listBrands(): Promise<Brand[]> {
    const rows = await this.q("SELECT * FROM brands ORDER BY name");
    return rows.map((r) => this.mapBrand(r));
  }
  async createBrand(data: Omit<Brand, "id">): Promise<Brand> {
    const rows = await this.q("INSERT INTO brands (slug, name) VALUES ($1,$2) RETURNING *", [data.slug, data.name]);
    return this.mapBrand(rows[0]);
  }
  async updateBrand(id: number, data: Partial<Brand>): Promise<Brand | null> {
    const existing = await this.q("SELECT * FROM brands WHERE id = $1", [id]);
    if (!existing[0]) return null;
    const merged = { ...this.mapBrand(existing[0]), ...data };
    const rows = await this.q("UPDATE brands SET slug=$2, name=$3 WHERE id=$1 RETURNING *", [id, merged.slug, merged.name]);
    return this.mapBrand(rows[0]);
  }
  async deleteBrand(id: number): Promise<boolean> {
    const rows = await this.q("DELETE FROM brands WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }

  // ---------- Products ----------
  async listProducts(query: ProductQuery): Promise<Paged<Product>> {
    const wheres: string[] = [];
    const params: unknown[] = [];
    const add = (sql: string, value: unknown) => { params.push(value); wheres.push(sql.replace("?", `$${params.length}`)); };

    if (!query.admin) wheres.push("(p.seller_id IS NULL OR s.status = 'approved')");
    if (query.sellerId) add('p.seller_id = ?', query.sellerId);
    if (query.inStock) wheres.push('p.stock > 0');
    if (query.offers) wheres.push('p.discount_price < p.price');
    if (query.ids?.length) { params.push(query.ids); wheres.push(`p.id = ANY($${params.length}::bigint[])`); }
    if (query.featured) wheres.push("p.is_featured = true");
    if (query.isNew) wheres.push("p.is_new = true");
    if (query.category) add("c.slug = ?", query.category);
    if (query.brand) add("b.slug = ?", query.brand);
    if (query.minPrice !== undefined) add("COALESCE(p.discount_price, p.price) >= ?", query.minPrice);
    if (query.maxPrice !== undefined) add("COALESCE(p.discount_price, p.price) <= ?", query.maxPrice);
    if (query.q) {
      params.push(`%${query.q}%`);
      const placeholder = `$${params.length}`;
      wheres.push(`(${['p.name_en', 'p.name_ar', 'p.description_en', 'p.description_ar', 'b.name', 'c.name_en', 'c.name_ar', 's.shop_name_en', 's.shop_name_ar'].map(col => `${col} ILIKE ${placeholder}`).join(' OR ')})`);
    }

    const where = wheres.length ? `WHERE ${wheres.join(" AND ")}` : "";
    const orderMap: Record<string, string> = {
      "price-asc": "COALESCE(p.discount_price, p.price) ASC",
      "price-desc": "COALESCE(p.discount_price, p.price) DESC",
      popularity: "p.sales_count DESC",
      rating: "p.rating DESC",
      discount: "(p.price - COALESCE(p.discount_price, p.price)) / NULLIF(p.price,0) DESC",
      newest: "p.created_at DESC",
    };
    const order = query.sort && Object.hasOwn(orderMap, query.sort) ? orderMap[query.sort] : orderMap.newest;
    const limit = Math.min(60, Math.max(1, query.limit ?? 12));
    const page = Math.min(100_000, Math.max(1, query.page || 1));
    const offset = (page - 1) * limit;

    const countRows = await this.q<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM products p LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN brands b ON b.id = p.brand_id LEFT JOIN seller_profiles s ON s.user_id = p.seller_id ${where}`,
      params,
    );
    const total = Number(countRows[0]?.count ?? 0);
    const rows = await this.q(
      `SELECT p.* FROM products p LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN brands b ON b.id = p.brand_id LEFT JOIN seller_profiles s ON s.user_id = p.seller_id ${where} ORDER BY ${order} LIMIT ${limit} OFFSET ${offset}`,
      params,
    );
    return { items: rows.map((r) => this.mapProduct(r)), total, page, pages: Math.max(1, Math.ceil(total / limit)), limit };
  }
  async getProductBySlug(slug: string): Promise<Product | null> {
    const rows = await this.q("SELECT * FROM products WHERE slug = $1", [slug]);
    return rows[0] ? this.mapProduct(rows[0]) : null;
  }
  async getProductById(id: number): Promise<Product | null> {
    const rows = await this.q("SELECT * FROM products WHERE id = $1", [id]);
    return rows[0] ? this.mapProduct(rows[0]) : null;
  }
  async createProduct(data: Omit<Product, "id" | "rating" | "reviewCount" | "salesCount" | "createdAt">): Promise<Product> {
    const rows = await this.q(
      `INSERT INTO products (slug, name_en, name_ar, description_en, description_ar, price, discount_price, brand_id, category_id, stock, images, video, specs, is_featured, is_new, seller_id, sku)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13::jsonb,$14,$15,$16,$17) RETURNING *`,
      [data.slug, data.nameEn, data.nameAr, data.descriptionEn, data.descriptionAr, data.price, data.discountPrice, data.brandId || null, data.categoryId || null, data.stock, JSON.stringify(data.images), data.video ?? null, JSON.stringify(data.specs), data.isFeatured, data.isNew, data.sellerId ?? null, data.sku ?? null],
    );
    return this.mapProduct(rows[0]);
  }
  async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    return this.transaction(async () => {
    const existing = await this.q("SELECT * FROM products WHERE id = $1 FOR UPDATE", [id]);
    if (!existing[0]) return null;
    const merged = { ...this.mapProduct(existing[0]), ...data };
    const rows = await this.q(
      `UPDATE products SET slug=$2, name_en=$3, name_ar=$4, description_en=$5, description_ar=$6, price=$7, discount_price=$8, brand_id=$9, category_id=$10, stock=$11, images=$12::jsonb, video=$13, specs=$14::jsonb, is_featured=$15, is_new=$16, sku=$17 WHERE id=$1 RETURNING *`,
      [id, merged.slug, merged.nameEn, merged.nameAr, merged.descriptionEn, merged.descriptionAr, merged.price, merged.discountPrice, merged.brandId || null, merged.categoryId || null, merged.stock, JSON.stringify(merged.images), merged.video ?? null, JSON.stringify(merged.specs), merged.isFeatured, merged.isNew, merged.sku ?? null],
    );
    return this.mapProduct(rows[0]);
    });
  }
  async deleteProduct(id: number): Promise<boolean> {
    const rows = await this.q("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }
  async relatedProducts(product: Product, limit = 4): Promise<Product[]> {
    const rows = await this.q(
      "SELECT * FROM products WHERE category_id = $1 AND id <> $2 ORDER BY sales_count DESC LIMIT $3",
      [product.categoryId, product.id, limit],
    );
    return rows.map((r) => this.mapProduct(r));
  }

  // ---------- Reviews ----------
  private mapReview(r: Record<string, any>): Review {
    return { id: Number(r.id), productId: Number(r.product_id), userId: Number(r.user_id), userName: r.user_name, rating: Number(r.rating), comment: r.comment, createdAt: new Date(r.created_at).toISOString() };
  }
  async listReviews(productId: number): Promise<Review[]> {
    const rows = await this.q("SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC", [productId]);
    return rows.map((r) => this.mapReview(r));
  }
  async createReview(data: Omit<Review, "id" | "createdAt">): Promise<Review> {
    const rows = await this.q(
      "INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [data.productId, data.userId, data.userName, data.rating, data.comment],
    );
    await this.q(
      `UPDATE products SET
         review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = $1),
         rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE product_id = $1), 0)
       WHERE id = $1`,
      [data.productId],
    );
    return this.mapReview(rows[0]);
  }

  // ---------- Orders ----------
  private async transaction<T>(work: () => Promise<T>): Promise<T> {
    if (this.tx.getStore()) return work();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await this.tx.run(client, work);
      await client.query('COMMIT');
      return result;
    } catch (err) { await client.query('ROLLBACK'); throw err; }
    finally { client.release(); }
  }
  async checkout<T>(userId: number, productIds: number[], work: () => Promise<T>): Promise<T> {
    return this.transaction(async () => {
      await this.q('SELECT id FROM users WHERE id = $1 FOR UPDATE', [userId]);
      await this.q('SELECT id FROM products WHERE id = ANY($1::bigint[]) ORDER BY id FOR UPDATE', [productIds]);
      await this.q('SELECT s.id FROM seller_profiles s JOIN products p ON s.user_id = p.seller_id WHERE p.id = ANY($1::bigint[]) ORDER BY s.id FOR SHARE OF s', [productIds]);
      return work();
    });
  }
  async createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> {
    if (!this.tx.getStore()) throw new Error('Order writes require checkout transaction');
    const rows = await this.q(
      `INSERT INTO orders (reference, user_id, items, subtotal, discount, shipping, total, coupon_code, payment_method, payment_status, status, currency, exchange_rate, customer, seller_orders, seller_ids, checkout_hash)
       VALUES ($1,$2,$3::jsonb,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb,$16,$17) RETURNING *`,
      [data.reference, data.userId, JSON.stringify(data.items), data.subtotal, data.discount, data.shipping, data.total,
       data.couponCode, data.paymentMethod, data.paymentStatus, data.status, data.currency, data.exchangeRate,
       JSON.stringify(data.customer), JSON.stringify(data.sellerOrders ?? []), (data.sellerOrders ?? []).flatMap(p => p.sellerId === null ? [] : [p.sellerId]), data.checkoutHash],
    );
    for (const item of data.items) {
      const changed = await this.q('UPDATE products SET stock = stock - $1, sales_count = sales_count + $1 WHERE id = $2 AND stock >= $1 RETURNING id', [item.quantity, item.productId]);
      if (!changed.length) throw new HttpError(409, 'Stock changed. Please refresh your cart.');
    }
    return this.mapOrder(rows[0]);
  }
  async listOrdersForSeller(sellerId: number) {
    return (await this.q('SELECT * FROM orders WHERE seller_ids @> ARRAY[$1::bigint] ORDER BY created_at DESC', [sellerId])).map(r => sellerView(this.mapOrder(r), sellerId));
  }
  async listOrdersForUser(userId: number): Promise<Order[]> {
    const rows = await this.q("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    return rows.map((r) => this.mapOrder(r));
  }
  async listOrders(status?: OrderStatus): Promise<Order[]> {
    const rows = status
      ? await this.q("SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC", [status])
      : await this.q("SELECT * FROM orders ORDER BY created_at DESC");
    return rows.map((r) => this.mapOrder(r));
  }
  async getOrderById(id: number): Promise<Order | null> {
    const rows = await this.q("SELECT * FROM orders WHERE id = $1", [id]);
    return rows[0] ? this.mapOrder(rows[0]) : null;
  }
  async getOrderByReference(reference: string): Promise<Order | null> {
    const rows = await this.q("SELECT * FROM orders WHERE lower(reference) = lower($1)", [reference]);
    return rows[0] ? this.mapOrder(rows[0]) : null;
  }
  async updateOrderStatus(id: number, status: OrderStatus, sellerId?: number | null): Promise<Order | null> {
    return this.transaction(async () => {
      const [row] = await this.q('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id]);
      if (!row) return null;
      const { order, restock } = changeFulfillment(this.mapOrder(row), status, sellerId);
      for (const item of restock.sort((a, b) => a.productId - b.productId)) {
        await this.q('UPDATE products SET stock = stock + $1, sales_count = GREATEST(0, sales_count - $1) WHERE id = $2', [item.quantity, item.productId]);
      }
      const [updated] = await this.q('UPDATE orders SET status=$2, payment_status=$3, updated_at=$4, seller_orders=$5::jsonb WHERE id=$1 RETURNING *',
        [id, order.status, order.paymentStatus, order.updatedAt, JSON.stringify(order.sellerOrders)]);
      return this.mapOrder(updated);
    });
  }

  // ---------- Coupons ----------
  private mapCoupon(r: Record<string, any>): Coupon {
    return {
      id: Number(r.id),
      code: r.code,
      type: r.type,
      value: Number(r.value),
      minOrder: Number(r.min_order),
      active: Boolean(r.active),
      expiresAt: r.expires_at ? new Date(r.expires_at).toISOString() : null,
    };
  }
  async listCoupons(): Promise<Coupon[]> {
    const rows = await this.q("SELECT * FROM coupons ORDER BY id");
    return rows.map((r) => this.mapCoupon(r));
  }
  async getCouponByCode(code: string): Promise<Coupon | null> {
    const rows = await this.q("SELECT * FROM coupons WHERE lower(code) = lower($1)", [code]);
    return rows[0] ? this.mapCoupon(rows[0]) : null;
  }
  async createCoupon(data: Omit<Coupon, "id">): Promise<Coupon> {
    const rows = await this.q(
      "INSERT INTO coupons (code, type, value, min_order, active, expires_at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [data.code, data.type, data.value, data.minOrder, data.active, data.expiresAt],
    );
    return this.mapCoupon(rows[0]);
  }
  async updateCoupon(id: number, data: Partial<Coupon>): Promise<Coupon | null> {
    const existing = await this.q("SELECT * FROM coupons WHERE id = $1", [id]);
    if (!existing[0]) return null;
    const merged = { ...this.mapCoupon(existing[0]), ...data };
    const rows = await this.q(
      "UPDATE coupons SET code=$2, type=$3, value=$4, min_order=$5, active=$6, expires_at=$7 WHERE id=$1 RETURNING *",
      [id, merged.code, merged.type, merged.value, merged.minOrder, merged.active, merged.expiresAt],
    );
    return this.mapCoupon(rows[0]);
  }
  async deleteCoupon(id: number): Promise<boolean> {
    const rows = await this.q("DELETE FROM coupons WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }

  // ---------- Banners ----------
  private mapBanner(r: Record<string, any>): Banner {
    return {
      id: Number(r.id),
      titleEn: r.title_en,
      titleAr: r.title_ar,
      subtitleEn: r.subtitle_en,
      subtitleAr: r.subtitle_ar,
      image: r.image,
      video: r.video ?? null,
      link: r.link,
      active: Boolean(r.active),
      sort: Number(r.sort),
    };
  }
  async listBanners(activeOnly = true): Promise<Banner[]> {
    const rows = activeOnly
      ? await this.q("SELECT * FROM banners WHERE active = true ORDER BY sort")
      : await this.q("SELECT * FROM banners ORDER BY sort");
    return rows.map((r) => this.mapBanner(r));
  }
  async createBanner(data: Omit<Banner, "id">): Promise<Banner> {
    const rows = await this.q(
      "INSERT INTO banners (title_en, title_ar, subtitle_en, subtitle_ar, image, video, link, active, sort) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [data.titleEn, data.titleAr, data.subtitleEn, data.subtitleAr, data.image, data.video ?? null, data.link, data.active, data.sort],
    );
    return this.mapBanner(rows[0]);
  }
  async updateBanner(id: number, data: Partial<Banner>): Promise<Banner | null> {
    const existing = await this.q("SELECT * FROM banners WHERE id = $1", [id]);
    if (!existing[0]) return null;
    const merged = { ...this.mapBanner(existing[0]), ...data };
    const rows = await this.q(
      "UPDATE banners SET title_en=$2, title_ar=$3, subtitle_en=$4, subtitle_ar=$5, image=$6, video=$7, link=$8, active=$9, sort=$10 WHERE id=$1 RETURNING *",
      [id, merged.titleEn, merged.titleAr, merged.subtitleEn, merged.subtitleAr, merged.image, merged.video ?? null, merged.link, merged.active, merged.sort],
    );
    return this.mapBanner(rows[0]);
  }
  async deleteBanner(id: number): Promise<boolean> {
    const rows = await this.q("DELETE FROM banners WHERE id = $1 RETURNING id", [id]);
    return rows.length > 0;
  }

  async getCommission(): Promise<{ bps: number; updatedAt: string; updatedBy: number } | null> {
    const [row] = await this.q<{ value: { bps: number; updatedAt: string; updatedBy: number } }>("SELECT value FROM kujuk_settings WHERE key = 'commission'");
    return row?.value ?? null;
  }
  async setCommission(value: { bps: number; updatedAt: string; updatedBy: number }): Promise<void> {
    await this.q("INSERT INTO kujuk_settings (key,value) VALUES ('commission',$1::jsonb) ON CONFLICT (key) DO UPDATE SET value=excluded.value", [JSON.stringify(value)]);
  }

  // ---------- Reporting ----------
  async adminStats(): Promise<AdminStats> {
    const revenue = await this.q<{ total: string }>("SELECT COALESCE(SUM(total / NULLIF(exchange_rate,0)),0)::text AS total FROM orders WHERE status <> 'cancelled'");
    const orders = await this.q<{ count: string }>("SELECT COUNT(*)::text AS count FROM orders");
    const customers = await this.q<{ count: string }>("SELECT COUNT(*)::text AS count FROM users WHERE role = 'customer'");
    const products = await this.q<{ count: string }>("SELECT COUNT(*)::text AS count FROM products");
    const pending = await this.q<{ count: string }>("SELECT COUNT(*)::text AS count FROM orders WHERE status = 'pending'");
    const lowStock = await this.q<{ count: string }>("SELECT COUNT(*)::text AS count FROM products WHERE stock <= 10");
    const sales = await this.q<{ date: string; orders: string; revenue: string }>(
      `SELECT to_char(created_at, 'YYYY-MM-DD') AS date, COUNT(*)::text AS orders, COALESCE(SUM(total / NULLIF(exchange_rate,0)),0)::text AS revenue
       FROM orders WHERE status <> 'cancelled' AND created_at >= now() - interval '14 days'
       GROUP BY 1 ORDER BY 1`,
    );
    const recent = await this.q("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");

    const days: { date: string; orders: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push({ date: d.toISOString().slice(0, 10), orders: 0, revenue: 0 });
    }
    for (const s of sales) {
      const point = days.find((p) => p.date === s.date);
      if (point) {
        point.orders = Number(s.orders);
        point.revenue = Number(s.revenue);
      }
    }
    return {
      totalRevenue: Number(revenue[0]?.total ?? 0),
      totalOrders: Number(orders[0]?.count ?? 0),
      totalCustomers: Number(customers[0]?.count ?? 0),
      totalProducts: Number(products[0]?.count ?? 0),
      pendingOrders: Number(pending[0]?.count ?? 0),
      lowStock: Number(lowStock[0]?.count ?? 0),
      salesByDay: days,
      recentOrders: recent.map((r) => this.mapOrder(r)),
    };
  }

  // ---------- Exchange rates (manual, history preserved) ----------
  async listExchangeRates(): Promise<ExchangeRate[]> {
    const rows = (await this.q("SELECT * FROM exchange_rates ORDER BY id DESC")) as Record<string, any>[];
    return rows.map((r) => ({
      id: Number(r.id),
      base: r.base,
      quote: r.quote,
      rate: Number(r.rate),
      note: r.note ?? null,
      createdBy: r.created_by ?? null,
      createdAt: new Date(r.created_at).toISOString(),
    }));
  }
  async addExchangeRate(rate: Omit<ExchangeRate, "id">): Promise<ExchangeRate> {
    const rows = await this.q(
      `INSERT INTO exchange_rates (base, quote, rate, note, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [rate.base, rate.quote, rate.rate, rate.note, rate.createdBy],
    );
    const r = rows[0] as Record<string, any>;
    return {
      id: Number(r.id),
      base: r.base,
      quote: r.quote,
      rate: Number(r.rate),
      note: r.note ?? null,
      createdBy: r.created_by ?? null,
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  // ---------- Seller profiles ----------
  private mapSeller(r: Record<string, any>): SellerProfile {
    return {
      id: Number(r.id),
      userId: Number(r.user_id),
      logo: r.logo ?? null,
      cover: r.cover ?? null,
      descriptionEn: r.description_en ?? "",
      descriptionAr: r.description_ar ?? "",
      shopNameEn: r.shop_name_en,
      shopNameAr: r.shop_name_ar,
      legalName: r.legal_name,
      passportNumber: r.passport_number,
      passportCountry: r.passport_country,
      passportExpiry: r.passport_expiry,
      businessInfo: r.business_info ?? null,
      passportDocument: r.passport_document ?? null,
      status: r.status,
      reviewNote: r.review_note ?? null,
      reviewedBy: r.reviewed_by ?? null,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
    };
  }
  async createSellerProfile(data: Omit<SellerProfile, "id" | "createdAt" | "updatedAt">): Promise<SellerProfile> {
    const rows = await this.q(
      `INSERT INTO seller_profiles (user_id, shop_name_en, shop_name_ar, legal_name, passport_number, passport_country, passport_expiry, business_info, passport_document, status, review_note, reviewed_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [data.userId, data.shopNameEn, data.shopNameAr, data.legalName, data.passportNumber, data.passportCountry, data.passportExpiry, data.businessInfo, data.passportDocument, data.status, data.reviewNote, data.reviewedBy],
    );
    return this.mapSeller(rows[0] as Record<string, any>);
  }
  async getSellerProfileByUserId(userId: number): Promise<SellerProfile | null> {
    const rows = (await this.q("SELECT * FROM seller_profiles WHERE user_id = $1", [userId])) as Record<string, any>[];
    return rows[0] ? this.mapSeller(rows[0]) : null;
  }
  async getSellerProfileById(id: number): Promise<SellerProfile | null> {
    const rows = (await this.q("SELECT * FROM seller_profiles WHERE id = $1", [id])) as Record<string, any>[];
    return rows[0] ? this.mapSeller(rows[0]) : null;
  }
  async updateSellerProfile(id: number, data: Partial<SellerProfile>): Promise<SellerProfile | null> {
    return this.transaction(async () => {
      const [existing] = await this.q("SELECT * FROM seller_profiles WHERE id = $1 FOR UPDATE", [id]);
      if (!existing) return null;
      const merged = { ...this.mapSeller(existing), ...data };
      const [row] = await this.q(
        `UPDATE seller_profiles SET shop_name_en=$2, shop_name_ar=$3, legal_name=$4, passport_number=$5, passport_country=$6, passport_expiry=$7,
         business_info=$8, passport_document=$9, status=$10, review_note=$11, reviewed_by=$12, logo=$13, cover=$14, description_en=$15, description_ar=$16, updated_at=now()
         WHERE id=$1 RETURNING *`,
        [id, merged.shopNameEn, merged.shopNameAr, merged.legalName, merged.passportNumber, merged.passportCountry, merged.passportExpiry, merged.businessInfo, merged.passportDocument,
         merged.status, merged.reviewNote, merged.reviewedBy, merged.logo, merged.cover, merged.descriptionEn, merged.descriptionAr],
      );
      return this.mapSeller(row);
    });
  }
  async listSellerProfiles(): Promise<SellerProfile[]> {
    const rows = (await this.q("SELECT * FROM seller_profiles ORDER BY id DESC")) as Record<string, any>[];
    return rows.map((r) => this.mapSeller(r));
  }
  async listProductsBySeller(sellerId: number): Promise<Product[]> {
    const rows = (await this.q("SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC", [sellerId])) as Record<string, any>[];
    return rows.map((r) => this.mapProduct(r));
  }
}
