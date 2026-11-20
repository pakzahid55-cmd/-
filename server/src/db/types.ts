export type Role = "customer" | "seller" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  phone: string | null;
  firebaseUid?: string | null;
  photoUrl?: string | null;
  country?: string | null;
  emailVerified?: boolean;
  createdAt: string;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface Address {
  id: number;
  userId: number;
  label: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  instructions: string | null;
  isDefault: boolean;
}

export interface Category {
  id: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  image: string;
  sort: number;
}

export interface Brand {
  id: number;
  slug: string;
  name: string;
}

export interface Product {
  id: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  discountPrice: number | null;
  brandId: number;
  categoryId: number;
  stock: number;
  images: string[];
  video?: string | null;
  specs: Record<string, string>;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  salesCount: number;
  /** Owner user id when a seller lists it; null = platform (admin) product. */
  sellerId: number | null;
  sku: string | null;
  createdAt: string;
}

export type SellerStatus = "pending" | "under_review" | "approved" | "rejected" | "suspended";

/**
 * Seller verification record. Passport data is private: masked in lists,
 * full values only for admins reviewing the record and the seller themselves.
 * Approval is a genuine manual admin action — never automated.
 */
export interface SellerProfile {
  descriptionEn?: string;
  descriptionAr?: string;
  logo?: string | null;
  cover?: string | null;
  id: number;
  userId: number;
  shopNameEn: string;
  shopNameAr: string;
  legalName: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
  businessInfo: string | null;
  /** Server path of the uploaded passport document — never publicly served. */
  passportDocument: string | null;
  status: SellerStatus;
  reviewNote: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

/** Supported shop currencies. Prices are entered in EGP (base); SDG uses the manual admin rate. */
export type Currency = "EGP" | "SDG";

/** Manually entered exchange rate (1 EGP = rate SDG). Full history is preserved; never fabricated. */
export interface ExchangeRate {
  id: number;
  base: Currency;
  quote: Currency;
  rate: number;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface OrderItem {
  sellerId?: number | null;
  priceEgp?: number;
  productId: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  image: string;
  price: number;
  quantity: number;
}

export interface OrderCustomer {
  area?: string;
  name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  instructions: string | null;
}

export interface SellerOrder {
  reference: string;
  sellerId: number | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  commission: number;
  commissionBps: number;
  earnings: number;
  status: OrderStatus;
}

export type SellerOrderView = SellerOrder & Pick<Order, "id" | "currency" | "exchangeRate" | "customer" | "paymentMethod" | "createdAt" | "updatedAt">;

export interface Order {
  sellerOrders?: SellerOrder[];
  // Internal hash: ties a client idempotency key to the exact request.
  checkoutHash?: string;

  id: number;
  reference: string;
  userId: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode: string | null;
  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid" | "failed";
  status: OrderStatus;
  /** Currency the customer pays in. Never changed silently after purchase. */
  currency: Currency;
  /** Rate applied at purchase time (1 EGP = exchangeRate SDG; 1 for EGP orders). Preserved forever. */
  exchangeRate: number;
  customer: OrderCustomer;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  active: boolean;
  expiresAt: string | null;
}

export interface Banner {
  id: number;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  image: string;
  video?: string | null;
  link: string;
  active: boolean;
  sort: number;
}

export interface ProductQuery {
  sellerId?: number;
  admin?: boolean;
  inStock?: boolean;
  offers?: boolean;
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "popularity" | "newest" | "rating" | "discount";
  page?: number;
  limit?: number;
  featured?: boolean;
  isNew?: boolean;
  ids?: number[];
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface SalesPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface AdminStats {
  totalCommission?: number;
  totalSellers?: number;
  pendingSellers?: number;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStock: number;
  salesByDay: SalesPoint[];
  recentOrders: Order[];
}
