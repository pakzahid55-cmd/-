import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import { api, ApiError } from "../lib/api";
import { formatDate, formatMoney } from "../lib/format";
import type { Order, Product } from "../lib/types";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
}

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
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<"dashboard" | "products" | "orders">("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, p, o] = await Promise.all([
        api<Stats>("/seller/stats"),
        api<{ items: Product[] }>("/seller/products"),
        api<{ items: Order[] }>("/seller/orders"),
      ]);
      setStats(s);
      setProducts(p.items);
      setOrders(o.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.error"));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

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
    await api(`/seller/products/${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div className="container-kajok py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("seller.centerTitle")}</h1>
          <p className="mt-1 text-slate-500">{t("seller.centerSubtitle")}</p>
        </div>
        <Link to="/seller/apply" className="text-sm font-semibold text-royal hover:underline">{t("seller.myApplication")}</Link>
      </div>

      <div className="mt-6 flex gap-2 border-b border-line">
        {(["dashboard", "products", "orders"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${tab === k ? "border-royal text-royal" : "border-transparent text-slate-500 hover:text-ink"}`}
          >
            {t(k === "dashboard" ? "admin.dashboard" : k === "products" ? "admin.products" : "admin.orders")}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {info && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{info}</p>}

      {tab === "dashboard" && stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t("admin.totalRevenue"), value: formatMoney(stats.totalRevenue, "EGP", lang) },
            { label: t("admin.totalOrders"), value: String(stats.totalOrders) },
            { label: t("admin.pendingOrders"), value: String(stats.pendingOrders) },
            { label: t("admin.totalProducts"), value: String(stats.totalProducts) },
          ].map((c) => (
            <div key={c.label} className="card-kajok p-5">
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="mt-1 text-2xl font-bold text-royal">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("admin.products")}</h2>
            <button type="button" onClick={openNew} className="btn-primary px-5 py-2.5">{t("admin.addProduct")}</button>
          </div>

          {editing !== null && (
            <form onSubmit={saveProduct} className="card-kajok mt-5 space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-kajok">{t("admin.nameEn")}</label>
                  <input required value={form.nameEn} onChange={set("nameEn")} className="input-kajok" dir="ltr" />
                </div>
                <div>
                  <label className="label-kajok">{t("admin.nameAr")}</label>
                  <input required value={form.nameAr} onChange={set("nameAr")} className="input-kajok" dir="rtl" />
                </div>
                <div>
                  <label className="label-kajok">{t("common.slug")}</label>
                  <input required value={form.slug} onChange={set("slug")} className="input-kajok" dir="ltr" />
                </div>
                <div>
                  <label className="label-kajok">SKU</label>
                  <input value={form.sku ?? ""} onChange={set("sku")} className="input-kajok" dir="ltr" />
                </div>
                <div>
                  <label className="label-kajok">{t("common.price")}</label>
                  <input required type="number" step="0.01" min="0" value={form.price} onChange={set("price")} className="input-kajok" dir="ltr" />
                </div>
                <div>
                  <label className="label-kajok">{t("admin.stock")}</label>
                  <input required type="number" min="0" value={form.stock} onChange={set("stock")} className="input-kajok" dir="ltr" />
                </div>
                <div>
                  <label className="label-kajok">{t("common.brand")}</label>
                  <input type="number" min="0" value={form.brandId} onChange={set("brandId")} className="input-kajok" dir="ltr" />
                </div>
                <div>
                  <label className="label-kajok">{t("common.category")}</label>
                  <input type="number" min="0" value={form.categoryId} onChange={set("categoryId")} className="input-kajok" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="label-kajok">{t("admin.descriptionEn")}</label>
                <textarea rows={2} value={form.descriptionEn} onChange={set("descriptionEn")} className="input-kajok resize-none" dir="ltr" />
              </div>
              <div>
                <label className="label-kajok">{t("admin.descriptionAr")}</label>
                <textarea rows={2} value={form.descriptionAr} onChange={set("descriptionAr")} className="input-kajok resize-none" dir="rtl" />
              </div>
              {info && <p className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">{info}</p>}
              {error && <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}
              <div className="flex gap-3">
                <button type="submit" className="btn-primary px-6 py-2.5">{t("common.save")}</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-secondary px-6 py-2.5">{t("common.cancel")}</button>
              </div>
            </form>
          )}

          <div className="card-kajok mt-5 overflow-x-auto">
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
        <div className="card-kajok mt-6 overflow-x-auto">
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
                  <td className="px-5 py-3">{o.customer?.name ?? "—"}</td>
                  <td className="px-5 py-3 font-semibold">{formatMoney(o.items.reduce((s, i) => s + i.price * i.quantity, 0), o.currency ?? "EGP", lang)}</td>
                  <td className="px-5 py-3 text-slate-500">{o.status}</td>
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
