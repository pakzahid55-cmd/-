import type {
  Address,
  AdminStats,
  Banner,
  Brand,
  Category,
  Coupon,
  Order,
  OrderStatus,
  Paged,
  Product,
  ProductQuery,
  Review,
  User,
} from "./types.js";

/**
 * Storage contract for the KAJOK platform.
 *
 * Two adapters implement this interface:
 *  - PgStore      → PostgreSQL (canonical production store, see schema.sql)
 *  - MemoryStore  → embedded store for local development / sandboxes
 *
 * Both are API-compatible so the REST layer never changes between them.
 */
export interface Store {
  readonly kind: "postgres" | "memory";

  // Users
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: number): Promise<User | null>;
  findUserByFirebaseUid(uid: string): Promise<User | null>;
  createUser(data: Omit<User, "id" | "createdAt">): Promise<User>;
  updateUser(id: number, data: Partial<Pick<User, "name" | "phone" | "passwordHash" | "firebaseUid" | "photoUrl" | "country" | "emailVerified">>): Promise<User | null>;
  listUsers(): Promise<User[]>;

  // Addresses
  listAddresses(userId: number): Promise<Address[]>;
  createAddress(data: Omit<Address, "id">): Promise<Address>;
  updateAddress(id: number, userId: number, data: Partial<Address>): Promise<Address | null>;
  deleteAddress(id: number, userId: number): Promise<boolean>;

  // Catalog
  listCategories(): Promise<Category[]>;
  createCategory(data: Omit<Category, "id">): Promise<Category>;
  updateCategory(id: number, data: Partial<Category>): Promise<Category | null>;
  deleteCategory(id: number): Promise<boolean>;

  listBrands(): Promise<Brand[]>;
  createBrand(data: Omit<Brand, "id">): Promise<Brand>;
  updateBrand(id: number, data: Partial<Brand>): Promise<Brand | null>;
  deleteBrand(id: number): Promise<boolean>;

  listProducts(query: ProductQuery): Promise<Paged<Product>>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: number): Promise<Product | null>;
  createProduct(data: Omit<Product, "id" | "rating" | "reviewCount" | "salesCount" | "createdAt">): Promise<Product>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: number): Promise<boolean>;
  relatedProducts(product: Product, limit?: number): Promise<Product[]>;

  // Reviews
  listReviews(productId: number): Promise<Review[]>;
  createReview(data: Omit<Review, "id" | "createdAt">): Promise<Review>;

  // Orders
  createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order>;
  listOrdersForUser(userId: number): Promise<Order[]>;
  listOrders(status?: OrderStatus): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | null>;
  getOrderByReference(reference: string): Promise<Order | null>;
  updateOrderStatus(id: number, status: OrderStatus): Promise<Order | null>;

  // Coupons
  listCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | null>;
  createCoupon(data: Omit<Coupon, "id">): Promise<Coupon>;
  updateCoupon(id: number, data: Partial<Coupon>): Promise<Coupon | null>;
  deleteCoupon(id: number): Promise<boolean>;

  // Banners
  listBanners(activeOnly?: boolean): Promise<Banner[]>;
  createBanner(data: Omit<Banner, "id">): Promise<Banner>;
  updateBanner(id: number, data: Partial<Banner>): Promise<Banner | null>;
  deleteBanner(id: number): Promise<boolean>;

  // Reporting
  adminStats(): Promise<AdminStats>;
}
