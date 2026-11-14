import { useEffect, useState } from "react";
import { PageHeader, Spinner } from "../../components/ui";
import { useI18n } from "../../i18n/I18nProvider";
import { api } from "../../lib/api";
import type { Brand, Category, Product } from "../../lib/types";

interface PagedProducts {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

const emptyForm = {
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
  images: "",
  specs: "",
  isFeatured: false,
  isNew: false,
};

export function AdminProductsPage() {
  const { t, pick } = useI18n();
  const [data, setData] = useState<PagedProducts | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = (q = search, p = page) => {
    setLoading(true);
    void api<PagedProducts>(`/admin/products?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${p}&limit=10`)
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    void api<{ items: Category[] }>("/categories", { auth: false }).then((r) => setCategories(r.items));
    void api<{ items: Brand[] }>("/brands", { auth: false }).then((r) => setBrands(r.items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const body = {
      slug: form.slug,
      nameEn: form.nameEn,
      nameAr: form.nameAr,
      descriptionEn: form.descriptionEn,
      descriptionAr: form.descriptionAr,
      price: Number(form.price),
      discountPrice: form.discountPrice === null || (form.discountPrice as unknown) === "" ? null : Number(form.discountPrice),
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
      stock: Number(form.stock),
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      specs: Object.fromEntries(
        form.specs
          .split("\n")
          .map((line) => line.split(":"))
          .filter((p) => p.length >= 2)
          .map((p) => [p[0].trim(), p.slice(1).join(":").trim()]),
      ),
      isFeatured: form.isFeatured,
      isNew: form.isNew,
    };
    try {
      if (editId) await api(`/admin/products/${editId}`, { method: "PUT", body });
      else await api("/admin/products", { method: "POST", body });
      setMsg(t("admin.saved"));
      setForm(null);
      setEditId(null);
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const remove = async (id: number) => {
    if (!confirm(t("admin.confirmDelete"))) return;
    await api(`/admin/products/${id}`, { method: "DELETE" });
    setMsg(t("admin.deleted"));
    load();
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      slug: p.slug,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      descriptionEn: p.descriptionEn,
      descriptionAr: p.descriptionAr,
      price: p.price,
      discountPrice: p.discountPrice,
      brandId: p.brandId,
      categoryId: p.categoryId,
      stock: p.stock,
      images: p.images.join(", "),
      specs: Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join("\n"),
      isFeatured: p.isFeatured,
      isNew: p.isNew,
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title={t("admin.products")} />
        <button
          type="button"
          onClick={() => {
            setForm({ ...emptyForm });
            setEditId(null);
          }}
          className="btn-primary px-5 py-2.5"
        >
          + {t("admin.addProduct")}
        </button>
      </div>

      {msg && <p className="mb-4 rounded-lg bg-surface px-4 py-2.5 text-sm font-medium text-royal">{msg}</p>}

      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("common.search")}
          className="input-kajok max-w-xs"
        />
        <button type="button" onClick={() => { setPage(1); load(search, 1); }} className="btn-secondary px-5">
          {t("common.search")}
        </button>
      </div>

      {form && (
        <form onSubmit={save} className="card-kajok mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-lg font-bold sm:col-span-2">{editId ? t("admin.editProduct") : t("admin.addProduct")}</h2>
          <div>
            <label className="label-kajok">{t("admin.nameEn")}</label>
            <input required value={form.nameEn} onChange={(e) => setForm((f) => f && { ...f, nameEn: e.target.value })} className="input-kajok" />
          </div>
          <div>
            <label className="label-kajok">{t("admin.nameAr")}</label>
            <input required value={form.nameAr} onChange={(e) => setForm((f) => f && { ...f, nameAr: e.target.value })} className="input-kajok" dir="rtl" />
          </div>
          <div>
            <label className="label-kajok">Slug</label>
            <input required value={form.slug} onChange={(e) => setForm((f) => f && { ...f, slug: e.target.value })} className="input-kajok" dir="ltr" />
          </div>
          <div>
            <label className="label-kajok">{t("admin.stock")}</label>
            <input type="number" min="0" required value={form.stock} onChange={(e) => setForm((f) => f && { ...f, stock: Number(e.target.value) })} className="input-kajok" />
          </div>
          <div>
            <label className="label-kajok">{t("admin.priceField")}</label>
            <input type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm((f) => f && { ...f, price: Number(e.target.value) })} className="input-kajok" />
          </div>
          <div>
            <label className="label-kajok">{t("admin.discountPrice")}</label>
            <input type="number" min="0" step="0.01" value={form.discountPrice ?? ""} onChange={(e) => setForm((f) => f && { ...f, discountPrice: e.target.value === "" ? null : Number(e.target.value) })} className="input-kajok" />
          </div>
          <div>
            <label className="label-kajok">{t("common.category")}</label>
            <select value={form.categoryId} onChange={(e) => setForm((f) => f && { ...f, categoryId: Number(e.target.value) })} className="input-kajok">
              <option value={0}>—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{pick(c.nameEn, c.nameAr)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-kajok">{t("common.brand")}</label>
            <select value={form.brandId} onChange={(e) => setForm((f) => f && { ...f, brandId: Number(e.target.value) })} className="input-kajok">
              <option value={0}>—</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label-kajok">{t("admin.descriptionEn")}</label>
            <textarea rows={2} value={form.descriptionEn} onChange={(e) => setForm((f) => f && { ...f, descriptionEn: e.target.value })} className="input-kajok" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-kajok">{t("admin.descriptionAr")}</label>
            <textarea rows={2} dir="rtl" value={form.descriptionAr} onChange={(e) => setForm((f) => f && { ...f, descriptionAr: e.target.value })} className="input-kajok" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-kajok">{t("admin.images")}</label>
            <input value={form.images} onChange={(e) => setForm((f) => f && { ...f, images: e.target.value })} className="input-kajok" dir="ltr" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-kajok">{t("product.specifications")} (Key: Value)</label>
            <textarea rows={3} value={form.specs} onChange={(e) => setForm((f) => f && { ...f, specs: e.target.value })} className="input-kajok" dir="ltr" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => f && { ...f, isFeatured: e.target.checked })} />
            {t("admin.featured")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isNew} onChange={(e) => setForm((f) => f && { ...f, isNew: e.target.checked })} />
            {t("admin.newBadge")}
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="btn-primary px-6 py-2.5">{t("common.save")}</button>
            <button type="button" onClick={() => { setForm(null); setEditId(null); }} className="btn-secondary px-6 py-2.5">
              {t("common.cancel")}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <div className="card-kajok overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-xs uppercase text-slate-400">
                <th className="px-5 py-3 text-start">{t("admin.nameEn")}</th>
                <th className="px-5 py-3 text-start">{t("admin.priceField")}</th>
                <th className="px-5 py-3 text-start">{t("admin.stock")}</th>
                <th className="px-5 py-3 text-start">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((p) => (
                <tr key={p.id} className="border-b border-line/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="h-10 w-10 rounded-md object-cover" />
                      <div>
                        <p className="font-semibold">{p.nameEn}</p>
                        <p className="text-xs text-slate-400">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold">${(p.discountPrice ?? p.price).toFixed(2)}</p>
                    {p.discountPrice !== null && <p className="text-xs text-slate-400 line-through">${p.price.toFixed(2)}</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge-kajok ${p.stock <= 10 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => openEdit(p)} className="font-semibold text-royal hover:underline">{t("common.edit")}</button>
                      <button type="button" onClick={() => remove(p.id)} className="font-semibold text-red-600 hover:underline">{t("common.delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && data.pages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`btn h-8 w-8 rounded-lg ${p === page ? "bg-royal text-white" : "border border-line"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
