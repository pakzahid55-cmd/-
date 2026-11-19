import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Address,
  AdminStats,
  Banner,
  Brand,
  Category,
  Coupon,
  ExchangeRate,
  Order,
  OrderStatus,
  Paged,
  Product,
  ProductQuery,
  Review,
  SellerProfile,
  User,
} from "./types.js";
import type { Store } from "./store.js";
import {
  seedAddresses,
  seedBanners,
  seedBrands,
  seedCategories,
  seedCoupons,
  seedProducts,
  seedReviews,
  seedSampleOrders,
  seedUsers,
} from "./seed-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

interface DbShape {
  users: User[];
  addresses: Address[];
  categories: Category[];
  brands: Brand[];
  products: Product[];
  reviews: Review[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  exchangeRates: ExchangeRate[];
  sellerProfiles: SellerProfile[];
  counters: Record<string, number>;
}

/**
 * Embedded store used when no DATABASE_URL is configured.
 * Data is persisted to server/data/db.json so restarts keep state.
 * Implements the exact same contract as PgStore.
 */
export class MemoryStore implements Store {
  readonly kind = "memory" as const;
  private db!: DbShape;

  constructor(private hashPassword: (plain: string) => Promise<string>) {}

  async init(): Promise<void> {
    if (fs.existsSync(DATA_FILE)) {
      this.db = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as DbShape;
      this.db.exchangeRates ??= [];
      this.db.sellerProfiles ??= [];
      return;
    }
    this.db = {
      users: [],
      addresses: [],
      categories: [],
      brands: [],
      products: [],
      reviews: [],
      orders: [],
      coupons: [],
      banners: [],
      exchangeRates: [],
      sellerProfiles: [],
      counters: { users: 0, addresses: 0, categories: 0, brands: 0, products: 0, reviews: 0, orders: 100000, coupons: 0, banners: 0, exchange_rates: 0, seller_profiles: 0 },
    };
    await this.seed();
    this.save();
  }

  private save(): void {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(this.db, null, 2));
  }

  private nextId(entity: keyof DbShape["counters"]): number {
    this.db.counters[entity] = (this.db.counters[entity] ?? 0) + 1;
    return this.db.counters[entity];
  }

  private async seed(): Promise<void> {
    for (const c of seedCategories) this.db.categories.push({ ...c, id: this.nextId("categories") });
    for (const b of seedBrands) this.db.brands.push({ ...b, id: this.nextId("brands") });

    const catBySlug = new Map(this.db.categories.map((c) => [c.slug, c]));
    const brandBySlug = new Map(this.db.brands.map((b) => [b.slug, b]));

    for (const p of seedProducts) {
      const { categorySlug, brandSlug, ...rest } = p;
      this.db.products.push({
        ...rest,
        id: this.nextId("products"),
        brandId: brandBySlug.get(brandSlug)?.id ?? 1,
        categoryId: catBySlug.get(categorySlug)?.id ?? 1,
        sellerId: null,
        sku: null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 86400000).toISOString(),
      });
    }

    for (const u of seedUsers) {
      const { password, ...rest } = u;
      this.db.users.push({
        ...rest,
        id: this.nextId("users"),
        passwordHash: await this.hashPassword(password),
        createdAt: new Date().toISOString(),
      });
    }

    for (const a of seedAddresses) {
      const { userEmail, ...rest } = a;
      const user = this.db.users.find((u) => u.email === userEmail);
      if (user) this.db.addresses.push({ ...rest, id: this.nextId("addresses"), userId: user.id });
    }

    for (const r of seedReviews) {
      const { userEmail, productSlug, ...rest } = r;
      const user = this.db.users.find((u) => u.email === userEmail);
      const product = this.db.products.find((p) => p.slug === productSlug);
      if (user && product) {
        this.db.reviews.push({ ...rest, id: this.nextId("reviews"), userId: user.id, productId: product.id, createdAt: new Date().toISOString() });
      }
    }

    for (const c of seedCoupons) this.db.coupons.push({ ...c, id: this.nextId("coupons") });
    for (const b of seedBanners) this.db.banners.push({ ...b, id: this.nextId("banners") });

    const sara = this.db.users.find((u) => u.email === "sara@example.com");
    if (sara) {
      for (const o of seedSampleOrders(sara.name, sara.id)) {
        this.db.orders.push({
          ...o,
          id: this.nextId("orders"),
          createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  // ---------- Users ----------
  async findUserByEmail(email: string): Promise<User | null> {
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }
  async findUserById(id: number): Promise<User | null> {
    return this.db.users.find((u) => u.id === id) ?? null;
  }
  async findUserByFirebaseUid(uid: string): Promise<User | null> {
    return this.db.users.find((u) => u.firebaseUid === uid) ?? null;
  }
  async createUser(data: Omit<User, "id" | "createdAt">): Promise<User> {
    const user: User = { ...data, id: this.nextId("users"), createdAt: new Date().toISOString() };
    this.db.users.push(user);
    this.save();
    return user;
  }
  async updateUser(id: number, data: Partial<Pick<User, "name" | "phone" | "passwordHash" | "firebaseUid" | "photoUrl" | "country" | "emailVerified">>): Promise<User | null> {
    const user = this.db.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, data);
    this.save();
    return user;
  }
  async listUsers(): Promise<User[]> {
    return [...this.db.users];
  }

  // ---------- Addresses ----------
  async listAddresses(userId: number): Promise<Address[]> {
    return this.db.addresses.filter((a) => a.userId === userId);
  }
  async createAddress(data: Omit<Address, "id">): Promise<Address> {
    const address: Address = { ...data, id: this.nextId("addresses") };
    if (address.isDefault) {
      for (const a of this.db.addresses) if (a.userId === address.userId) a.isDefault = false;
    }
    this.db.addresses.push(address);
    this.save();
    return address;
  }
  async updateAddress(id: number, userId: number, data: Partial<Address>): Promise<Address | null> {
    const address = this.db.addresses.find((a) => a.id === id && a.userId === userId);
    if (!address) return null;
    Object.assign(address, data);
    if (address.isDefault) {
      for (const a of this.db.addresses) if (a.userId === userId && a.id !== id) a.isDefault = false;
    }
    this.save();
    return address;
  }
  async deleteAddress(id: number, userId: number): Promise<boolean> {
    const idx = this.db.addresses.findIndex((a) => a.id === id && a.userId === userId);
    if (idx === -1) return false;
    this.db.addresses.splice(idx, 1);
    this.save();
    return true;
  }

  // ---------- Categories ----------
  async listCategories(): Promise<Category[]> {
    return [...this.db.categories].sort((a, b) => a.sort - b.sort);
  }
  async createCategory(data: Omit<Category, "id">): Promise<Category> {
    const category: Category = { ...data, id: this.nextId("categories") };
    this.db.categories.push(category);
    this.save();
    return category;
  }
  async updateCategory(id: number, data: Partial<Category>): Promise<Category | null> {
    const category = this.db.categories.find((c) => c.id === id);
    if (!category) return null;
    Object.assign(category, data);
    this.save();
    return category;
  }
  async deleteCategory(id: number): Promise<boolean> {
    const idx = this.db.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.db.categories.splice(idx, 1);
    this.save();
    return true;
  }

  // ---------- Brands ----------
  async listBrands(): Promise<Brand[]> {
    return [...this.db.brands];
  }
  async createBrand(data: Omit<Brand, "id">): Promise<Brand> {
    const brand: Brand = { ...data, id: this.nextId("brands") };
    this.db.brands.push(brand);
    this.save();
    return brand;
  }
  async updateBrand(id: number, data: Partial<Brand>): Promise<Brand | null> {
    const brand = this.db.brands.find((b) => b.id === id);
    if (!brand) return null;
    Object.assign(brand, data);
    this.save();
    return brand;
  }
  async deleteBrand(id: number): Promise<boolean> {
    const idx = this.db.brands.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.db.brands.splice(idx, 1);
    this.save();
    return true;
  }

  // ---------- Products ----------
  private filterSortProducts(query: ProductQuery): Product[] {
    let items = [...this.db.products];
    if (query.ids) items = items.filter((p) => query.ids!.includes(p.id));
    if (query.featured) items = items.filter((p) => p.isFeatured);
    if (query.isNew) items = items.filter((p) => p.isNew);
    if (query.category) items = items.filter((p) => {
      const cat = this.db.categories.find((c) => c.id === p.categoryId);
      return cat?.slug === query.category;
    });
    if (query.brand) items = items.filter((p) => {
      const brand = this.db.brands.find((b) => b.id === p.brandId);
      return brand?.slug === query.brand;
    });
    if (query.minPrice !== undefined) items = items.filter((p) => (p.discountPrice ?? p.price) >= query.minPrice!);
    if (query.maxPrice !== undefined) items = items.filter((p) => (p.discountPrice ?? p.price) <= query.maxPrice!);
    if (query.q) {
      const q = query.q.toLowerCase();
      items = items.filter((p) => {
        const brand = this.db.brands.find((b) => b.id === p.brandId);
        const cat = this.db.categories.find((c) => c.id === p.categoryId);
        return (
          p.nameEn.toLowerCase().includes(q) ||
          p.nameAr.includes(query.q!) ||
          p.descriptionEn.toLowerCase().includes(q) ||
          p.descriptionAr.includes(query.q!) ||
          brand?.name.toLowerCase().includes(q) ||
          cat?.nameEn.toLowerCase().includes(q) ||
          cat?.nameAr.includes(query.q!)
        );
      });
    }
    const sort = query.sort ?? "newest";
    items.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price);
        case "price-desc":
          return (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price);
        case "popularity":
          return b.salesCount - a.salesCount;
        case "rating":
          return b.rating - a.rating;
        case "discount":
          return (b.price - (b.discountPrice ?? b.price)) / b.price - (a.price - (a.discountPrice ?? a.price)) / a.price;
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return items;
  }

  async listProducts(query: ProductQuery): Promise<Paged<Product>> {
    const items = this.filterSortProducts(query);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(60, Math.max(1, query.limit ?? 12));
    const start = (page - 1) * limit;
    return {
      items: items.slice(start, start + limit),
      total: items.length,
      page,
      pages: Math.max(1, Math.ceil(items.length / limit)),
      limit,
    };
  }
  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.db.products.find((p) => p.slug === slug) ?? null;
  }
  async getProductById(id: number): Promise<Product | null> {
    return this.db.products.find((p) => p.id === id) ?? null;
  }
  async createProduct(data: Omit<Product, "id" | "rating" | "reviewCount" | "salesCount" | "createdAt">): Promise<Product> {
    const product: Product = {
      ...data,
      id: this.nextId("products"),
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.db.products.push(product);
    this.save();
    return product;
  }
  async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    const product = this.db.products.find((p) => p.id === id);
    if (!product) return null;
    Object.assign(product, data);
    this.save();
    return product;
  }
  async deleteProduct(id: number): Promise<boolean> {
    const idx = this.db.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.db.products.splice(idx, 1);
    this.save();
    return true;
  }
  async relatedProducts(product: Product, limit = 4): Promise<Product[]> {
    return this.db.products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, limit);
  }

  // ---------- Reviews ----------
  async listReviews(productId: number): Promise<Review[]> {
    return this.db.reviews
      .filter((r) => r.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async createReview(data: Omit<Review, "id" | "createdAt">): Promise<Review> {
    const review: Review = { ...data, id: this.nextId("reviews"), createdAt: new Date().toISOString() };
    this.db.reviews.push(review);
    const product = this.db.products.find((p) => p.id === data.productId);
    if (product) {
      const reviews = this.db.reviews.filter((r) => r.productId === product.id);
      product.reviewCount = reviews.length;
      product.rating = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
    }
    this.save();
    return review;
  }

  // ---------- Orders ----------
  async createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> {
    const now = new Date().toISOString();
    const order: Order = { ...data, id: this.nextId("orders"), createdAt: now, updatedAt: now };
    this.db.orders.push(order);
    // Decrement stock and boost sales counts (transactional in PgStore).
    for (const item of order.items) {
      const product = this.db.products.find((p) => p.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.salesCount += item.quantity;
      }
    }
    this.save();
    return order;
  }
  async listOrdersForUser(userId: number): Promise<Order[]> {
    return this.db.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async listOrders(status?: OrderStatus): Promise<Order[]> {
    let items = [...this.db.orders];
    if (status) items = items.filter((o) => o.status === status);
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getOrderById(id: number): Promise<Order | null> {
    return this.db.orders.find((o) => o.id === id) ?? null;
  }
  async getOrderByReference(reference: string): Promise<Order | null> {
    return this.db.orders.find((o) => o.reference.toLowerCase() === reference.toLowerCase()) ?? null;
  }
  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order | null> {
    const order = this.db.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === "delivered") order.paymentStatus = order.paymentMethod === "cod" ? "paid" : order.paymentStatus;
    this.save();
    return order;
  }

  // ---------- Coupons ----------
  async listCoupons(): Promise<Coupon[]> {
    return [...this.db.coupons];
  }
  async getCouponByCode(code: string): Promise<Coupon | null> {
    return this.db.coupons.find((c) => c.code.toLowerCase() === code.toLowerCase()) ?? null;
  }
  async createCoupon(data: Omit<Coupon, "id">): Promise<Coupon> {
    const coupon: Coupon = { ...data, id: this.nextId("coupons") };
    this.db.coupons.push(coupon);
    this.save();
    return coupon;
  }
  async updateCoupon(id: number, data: Partial<Coupon>): Promise<Coupon | null> {
    const coupon = this.db.coupons.find((c) => c.id === id);
    if (!coupon) return null;
    Object.assign(coupon, data);
    this.save();
    return coupon;
  }
  async deleteCoupon(id: number): Promise<boolean> {
    const idx = this.db.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.db.coupons.splice(idx, 1);
    this.save();
    return true;
  }

  // ---------- Banners ----------
  async listBanners(activeOnly = true): Promise<Banner[]> {
    const items = activeOnly ? this.db.banners.filter((b) => b.active) : [...this.db.banners];
    return items.sort((a, b) => a.sort - b.sort);
  }
  async createBanner(data: Omit<Banner, "id">): Promise<Banner> {
    const banner: Banner = { ...data, id: this.nextId("banners") };
    this.db.banners.push(banner);
    this.save();
    return banner;
  }
  async updateBanner(id: number, data: Partial<Banner>): Promise<Banner | null> {
    const banner = this.db.banners.find((b) => b.id === id);
    if (!banner) return null;
    Object.assign(banner, data);
    this.save();
    return banner;
  }
  async deleteBanner(id: number): Promise<boolean> {
    const idx = this.db.banners.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.db.banners.splice(idx, 1);
    this.save();
    return true;
  }

  // ---------- Reporting ----------
  async adminStats(): Promise<AdminStats> {
    const days: { date: string; orders: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push({ date: d.toISOString().slice(0, 10), orders: 0, revenue: 0 });
    }
    for (const order of this.db.orders) {
      if (order.status === "cancelled") continue;
      const date = order.createdAt.slice(0, 10);
      const point = days.find((p) => p.date === date);
      if (point) {
        point.orders += 1;
        point.revenue += order.total / (Number(order.exchangeRate) || 1);
      }
    }
    return {
      totalRevenue: this.db.orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total / (Number(o.exchangeRate) || 1), 0),
      totalOrders: this.db.orders.length,
      totalCustomers: this.db.users.filter((u) => u.role === "customer").length,
      totalProducts: this.db.products.length,
      pendingOrders: this.db.orders.filter((o) => o.status === "pending").length,
      lowStock: this.db.products.filter((p) => p.stock <= 10).length,
      salesByDay: days,
      recentOrders: this.db.orders
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    };
  }

  async listExchangeRates(): Promise<ExchangeRate[]> {
    return (this.db.exchangeRates ?? []).slice().sort((a, b) => b.id - a.id);
  }

  async addExchangeRate(rate: Omit<ExchangeRate, "id">): Promise<ExchangeRate> {
    this.db.exchangeRates ??= [];
    const row: ExchangeRate = { ...rate, id: this.nextId("exchange_rates") };
    this.db.exchangeRates.push(row);
    this.save();
    return row;
  }

  // ---------- Seller profiles ----------
  async createSellerProfile(data: Omit<SellerProfile, "id" | "createdAt" | "updatedAt">): Promise<SellerProfile> {
    this.db.sellerProfiles ??= [];
    const row: SellerProfile = { ...data, id: this.nextId("seller_profiles"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.db.sellerProfiles.push(row);
    this.save();
    return row;
  }
  async getSellerProfileByUserId(userId: number): Promise<SellerProfile | null> {
    return (this.db.sellerProfiles ?? []).find((s) => s.userId === userId) ?? null;
  }
  async getSellerProfileById(id: number): Promise<SellerProfile | null> {
    return (this.db.sellerProfiles ?? []).find((s) => s.id === id) ?? null;
  }
  async updateSellerProfile(id: number, data: Partial<SellerProfile>): Promise<SellerProfile | null> {
    const row = (this.db.sellerProfiles ?? []).find((s) => s.id === id);
    if (!row) return null;
    Object.assign(row, data, { updatedAt: new Date().toISOString() });
    this.save();
    return row;
  }
  async listSellerProfiles(): Promise<SellerProfile[]> {
    return (this.db.sellerProfiles ?? []).slice().sort((a, b) => b.id - a.id);
  }
  async listProductsBySeller(sellerId: number): Promise<Product[]> {
    return this.db.products.filter((p) => p.sellerId === sellerId);
  }
}
