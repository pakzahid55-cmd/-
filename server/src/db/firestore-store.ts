import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash, randomInt } from 'node:crypto';
import { FieldValue, type Firestore, type Query, type Transaction, type DocumentSnapshot } from 'firebase-admin/firestore';
import { HttpError } from '../middleware/error.js';
import { changeFulfillment, money, sellerView } from '../lib/order-fulfillment.js';
import type { Store } from './store.js';
import type { Address, AdminStats, Banner, Brand, Category, Coupon, ExchangeRate, Order, OrderStatus, Product, ProductQuery, Review, SellerOrderView, SellerProfile, User } from './types.js';

const now = () => new Date().toISOString();
const newId = () => randomInt(1, 2 ** 47);
const keyHash = (key: string) => createHash('sha256').update(key).digest('hex');
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/** Server-only Firestore adapter. Auth, tenant scope and validation live at the API boundary. */
export class FirestoreStore implements Store {
  readonly kind = 'firestore' as const;
  private active = new AsyncLocalStorage<Transaction>();
  constructor(private db: Firestore) {}

  private collection(name: string) { return this.db.collection(`kujuk_${name}`); }
  private ref(name: string, id: string | number) { return this.collection(name).doc(String(id)); }
  private read<T>(snap: DocumentSnapshot): T | null { return (snap.data() as T | undefined) ?? null; }
  private transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    const existing = this.active.getStore();
    return existing ? fn(existing) : this.db.runTransaction(tx => this.active.run(tx, () => fn(tx)));
  }
  private async get<T>(name: string, id: string | number): Promise<T | null> {
    const ref = this.ref(name, id);
    const tx = this.active.getStore();
    return this.read<T>(await (tx ? tx.get(ref) : ref.get()));
  }
  private async query<T>(q: Query): Promise<T[]> {
    const tx = this.active.getStore();
    return (await (tx ? tx.get(q) : q.get())).docs.map(d => d.data() as T);
  }
  private all<T>(name: string) { return this.query<T>(this.collection(name)); }
  private by<T>(name: string, field: string, value: unknown) { return this.query<T>(this.collection(name).where(field, '==', value)); }
  private async first<T>(name: string, field: string, value: unknown) {
    return (await this.query<T>(this.collection(name).where(field, '==', value).limit(1)))[0] ?? null;
  }
  private async insert<T extends { id: number }>(name: string, value: T, unique: string[] = []): Promise<T> {
    const data = clean(value);
    if (unique.length === 0) { await this.ref(name, data.id).create(data); return data; }
    return this.transaction(async tx => {
      const markers = unique.map(key => this.ref('unique', keyHash(`${name}:${key}`)));
      const current = await tx.getAll(...markers);
      if (current.some(doc => doc.exists)) throw new HttpError(409, 'Record already exists');
      for (const marker of markers) tx.create(marker, { id: data.id });
      tx.create(this.ref(name, data.id), data);
      return data;
    });
  }
  private async update<T extends { id: number }>(name: string, id: number, patch: Partial<T>, check: (row: T) => boolean = () => true, uniqueField?: keyof T): Promise<T | null> {
    return this.transaction(async tx => {
      const current = await this.get<T>(name, id);
      if (!current || !check(current)) return null;
      const next = clean({ ...current, ...patch, id });
      if (uniqueField && current[uniqueField] !== next[uniqueField]) {
        const marker = this.ref('unique', keyHash(`${name}:${String(next[uniqueField])}`));
        if ((await tx.get(marker)).exists) throw new HttpError(409, 'Record already exists');
        tx.create(marker, { id });
        tx.delete(this.ref('unique', keyHash(`${name}:${String(current[uniqueField])}`)));
      }
      tx.set(this.ref(name, id), next);
      return next;
    });
  }
  private async remove<T>(name: string, id: number, check: (row: T) => boolean = () => true, uniqueField?: keyof T): Promise<boolean> {
    return this.transaction(async tx => {
      const row = await this.get<T>(name, id);
      if (!row || !check(row)) return false;
      tx.delete(this.ref(name, id));
      if (uniqueField) tx.delete(this.ref('unique', keyHash(`${name}:${String(row[uniqueField])}`)));
      return true;
    });
  }

  findUserByEmail(email: string) { return this.first<User>('users', 'email', email.toLowerCase()); }
  findUserById(id: number) { return this.get<User>('users', id); }
  findUserByFirebaseUid(uid: string) { return this.first<User>('users', 'firebaseUid', uid); }
  createUser(data: Omit<User, 'id' | 'createdAt'>) {
    return this.insert('users', { ...data, email: data.email.toLowerCase(), id: newId(), createdAt: now() }, [data.email.toLowerCase(), ...(data.firebaseUid ? [`uid:${data.firebaseUid}`] : [])]);
  }
  updateUser(id: number, data: Partial<User>) { return this.update<User>('users', id, data); }
  listUsers() { return this.all<User>('users'); }

  listAddresses(id: number) { return this.by<Address>('addresses', 'userId', id); }
  createAddress(data: Omit<Address, 'id'>) { return this.saveAddress({ ...data, id: newId() }); }
  async updateAddress(id: number, userId: number, data: Partial<Address>) {
    return this.transaction(async () => {
      const current = await this.get<Address>('addresses', id);
      if (!current || current.userId !== userId) return null;
      return this.saveAddress({ ...current, ...data, id, userId });
    });
  }
  private saveAddress(data: Address): Promise<Address> {
    return this.transaction(async tx => {
      const addresses = await this.listAddresses(data.userId);
      if (addresses.length >= 30 && !addresses.some(a => a.id === data.id)) throw new HttpError(400, 'Address limit reached');
      if (data.isDefault) for (const a of addresses) if (a.id !== data.id && a.isDefault) tx.update(this.ref('addresses', a.id), { isDefault: false });
      tx.set(this.ref('addresses', data.id), clean(data));
      return data;
    });
  }
  deleteAddress(id: number, userId: number) { return this.remove<Address>('addresses', id, row => row.userId === userId); }

  listCategories() { return this.query<Category>(this.collection('categories').orderBy('sort')); }
  createCategory(data: Omit<Category, 'id'>) { return this.insert('categories', { ...data, id: newId() }, [data.slug]); }
  updateCategory(id: number, data: Partial<Category>) { return this.update<Category>('categories', id, data, undefined, 'slug'); }
  deleteCategory(id: number) { return this.remove<Category>('categories', id, undefined, 'slug'); }
  listBrands() { return this.all<Brand>('brands'); }
  createBrand(data: Omit<Brand, 'id'>) { return this.insert('brands', { ...data, id: newId() }, [data.slug]); }
  updateBrand(id: number, data: Partial<Brand>) { return this.update<Brand>('brands', id, data, undefined, 'slug'); }
  deleteBrand(id: number) { return this.remove<Brand>('brands', id, undefined, 'slug'); }

  async listProducts(query: ProductQuery) {
    const [brands, categories] = await Promise.all([this.listBrands(), this.listCategories()]);
    const brandMap = new Map(brands.map(b => [b.id, b]));
    const catMap = new Map(categories.map(c => [c.id, c]));
    const q = query.q?.toLowerCase();
    let source: Query = this.collection('products');
    if (query.sellerId) source = source.where('sellerId', '==', query.sellerId);
    if (query.category) source = source.where('categoryId', '==', categories.find(c => c.slug === query.category)?.id ?? -1);
    if (query.brand) source = source.where('brandId', '==', brands.find(b => b.slug === query.brand)?.id ?? -1);
    const scoped = query.ids ? (await Promise.all(query.ids.map(id => this.getProductById(id)))).filter((x): x is Product => x !== null) : await this.query<Product>(source);
    const ids = [...new Set(scoped.flatMap(p => p.sellerId == null ? [] : [p.sellerId]))];
    const sellerDocs = ids.length ? await this.db.getAll(...ids.map(id => this.ref('sellers', id))) : [];
    const sellers = new Map(sellerDocs.map(d => [Number(d.id), this.read<SellerProfile>(d)]));
    const price = (p: Product) => p.discountPrice ?? p.price;
    const discount = (p: Product) => p.price ? (p.price - price(p)) / p.price : 0;
    const filtered = scoped.filter(p => {
      const brand = brandMap.get(p.brandId);
      const cat = catMap.get(p.categoryId);
      const seller = p.sellerId == null ? undefined : sellers.get(p.sellerId);
      return (query.admin || p.sellerId == null || seller?.status === 'approved') &&
        (!query.category || cat?.slug === query.category) && (!query.brand || brand?.slug === query.brand) &&
        (!query.featured || p.isFeatured) && (!query.isNew || p.isNew) && (!query.offers || discount(p) > 0) &&
        (!query.inStock || p.stock > 0) && price(p) >= (query.minPrice ?? 0) && price(p) <= (query.maxPrice ?? Infinity) &&
        (!q || [p.nameEn, p.nameAr, p.descriptionEn, p.descriptionAr, brand?.name, cat?.nameEn, cat?.nameAr, seller?.shopNameEn, seller?.shopNameAr].some(str => str?.toLowerCase().includes(q)));
    });
    filtered.sort((a, b) => {
      switch (query.sort) {
        case 'price-asc': return price(a) - price(b);
        case 'price-desc': return price(b) - price(a);
        case 'discount': return discount(b) - discount(a);
        case 'popularity': return b.salesCount - a.salesCount;
        case 'rating': return b.rating - a.rating;
        default: return b.createdAt.localeCompare(a.createdAt);
      }
    });
    const page = Math.max(1, query.page || 1), limit = Math.min(60, Math.max(1, query.limit || 12));
    return { items: filtered.slice((page - 1) * limit, page * limit), page, limit, total: filtered.length, pages: Math.max(1, Math.ceil(filtered.length / limit)) };
  }
  getProductBySlug(slug: string) { return this.first<Product>('products', 'slug', slug); }
  getProductById(id: number) { return this.get<Product>('products', id); }
  createProduct(data: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'salesCount' | 'createdAt'>) {
    return this.insert('products', { ...data, id: newId(), rating: 0, reviewCount: 0, salesCount: 0, createdAt: now() }, [data.slug]);
  }
  updateProduct(id: number, data: Partial<Product>) {
    const { sellerId: _ignored, ...patch } = data;
    return this.update<Product>('products', id, patch, undefined, 'slug');
  }
  deleteProduct(id: number) { return this.remove<Product>('products', id, undefined, 'slug'); }
  async relatedProducts(product: Product, limit = 4) {
    const products = await this.by<Product>('products', 'categoryId', product.categoryId);
    return products.filter(p => p.id !== product.id).sort((a, b) => b.salesCount - a.salesCount).slice(0, limit);
  }
  async listReviews(productId: number) {
    return (await this.by<Review>('reviews', 'productId', productId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100);
  }
  createReview(data: Omit<Review, 'id' | 'createdAt'>) {
    return this.transaction(async tx => {
      const marker = this.ref('unique', keyHash(`review:${data.productId}:${data.userId}`));
      const product = await this.getProductById(data.productId);
      if (!product) throw new HttpError(404, 'Product not found');
      if ((await tx.get(marker)).exists) throw new HttpError(409, 'You have already reviewed this product');
      const row = { ...data, id: newId(), createdAt: now() };
      tx.create(marker, { id: row.id });
      tx.create(this.ref('reviews', row.id), row);
      tx.update(this.ref('products', product.id), { rating: (product.rating * product.reviewCount + row.rating) / (product.reviewCount + 1), reviewCount: FieldValue.increment(1) });
      return row;
    });
  }

  checkout<T>(_userId: number, _productIds: number[], work: () => Promise<T>) { return this.transaction(() => work()); }
  async createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    const tx = this.active.getStore();
    if (!tx) throw new Error('Order writes require checkout transaction');
    const row: Order = clean({ ...data, id: newId(), createdAt: now(), updatedAt: now() });
    for (const line of data.items) tx.update(this.ref('products', line.productId), { stock: FieldValue.increment(-line.quantity), salesCount: FieldValue.increment(line.quantity) });
    tx.create(this.ref('order_references', data.reference.toLowerCase()), { id: row.id });
    tx.create(this.ref('orders', row.id), row);
    this.event(tx, row.userId, 'order_created', row.reference);
    this.event(tx, 0, 'admin_order', row.reference);
    for (const part of row.sellerOrders ?? []) if (part.sellerId !== null) {
      tx.create(this.ref('seller_orders', `${row.id}-${part.sellerId}`), sellerView(row, part.sellerId));
      this.event(tx, part.sellerId, 'seller_order', part.reference);
    }
    return row;
  }
  private async sortedOrders(q: Query) { return (await this.query<Order>(q)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  listOrdersForUser(userId: number) { return this.sortedOrders(this.collection('orders').where('userId', '==', userId)); }
  async listOrdersForSeller(sellerId: number) {
    return (await this.by<SellerOrderView>('seller_orders', 'sellerId', sellerId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  listOrders(status?: OrderStatus) { return this.sortedOrders(status ? this.collection('orders').where('status', '==', status) : this.collection('orders')); }
  getOrderById(id: number) { return this.get<Order>('orders', id); }
  async getOrderByReference(reference: string) {
    const lookup = await this.get<{ id: number }>('order_references', reference.toLowerCase());
    return lookup ? this.getOrderById(lookup.id) : null;
  }
  updateOrderStatus(id: number, status: OrderStatus, sellerId?: number | null) {
    return this.transaction(async tx => {
      const existing = await this.getOrderById(id);
      if (!existing) return null;
      const { order, restock } = changeFulfillment(existing, status, sellerId);
      const products = await Promise.all(restock.map(line => this.getProductById(line.productId)));
      for (const [i, line] of restock.entries()) if (products[i]) tx.update(this.ref('products', line.productId), { stock: FieldValue.increment(line.quantity), salesCount: Math.max(0, products[i]!.salesCount - line.quantity) });
      tx.update(this.ref('orders', id), clean({ status: order.status, sellerOrders: order.sellerOrders, paymentStatus: order.paymentStatus, updatedAt: order.updatedAt }));
      let partsChanged = false;
      order.sellerOrders?.forEach((part, i) => {
        const changed = part.status !== existing.sellerOrders?.[i]?.status;
        if (changed && part.sellerId !== null) {
          tx.set(this.ref('seller_orders', `${order.id}-${part.sellerId}`), sellerView(order, part.sellerId));
          if (sellerId !== part.sellerId) this.event(tx, part.sellerId, `order_${status}`, part.reference);
        }
        partsChanged ||= changed;
      });
      if (partsChanged || order.status !== existing.status) this.event(tx, order.userId, `order_${status}`, order.reference);
      return order;
    });
  }

  listCoupons() { return this.all<Coupon>('coupons'); }
  getCouponByCode(code: string) { return this.first<Coupon>('coupons', 'code', code.toUpperCase()); }
  createCoupon(data: Omit<Coupon, 'id'>) { const code = data.code.toUpperCase(); return this.insert('coupons', { ...data, code, id: newId() }, [code]); }
  updateCoupon(id: number, data: Partial<Coupon>) { return this.update<Coupon>('coupons', id, data.code ? { ...data, code: data.code.toUpperCase() } : data, undefined, 'code'); }
  deleteCoupon(id: number) { return this.remove<Coupon>('coupons', id, undefined, 'code'); }
  async listBanners(activeOnly = true) { return (await (activeOnly ? this.by<Banner>('banners', 'active', true) : this.all<Banner>('banners'))).sort((a, b) => a.sort - b.sort); }
  createBanner(data: Omit<Banner, 'id'>) { return this.insert('banners', { ...data, id: newId() }); }
  updateBanner(id: number, data: Partial<Banner>) { return this.update<Banner>('banners', id, data); }
  deleteBanner(id: number) { return this.remove<Banner>('banners', id); }
  listExchangeRates() { return this.query<ExchangeRate>(this.collection('rates').orderBy('createdAt', 'desc').limit(100)); }
  addExchangeRate(data: Omit<ExchangeRate, 'id'>) { return this.insert('rates', { ...data, id: newId() }); }
  createSellerProfile(data: Omit<SellerProfile, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.transaction(async tx => {
      const profile = { ...data, id: data.userId, createdAt: now(), updatedAt: now() };
      tx.create(this.ref('sellers', profile.id), clean(profile));
      this.event(tx, 0, 'admin_seller');
      return profile;
    });
  }
  getSellerProfileByUserId(id: number) { return this.get<SellerProfile>('sellers', id); }
  getSellerProfileById(id: number) { return this.get<SellerProfile>('sellers', id); }
  async updateSellerProfile(id: number, data: Partial<SellerProfile>) {
    return this.transaction(async tx => {
      const current = await this.getSellerProfileById(id);
      const profile = await this.update<SellerProfile>('sellers', id, { ...data, updatedAt: now() });
      if (profile && data.status && current?.status !== data.status) {
        if (data.status === 'approved') tx.update(this.ref('users', profile.userId), { role: 'seller' });
        this.event(tx, profile.userId, `seller_${data.status}`);
      }
      return profile;
    });
  }
  listSellerProfiles() { return this.all<SellerProfile>('sellers'); }
  listProductsBySeller(id: number) { return this.by<Product>('products', 'sellerId', id); }

  private event(tx: Transaction, userId: number, kind: string, reference?: string) {
    tx.create(this.collection('notifications').doc(), clean({ userId, kind, reference, createdAt: now() }));
  }
  getCommission() { return this.get<{ bps: number; updatedAt: string; updatedBy: number }>('settings', 'commission'); }
  async setCommission(value: { bps: number; updatedAt: string; updatedBy: number }) { await this.ref('settings', 'commission').set(value); }

  async adminStats(): Promise<AdminStats> {
    const [orders, customers, products, lowStock, sellers] = await Promise.all([
      this.listOrders(), this.collection('users').where('role', '==', 'customer').count().get(),
      this.collection('products').count().get(), this.collection('products').where('stock', '<=', 10).count().get(), this.listSellerProfiles(),
    ]);
    const income = (o: Order) => (o.sellerOrders?.length ? o.sellerOrders.filter(p => p.status === 'delivered').reduce((a, p) => a + p.total, 0) : o.status === 'delivered' ? o.total : 0) / o.exchangeRate;
    const salesByDay = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10);
      const relevant = orders.filter(o => o.createdAt.startsWith(date));
      return { date, orders: relevant.length, revenue: money(relevant.reduce((a, o) => a + income(o), 0)) };
    });
    const totalCommission = money(orders.reduce((sum, o) => sum + (o.sellerOrders ?? []).filter(p => p.status === 'delivered').reduce((a, p) => a + p.commission, 0) / o.exchangeRate, 0));
    return { totalRevenue: money(orders.reduce((a, o) => a + income(o), 0)), totalOrders: orders.length, totalCustomers: customers.data().count,
      totalProducts: products.data().count, pendingOrders: orders.filter(o => o.status === 'pending').length, lowStock: lowStock.data().count,
      totalSellers: sellers.filter(s => s.status === 'approved').length, pendingSellers: sellers.filter(s => ['pending', 'under_review'].includes(s.status)).length,
      totalCommission, salesByDay, recentOrders: orders.slice(0, 5) };
  }
}
