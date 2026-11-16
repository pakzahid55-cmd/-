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

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  image: string;
  price: number;
  quantity: number;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  instructions: string | null;
}

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
  paymentStatus: "pending" | "paid" | "failed";
  status: OrderStatus;
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
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStock: number;
  salesByDay: SalesPoint[];
  recentOrders: Order[];
}
