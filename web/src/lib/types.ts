export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone: string | null;
  createdAt: string;
}

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
  createdAt: string;
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

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface OrderItem {
  productId: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  image: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

/** Supported shop currencies. Catalog prices are EGP-based; orders snapshot their currency + rate. */
export type Currency = "EGP" | "SDG";

export interface Order {
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
  paymentStatus: string;
  status: OrderStatus;
  /** Currency the customer pays in — preserved forever, never changed silently. */
  currency: Currency;
  /** Rate applied at purchase (1 EGP = exchangeRate SDG; 1 for EGP orders). */
  exchangeRate: number;
  customer: {
    name: string;
    phone: string;
    country: string;
    city: string;
    address: string;
    instructions: string | null;
  };
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

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStock: number;
  salesByDay: { date: string; orders: number; revenue: number }[];
  recentOrders: Order[];
}
