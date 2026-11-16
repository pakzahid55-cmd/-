/**
 * KAJOK Static Demo API — used ONLY when building with VITE_DEMO_MODE=1
 * (e.g. the public GitHub Pages demo). The full platform runs against the
 * real Express + PostgreSQL/embedded API; this module mirrors that API's
 * contract in the browser so the UI is fully explorable without a server.
 *
 * ⚠️ Demo scope: accounts, orders and admin changes live ONLY in this browser
 * (localStorage). No real payments are simulated — COD only, like production.
 */
import raw from "./demo-data.json";
import type { Address, Banner, Brand, Category, Coupon, Order, OrderItem, Product, PublicUser, Review } from "./types";

const BASE = import.meta.env.BASE_URL || "/";
export function asset(p: string): string {
  if (!p) return p;
  return p.startsWith("/") ? BASE + p.slice(1) : p;
}

interface DemoProduct extends Omit<Product, "images"> {
  images: string[];
}
interface DemoUser extends PublicUser {
  password?: string;
}

const data = raw as unknown as {
  categories: Category[];
  brands: Brand[];
  products: DemoProduct[];
  coupons: Coupon[];
  banners: Banner[];
};

// Rewrite image paths for the deployed base URL.
data.products = data.products.map((p) => ({ ...p, images: p.images.map(asset) }));
data.categories = data.categories.map((c) => ({ ...c, image: asset(c.image) }));
data.banners = data.banners.map((b) => ({ ...b, image: asset(b.image) }));

interface DemoState {
  users: (DemoUser & { password: string })[];
  addresses: Address[];
  orders: Order[];
  reviews: Review[];
  products: DemoProduct[];
  categories: Category[];
  brands: Brand[];
  coupons: Coupon[];
  banners: Banner[];
  counters: Record<string, number>;
}

const STORAGE_KEY = "kajok.demo.v1";

function initialState(): DemoState {
  return {
    users: [
      { id: 1, name: "KAJOK Admin", email: "admin@kajok.com", password: "Admin123!", role: "admin", phone: "+201000000001", createdAt: new Date().toISOString() },
      { id: 2, name: "Sara Hassan", email: "sara@example.com", password: "Customer123!", role: "customer", phone: "+201000000002", createdAt: new Date().toISOString() },
    ],
    addresses: [
      { id: 1, userId: 2, label: "Home", fullName: "Sara Hassan", phone: "+201000000002", country: "Egypt", city: "Alexandria", address: "12 Corniche Road, Smouha", instructions: "Ring the bell twice, apartment 4B", isDefault: true },
    ],
    orders: [
      {
        id: 1, reference: "KJ-100001", userId: 2,
        items: [
          { productId: 1, slug: "aurora-anc-wireless-headphones", nameEn: "Aurora ANC Wireless Headphones", nameAr: "سماعات أورورا اللاسلكية بعزل الضوضاء", image: asset("/images/products/headphones.jpg"), price: 249.99, quantity: 1 },
          { productId: 12, slug: "heritage-organic-coffee-beans", nameEn: "Heritage Organic Coffee Beans 1kg", nameAr: "قهوة هيريتيج العضوية 1 كجم", image: asset("/images/categories/groceries.jpg"), price: 24.99, quantity: 2 },
        ],
        subtotal: 299.97, discount: 0, shipping: 0, total: 299.97,
        couponCode: null, paymentMethod: "cod", paymentStatus: "pending", status: "delivered",
        customer: { name: "Sara Hassan", phone: "+201000000002", country: "Egypt", city: "Alexandria", address: "12 Corniche Road, Smouha", instructions: null },
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), updatedAt: new Date().toISOString(),
      },
    ],
    reviews: [],
    products: data.products.map((p) => ({ ...p })),
    categories: data.categories.map((c) => ({ ...c })),
    brands: data.brands.map((b) => ({ ...b })),
    coupons: data.coupons.map((c) => ({ ...c })),
    banners: data.banners.map((b) => ({ ...b })),
    counters: { users: 2, addresses: 1, orders: 1, reviews: 0 },
  };
}

let state: DemoState;
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  state = saved ? (JSON.parse(saved) as DemoState) : initialState();
  // Refresh catalog copies from the bundle when versions drift (new deploys).
  if (!state.products?.length) state = initialState();
} catch {
  state = initialState();
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full — demo continues in memory */
  }
}

function nextId(key: string): number {
  state.counters[key] = (state.counters[key] ?? 0) + 1;
  return state.counters[key];
}

function currentUser(token: string | null): (DemoUser & { password?: string }) | null {
  if (!token || !token.startsWith("demo.")) return null;
  try {
    const email = atob(token.slice(5));
    return state.users.find((u) => u.email === email) ?? null;
  } catch {
    return null;
  }
}

function priceOf(p: { price: number; discountPrice: number | null }): number {
  return p.discountPrice ?? p.price;
}

function filterSort(q: Record<string, string | undefined>): DemoProduct[] {
  let items = [...state.products];
  if (q.featured === "true") items = items.filter((p) => p.isFeatured);
  if (q.new === "true") items = items.filter((p) => p.isNew);
  if (q.category) items = items.filter((p) => state.categories.find((c) => c.id === p.categoryId)?.slug === q.category);
  if (q.brand) items = items.filter((p) => state.brands.find((b) => b.id === p.brandId)?.slug === q.brand);
  if (q.minPrice) items = items.filter((p) => priceOf(p) >= Number(q.minPrice));
  if (q.maxPrice) items = items.filter((p) => priceOf(p) <= Number(q.maxPrice));
  if (q.q) {
    const s = q.q.toLowerCase();
    items = items.filter((p) => {
      const brand = state.brands.find((b) => b.id === p.brandId)?.name.toLowerCase() ?? "";
      const cat = state.categories.find((c) => c.id === p.categoryId);
      return (
        p.nameEn.toLowerCase().includes(s) || p.nameAr.includes(q.q!) ||
        p.descriptionEn.toLowerCase().includes(s) || p.descriptionAr.includes(q.q!) ||
        brand.includes(s) || cat?.nameEn.toLowerCase().includes(s) || cat?.nameAr.includes(q.q!)
      );
    });
  }
  const sort = q.sort ?? "newest";
  items.sort((a, b) => {
    switch (sort) {
      case "price-asc": return priceOf(a) - priceOf(b);
      case "price-desc": return priceOf(b) - priceOf(a);
      case "popularity": return b.salesCount - a.salesCount;
      case "rating": return b.rating - a.rating;
      case "discount": return (b.price - priceOf(b)) / b.price - (a.price - priceOf(a)) / a.price;
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  return items;
}

class DemoError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function demoApi<T>(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const method = options.method ?? "GET";
  const body = (options.body ?? {}) as Record<string, any>;
  const token = options.auth === false ? null : localStorage.getItem("kajok.token");
  const user = currentUser(token);
  const [cleanPath, queryStr] = path.split("?");
  const q = Object.fromEntries(new URLSearchParams(queryStr ?? "")) as Record<string, string | undefined>;

  // ---------- auth ----------
  if (cleanPath === "/auth/login" && method === "POST") {
    if (body?.demoAs) {
      const role = body.demoAs === "admin" ? "admin" : "customer";
      const du = state.users.find((x) => x.role === role);
      if (!du) throw new DemoError(404, "Demo user missing");
      return { token: `demo.${btoa(du.email)}`, user: stripPw(du) } as T;
    }
    const u = state.users.find((x) => x.email === body?.email?.toLowerCase() && x.password === body?.password);
    if (!u) throw new DemoError(401, "Invalid email or password");
    return { token: `demo.${btoa(u.email)}`, user: stripPw(u) } as T;
  }
  if (cleanPath === "/auth/register" && method === "POST") {
    if (state.users.some((x) => x.email === body?.email?.toLowerCase())) throw new DemoError(409, "An account with this email already exists");
    const u = { id: nextId("users"), name: body.name, email: body.email.toLowerCase(), password: body.password, role: "customer" as const, phone: body.phone ?? null, createdAt: new Date().toISOString() };
    state.users.push(u);
    save();
    return { token: `demo.${btoa(u.email)}`, user: stripPw(u) } as T;
  }
  if (cleanPath === "/auth/me") {
    if (!user) throw new DemoError(401, "Authentication required");
    return { user: stripPw(user) } as T;
  }
  if (cleanPath === "/auth/profile" && method === "PUT") {
    if (!user) throw new DemoError(401, "Authentication required");
    if (body?.name) user.name = body.name;
    if ("phone" in (body ?? {})) user.phone = body.phone ?? null;
    save();
    return { user: stripPw(user) } as T;
  }
  if (cleanPath === "/auth/password" && method === "PUT") {
    if (!user) throw new DemoError(401, "Authentication required");
    if (user.password !== body?.currentPassword) throw new DemoError(400, "Current password is incorrect");
    user.password = body.newPassword;
    save();
    return { ok: true } as T;
  }
  if (cleanPath === "/auth/addresses") {
    if (!user) throw new DemoError(401, "Authentication required");
    if (method === "GET") return { items: state.addresses.filter((a) => a.userId === user.id) } as T;
    if (method === "POST") {
      const a: Address = { id: nextId("addresses"), userId: user.id, label: body?.label ?? "Home", fullName: body.fullName, phone: body.phone, country: body.country, city: body.city, address: body.address, instructions: body.instructions ?? null, isDefault: !!body.isDefault };
      if (a.isDefault) state.addresses.forEach((x) => { if (x.userId === user.id) x.isDefault = false; });
      state.addresses.push(a);
      save();
      return { address: a } as T;
    }
  }
  const addrMatch = cleanPath.match(/^\/auth\/addresses\/(\d+)$/);
  if (addrMatch) {
    if (!user) throw new DemoError(401, "Authentication required");
    const id = Number(addrMatch[1]);
    const a = state.addresses.find((x) => x.id === id && x.userId === user.id);
    if (!a) throw new DemoError(404, "Address not found");
    if (method === "PUT") {
      Object.assign(a, body);
      if (a.isDefault) state.addresses.forEach((x) => { if (x.userId === user.id && x.id !== id) x.isDefault = false; });
      save();
      return { address: a } as T;
    }
    if (method === "DELETE") {
      state.addresses = state.addresses.filter((x) => x.id !== id);
      save();
      return { ok: true } as T;
    }
  }

  // ---------- catalog ----------
  if (cleanPath === "/categories") return { items: state.categories } as T;
  if (cleanPath === "/brands") return { items: state.brands } as T;
  if (cleanPath === "/banners") return { items: state.banners.filter((b) => b.active) } as T;

  if (cleanPath === "/products/suggest") {
    const s = (q.q ?? "").toLowerCase();
    if (s.length < 2) return { products: [], categories: [], brands: [] } as T;
    return {
      products: filterSort({ q: s, sort: "popularity" }).slice(0, 6).map((p) => ({ id: p.id, slug: p.slug, nameEn: p.nameEn, nameAr: p.nameAr, image: p.images[0] ?? "", price: p.price, discountPrice: p.discountPrice })),
      categories: state.categories.filter((c) => c.nameEn.toLowerCase().includes(s) || c.nameAr.includes(q.q!)).slice(0, 3),
      brands: state.brands.filter((b) => b.name.toLowerCase().includes(s)).slice(0, 3),
    } as T;
  }

  if (cleanPath === "/products") {
    const items = filterSort(q);
    const page = Math.max(1, Number(q.page ?? 1));
    const limit = Math.min(60, Math.max(1, Number(q.limit ?? 12)));
    return { items: items.slice((page - 1) * limit, page * limit), total: items.length, page, pages: Math.max(1, Math.ceil(items.length / limit)), limit } as T;
  }

  const reviewMatch = cleanPath.match(/^\/products\/(\d+)\/reviews$/);
  if (reviewMatch && method === "POST") {
    if (!user) throw new DemoError(401, "Authentication required");
    const productId = Number(reviewMatch[1]);
    const review: Review = { id: nextId("reviews"), productId, userId: user.id, userName: user.name, rating: body.rating, comment: body.comment, createdAt: new Date().toISOString() };
    state.reviews.push(review);
    const p = state.products.find((x) => x.id === productId);
    if (p) {
      const rs = state.reviews.filter((r) => r.productId === productId);
      p.reviewCount = rs.length;
      p.rating = Math.round((rs.reduce((s, r) => s + r.rating, 0) / rs.length) * 10) / 10;
    }
    save();
    return { review } as T;
  }

  const productMatch = cleanPath.match(/^\/products\/([^/]+)$/);
  if (productMatch) {
    const p = state.products.find((x) => x.slug === productMatch[1]);
    if (!p) throw new DemoError(404, "Product not found");
    return {
      product: p,
      reviews: state.reviews.filter((r) => r.productId === p.id),
      related: state.products.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).slice(0, 4),
    } as T;
  }

  // ---------- coupons ----------
  if (cleanPath === "/coupons/validate" && method === "POST") {
    const c = state.coupons.find((x) => x.code.toLowerCase() === body?.code?.toLowerCase());
    if (!c || !c.active) throw new DemoError(400, "Invalid coupon code");
    if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()) throw new DemoError(400, "This coupon has expired");
    if (body.subtotal < c.minOrder) throw new DemoError(400, `This coupon requires a minimum order of $${c.minOrder.toFixed(2)}`);
    const discount = c.type === "percent" ? Math.round(body.subtotal * c.value) / 100 : c.value;
    return { coupon: { code: c.code, type: c.type, value: c.value }, discount: Math.min(discount, body.subtotal) } as T;
  }

  // ---------- orders ----------
  if (cleanPath === "/orders" && method === "POST") {
    if (!user) throw new DemoError(401, "Authentication required");
    if (body?.paymentMethod === "online") throw new DemoError(400, "Online payment is not yet activated. Please choose Cash on Delivery.");
    const items: OrderItem[] = [];
    let subtotal = 0;
    for (const it of body.items as { productId: number; quantity: number }[]) {
      const p = state.products.find((x) => x.id === it.productId);
      if (!p) throw new DemoError(400, `Product #${it.productId} not found`);
      if (p.stock < it.quantity) throw new DemoError(400, `Only ${p.stock} left in stock for "${p.nameEn}"`);
      const price = priceOf(p);
      subtotal += price * it.quantity;
      items.push({ productId: p.id, slug: p.slug, nameEn: p.nameEn, nameAr: p.nameAr, image: p.images[0] ?? "", price, quantity: it.quantity });
      p.stock -= it.quantity;
      p.salesCount += it.quantity;
    }
    let discount = 0;
    let couponCode: string | null = null;
    if (body.couponCode) {
      const c = state.coupons.find((x) => x.code.toLowerCase() === body.couponCode.toLowerCase());
      if (!c || !c.active || subtotal < c.minOrder) throw new DemoError(400, "The coupon code is invalid or does not apply to this order");
      discount = Math.min(c.type === "percent" ? Math.round(subtotal * c.value) / 100 : c.value, subtotal);
      couponCode = c.code;
    }
    const shipping = subtotal - discount >= 150 ? 0 : 5.99;
    const order: Order = {
      id: nextId("orders"),
      reference: `KJ-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: user.id,
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      shipping,
      total: Math.round((subtotal - discount + shipping) * 100) / 100,
      couponCode,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "pending",
      customer: { ...body.customer, instructions: body.customer.instructions ?? null },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.orders.push(order);
    save();
    return { order } as T;
  }
  if (cleanPath === "/orders") {
    if (!user) throw new DemoError(401, "Authentication required");
    return { items: state.orders.filter((o) => o.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) } as T;
  }
  const trackMatch = cleanPath.match(/^\/orders\/track\/([^/]+)$/);
  if (trackMatch) {
    const o = state.orders.find((x) => x.reference.toLowerCase() === trackMatch[1].toLowerCase());
    if (!o) throw new DemoError(404, "No order found with this reference");
    return {
      order: {
        reference: o.reference, status: o.status,
        items: o.items.map((i) => ({ nameEn: i.nameEn, nameAr: i.nameAr, image: i.image, quantity: i.quantity })),
        total: o.total, createdAt: o.createdAt, updatedAt: o.updatedAt, city: o.customer.city, country: o.customer.country,
      },
    } as T;
  }
  const orderMatch = cleanPath.match(/^\/orders\/(\d+)$/);
  if (orderMatch) {
    const o = state.orders.find((x) => x.id === Number(orderMatch[1]));
    if (!o) throw new DemoError(404, "Order not found");
    return { order: o } as T;
  }

  // ---------- admin ----------
  if (cleanPath.startsWith("/admin/")) {
    if (!user || user.role !== "admin") throw new DemoError(user ? 403 : 401, user ? "Insufficient permissions" : "Authentication required");

    if (cleanPath === "/admin/stats") {
      const days: { date: string; orders: number; revenue: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        days.push({ date: d.toISOString().slice(0, 10), orders: 0, revenue: 0 });
      }
      for (const o of state.orders) {
        if (o.status === "cancelled") continue;
        const point = days.find((p) => p.date === o.createdAt.slice(0, 10));
        if (point) { point.orders += 1; point.revenue += o.total; }
      }
      return {
        totalRevenue: state.orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0),
        totalOrders: state.orders.length,
        totalCustomers: state.users.filter((u) => u.role === "customer").length,
        totalProducts: state.products.length,
        pendingOrders: state.orders.filter((o) => o.status === "pending").length,
        lowStock: state.products.filter((p) => p.stock <= 10).length,
        salesByDay: days,
        recentOrders: [...state.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
      } as T;
    }
    if (cleanPath === "/admin/customers") {
      return { items: state.users.map((u) => ({ ...stripPw(u), orderCount: state.orders.filter((o) => o.userId === u.id).length })) } as T;
    }
    if (cleanPath === "/admin/orders") {
      let items = [...state.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (q.status) items = items.filter((o) => o.status === q.status);
      return { items } as T;
    }
    const statusMatch = cleanPath.match(/^\/admin\/orders\/(\d+)\/status$/);
    if (statusMatch && method === "PUT") {
      const o = state.orders.find((x) => x.id === Number(statusMatch[1]));
      if (!o) throw new DemoError(404, "Order not found");
      o.status = body.status;
      o.updatedAt = new Date().toISOString();
      if (o.status === "delivered" && o.paymentMethod === "cod") o.paymentStatus = "paid";
      save();
      return { order: o } as T;
    }

    // Generic CRUD for products/categories/brands/coupons/banners
    const resource: Record<string, { list: () => unknown[]; create: (b: any) => unknown; update: (id: number, b: any) => unknown; remove: (id: number) => boolean }> = {
      products: {
        list: () => state.products,
        create: (b) => {
          const p = { ...b, id: nextId("products") as number, rating: 0, reviewCount: 0, salesCount: 0, createdAt: new Date().toISOString() } as DemoProduct;
          state.products.push(p);
          return p;
        },
        update: (id, b) => {
          const p = state.products.find((x) => x.id === id);
          if (!p) return null;
          Object.assign(p, b);
          return p;
        },
        remove: (id) => {
          const n = state.products.length;
          state.products = state.products.filter((x) => x.id !== id);
          return state.products.length < n;
        },
      },
      categories: {
        list: () => state.categories,
        create: (b) => { const c = { ...b, id: nextId("categories") as number } as Category; state.categories.push(c); return c; },
        update: (id, b) => { const c = state.categories.find((x) => x.id === id); if (!c) return null; Object.assign(c, b); return c; },
        remove: (id) => { const n = state.categories.length; state.categories = state.categories.filter((x) => x.id !== id); return state.categories.length < n; },
      },
      brands: {
        list: () => state.brands,
        create: (b) => { const x = { ...b, id: nextId("brands") as number } as Brand; state.brands.push(x); return x; },
        update: (id, b) => { const x = state.brands.find((y) => y.id === id); if (!x) return null; Object.assign(x, b); return x; },
        remove: (id) => { const n = state.brands.length; state.brands = state.brands.filter((y) => y.id !== id); return state.brands.length < n; },
      },
      coupons: {
        list: () => state.coupons,
        create: (b) => { const x = { ...b, id: nextId("coupons") as number } as Coupon; state.coupons.push(x); return x; },
        update: (id, b) => { const x = state.coupons.find((y) => y.id === id); if (!x) return null; Object.assign(x, b); return x; },
        remove: (id) => { const n = state.coupons.length; state.coupons = state.coupons.filter((y) => y.id !== id); return state.coupons.length < n; },
      },
      banners: {
        list: () => state.banners,
        create: (b) => { const x = { ...b, id: nextId("banners") as number } as Banner; state.banners.push(x); return x; },
        update: (id, b) => { const x = state.banners.find((y) => y.id === id); if (!x) return null; Object.assign(x, b); return x; },
        remove: (id) => { const n = state.banners.length; state.banners = state.banners.filter((y) => y.id !== id); return state.banners.length < n; },
      },
    };

    const resMatch = cleanPath.match(/^\/admin\/(products|categories|brands|coupons|banners)(?:\/(\d+))?$/);
    if (resMatch) {
      const handler = resource[resMatch[1]];
      const id = resMatch[2] ? Number(resMatch[2]) : null;
      if (id === null) {
        if (method === "GET") {
          let items = handler.list() as any[];
          if (resMatch[1] === "products" && q.q) {
            const s = q.q.toLowerCase();
            items = items.filter((p: any) => p.nameEn.toLowerCase().includes(s));
          }
          return { items } as T;
        }
        if (method === "POST") {
          const created = handler.create(body);
          const key = resMatch[1] === "products" ? "product" : resMatch[1].replace(/s$/, "");
          save();
          return { [key]: created } as unknown as T;
        }
      } else {
        if (method === "PUT") {
          const updated = handler.update(id, body);
          if (!updated) throw new DemoError(404, "Not found");
          save();
          const key = resMatch[1] === "products" ? "product" : resMatch[1].replace(/s$/, "");
          return { [key]: updated } as unknown as T;
        }
        if (method === "DELETE") {
          if (!handler.remove(id)) throw new DemoError(404, "Not found");
          save();
          return { ok: true } as T;
        }
      }
    }
  }

  throw new DemoError(404, `Demo endpoint not implemented: ${method} ${cleanPath}`);
}

function stripPw(u: { password?: string; [k: string]: any }): PublicUser {
  const { password: _pw, ...rest } = u;
  return rest as PublicUser;
}
