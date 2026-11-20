import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ImagePicker } from "../components/Media";
import { Spinner } from "../components/ui";
import { useAuth } from "../store/auth";
import { useI18n } from "../i18n/I18nProvider";
import { api, ApiError } from "../lib/api";
import { formatDate, formatMoney } from "../lib/format";
import type { Order, OrderStatus, Product, SellerProfile, Brand, Category } from "../lib/types";

interface Stats {
  totalRevenue: number;
  totalCommission: number;
  totalEarnings: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
}

type Fulfillment = Order & { commission: number; earnings: number };
const NEXT: Partial<Record<OrderStatus, OrderStatus>> = { pending: "processing", processing: "shipped", shipped: "delivered" };

const EMPTY_PRODUCT = {
  slug: "",
  nameEn: "",
  nameAr: "",
  descriptionEn: "",
  descriptionAr: "",
  price: 0,
  discountPrice: null as number | null,
  brandId: 0,
  categoryId: 0,
  stock: 0,
  images: [] as string[],
  video: null as string | null,
  specs: {} as Record<string, string>,
  isFeatured: false,
  isNew: false,
  sku: null as string | null,
};

export function SellerCenterPage() {
  const { t, lang, pick } = useI18n();
  const { user, initialized } = useAuth();
  const [tab, setTab] = useState<"dashboard" | "products" | "orders" | "shop">("dashboard");
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [branding, setBranding] = useState({ logo: null as string | null, cover: null as string | null, descriptionEn: "", descriptionAr: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Fulfillment[]>([]);
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, p, o] = await Promise.all([
        api<Stats>("/seller/stats"),
        api<{ items: Product[] }>("/seller/products"),
        api<{ items: Fulfillment[] }>("/seller/orders"),
      ]);
      setStats(s);
      setProducts(p.items);
      setOrders(o.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.error"));
    }
  }, [t]);

  useEffect(() => {
    if (!user || user.role !== "seller") return;
    void load();
    void Promise.all([api<{ profile: SellerProfile | null }>("/seller/profile"), api<{ items: Category[] }>("/categories", { auth: false }), api<{ items: Brand[] }>("/brands", { auth: false })])
      .then(([seller, c, b]) => {
        setProfile(seller.profile); setCategories(c.items); setBrands(b.items);
        if (seller.profile) setBranding({ logo: seller.profile.logo ?? null, cover: seller.profile.cover ?? null, descriptionEn: seller.profile.descriptionEn ?? "", descriptionAr: seller.profile.descriptionAr ?? "" });
      }).catch(e => setError(e.message));
  }, [load, user]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: k === "price" || k === "discountPrice" || k === "stock" || k === "brandId" || k === "categoryId" ? (v === "" ? null : Number(v)) : v }));
  };

  const openNew = () => {
    setForm({ ...EMPTY_PRODUCT });
    setEditing("new");
    setInfo("");
    setError("");
  };

  const openEdit = (p: Product) => {
    setForm({
      slug: p.slug, nameEn: p.nameEn, nameAr: p.nameAr,
      descriptionEn: p.descriptionEn, descriptionAr: p.descriptionAr,
      price: p.price, discountPrice: p.discountPrice, brandId: p.brandId, categoryId: p.categoryId,
      stock: p.stock, images: p.images, video: p.video ?? null, specs: p.specs ?? {},
      isFeatured: p.isFeatured, isNew: p.isNew, sku: p.sku ?? null,
    });
    setEditing(p.id);
    setInfo("");
    setError("");
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editing === "new") await api("/seller/products", { method: "POST", body });
      else await api(`/seller/products/${editing}`, { method: "PUT", body });
      setInfo(t("seller.productSaved"));
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.error"));
    }
  };

  const removeProduct = async (id: number) => {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    try { await api(`/seller/products/${id}`, { method: "DELETE" }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : t('common.error')); }
  };

  const setOrderStatus = async (id: number, status: OrderStatus) => {
    setError("");
    try { await api(`/seller/orders/${id}/status`, { method: "PUT", body: { status } }); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : t("common.error")); }
  };

  const saveBranding = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setInfo("");
    try {
      const result = await api<{ profile: SellerProfile }>("/seller/shop", { method: "PUT", body: branding });
      setProfile(result.profile); setInfo(t('admin.saved'));
    } catch (e) { setError(e instanceof Error ? e.message : t('common.error')); }
  };
  if (!initialized) return <Spinner />;
  if (!user) return <Navigate replace to="/login?next=/seller" />;
  if (user.role !== 'seller') return <div className="container-kujuk py-12"><p>{pick('Only approved sellers can use Seller Center.', 'لوحة البائع متاحة للبائعين المعتمدين فقط.')}</p><Link className="btn-primary mt-4 px-4 py-2" to="/seller/apply">{t('seller.myApplication')}</Link></div>;

  return (
    <div className="container-kujuk py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("seller.centerTitle")}</h1>
          <p className="mt-1 text-slate-500">{t("seller.centerSubtitle")}</p>
        </div>
        <Link to="/seller/apply" className="text-sm font-semibold text-royal hover:underline">{t("seller.myApplication")}</Link>
      </div>

      <div className="mt-6 flex gap-2 border-b border-line">
        {(["dashboard", "products", "orders", "shop"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${tab === k ? "border-royal text-royal" : "border-transparent text-slate-500 hover:text-ink"}`}
          >
            {k === "shop" ? pick("My store", "متجري") : t(k === "dashboard" ? "admin.dashboard" : k === "products" ? "admin.products" : "admin.orders")}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {info && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{info}</p>}

      {tab === "dashboard" && stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t("admin.totalRevenue"), value: formatMoney(stats.totalRevenue, "EGP", lang) },
            { label: pick("Platform commission", "عمولة المنصة"), value: formatMoney(stats.totalCommission, "EGP", lang) },
            { label: pick("Seller proceeds", "صافي البائع"), value: formatMoney(stats.totalEarnings, "EGP", lang) },
            { label: t("admin.totalOrders"), value: String(stats.totalOrders) },
            { label: t("admin.pendingOrders"), value: String(stats.pendingOrders) },
            { label: t("admin.totalProducts"), value: String(stats.totalProducts) },
          ].map((c) => (
            <div key={c.label} className="card-kujuk p-5">
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-1 text-2xl font-bold text-royal">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "shop" && profile?.status === 'approved' && <form className="card-kujuk mt-6 max-w-3xl space-y-5 p-6" onSubmit={saveBranding}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">{pick(profile.shopNameEn, profile.shopNameAr)}</h2><Link className="text-sm font-bold text-royal underline" to={`/shop/${profile.userId}`}>{pick('View storefront','عرض المتجر')} ↗</Link></div>
        <div><p className="label-kujuk">{pick('Shop logo','شعار المتجر')}</p><ImagePicker images={branding.logo ? [branding.logo] : []} single onChange={imgs => setBranding(v => ({ ...v, logo: imgs[0] ?? null }))} /></div>
        <div><p className="label-kujuk">{pick('Cover image','صورة الغلاف')}</p><ImagePicker images={branding.cover ? [branding.cover] : []} single onChange={imgs => setBranding(v => ({ ...v, cover: imgs[0] ?? null }))} /></div>
        <label className="block"><span className="label-kujuk">{t('admin.descriptionEn')}</span><textarea rows={3} maxLength={1500} dir="ltr" className="input-kujuk" value={branding.descriptionEn} onChange={e => setBranding(v => ({ ...v, descriptionEn: e.target.value }))} /></label>
        <label className="block"><span className="label-kujuk">{t('admin.descriptionAr')}</span><textarea rows={3} maxLength={1500} dir="rtl" className="input-kujuk" value={branding.descriptionAr} onChange={e => setBranding(v => ({ ...v, descriptionAr: e.target.value }))} /></label>
        <button className="btn-primary px-5 py-2.5">{t('common.save')}</button>
      </form>}

      {tab === "products" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("admin.products")}</h2>
            <button type="button" onClick={openNew} className="btn-primary px-5 py-2.5">{t("admin.addProduct")}</button>
          </div>

          {editing !== null && (
            <form onSubmit={saveProduct} className="card-kujuk mt-5 space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-kujuk">{t("admin.nameEn")}</label>
                  <input required value={form.nameEn} onChange={set("nameEn")} className="input-kujuk" dir="ltr" />
                </div>
                <div>
                  <label className="label-kujuk">{t("admin.nameAr")}</label>
                  <input required value={form.nameAr} onChange={set("nameAr")} className="input-kujuk" dir="rtl" />
                </div>
                <div>
                  <label className="label-kujuk">{t("common.slug")}</label>
                  <input required value={form.slug} onChange={set("slug")} className="input-kujuk" dir="ltr" />
                </div>
                <div>
                  <label className="label-kujuk">SKU</label>
                  <input value={form.sku ?? ""} onChange={set("sku")} className="input-kujuk" dir="ltr" />
                </div>
                <div>
                  <label className="label-kujuk">{t("common.price")}</label>
                  <input required type="number" step="0.01" min="0" value={form.price} onChange={set("price")} className="input-kujuk" dir="ltr" />
                </div>
                <div>
                  <label className="label-kujuk">{t("admin.stock")}</label>
                  <input required type="number" min="0" value={form.stock} onChange={set("stock")} className="input-kujuk" dir="ltr" />
                </div>
                <div>
                  <label className="label-kujuk">{t("common.brand")}</label>
                  <select className="input-kujuk" value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: Number(e.target.value) }))}><option value="0">—</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                </div>
                <div>
                  <label className="label-kujuk">{t("common.category")}</label>
                  <select className="input-kujuk" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: Number(e.target.value) }))}><option value="0">—</option>{categories.map(c => <option key={c.id} value={c.id}>{pick(c.nameEn,c.nameAr)}</option>)}</select>
                </div>
              </div>
              <div>
                <label className="label-kujuk">{t("admin.descriptionEn")}</label>
                <textarea rows={2} value={form.descriptionEn} onChange={set("descriptionEn")} className="input-kujuk resize-none" dir="ltr" />
              </div>
              <div>
                <label className="label-kujuk">{t("admin.descriptionAr")}</label>
                <textarea rows={2} value={form.descriptionAr} onChange={set("descriptionAr")} className="input-kujuk resize-none" dir="rtl" />
              </div>
              <div><p className="label-kujuk">{pick('Product images','صور المنتج')}</p><ImagePicker images={form.images} onChange={images => setForm(f => ({ ...f, images }))} /></div>
              {info && <p className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">{info}</p>}
              {error && <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" className="btn-primary px-6 py-2.5">{t("common.save")}</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-secondary px-6 py-2.5">{t("common.cancel")}</button>
              </div>
            </form>
          )}

          <div className="card-kujuk mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-slate-400">
                  <th className="px-5 py-3 text-start">{t("admin.nameEn")}</th>
                  <th className="px-5 py-3 text-start">SKU</th>
                  <th className="px-5 py-3 text-start">{t("common.price")}</th>
                  <th className="px-5 py-3 text-start">{t("admin.stock")}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-line/60">
                    <td className="px-5 py-3 font-medium">{p.nameEn}</td>
                    <td className="px-5 py-3 text-slate-500">{p.sku ?? "—"}</td>
                    <td className="px-5 py-3">{formatMoney(p.discountPrice ?? p.price, "EGP", lang)}</td>
                    <td className="px-5 py-3">{p.stock}</td>
                    <td className="px-5 py-3 text-end">
                      <button type="button" onClick={() => openEdit(p)} className="font-semibold text-royal hover:underline">{t("common.edit")}</button>
                      <button type="button" onClick={() => void removeProduct(p.id)} className="ms-3 font-semibold text-red-500 hover:underline">{t("common.delete")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <p className="px-5 py-8 text-center text-slate-500">{t("admin.noProducts")}</p>}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="card-kujuk mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-slate-400">
                <th className="px-5 py-3 text-start">{t("orders.orderNumber")}</th>
                <th className="px-5 py-3 text-start">{t("orders.date")}</th>
                <th className="px-5 py-3 text-start">{t("admin.customer")}</th>
                <th className="px-5 py-3 text-start">{t("orders.total")}</th>
                <th className="px-5 py-3 text-start">{t("orders.status")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line/60">
                  <td className="px-5 py-3 font-semibold">{o.reference}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(o.createdAt, lang)}</td>
                  <td className="px-5 py-3">{o.customer?.name ?? "—"}<div className="mt-1 text-xs text-slate-500">{o.customer.city} · {o.customer.area} · {o.customer.address}</div><div dir="ltr" className="mt-1 text-xs text-slate-500">{o.customer.phone}</div>{o.customer.instructions && <div className="mt-1 text-xs">{o.customer.instructions}</div>}</td>
                  <td className="px-5 py-3 font-semibold">{formatMoney(o.total, o.currency ?? "EGP", lang)}<p className="mt-1 text-xs font-normal text-slate-500">{pick("Commission", "العمولة")}: {formatMoney(o.commission, o.currency, lang)}</p><p className="text-xs font-normal text-slate-500">{pick("Seller proceeds", "صافي البائع")}: {formatMoney(o.earnings, o.currency, lang)}</p></td>
                  <td className="px-5 py-3 text-slate-500"><span>{t(`orders.statuses.${o.status}`)}</span>{NEXT[o.status] && <button type="button" className="btn-secondary ms-2 px-2 py-1" onClick={() => void setOrderStatus(o.id, NEXT[o.status]!)}>{t(`orders.statuses.${NEXT[o.status]}`)}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="px-5 py-8 text-center text-slate-500">{t("orders.empty")}</p>}
        </div>
      )}
    </div>
  );
}
