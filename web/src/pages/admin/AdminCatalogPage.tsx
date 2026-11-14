import { useEffect, useState } from "react";
import { PageHeader } from "../../components/ui";
import { useI18n } from "../../i18n/I18nProvider";
import { api } from "../../lib/api";
import type { Brand, Category } from "../../lib/types";

export function AdminCatalogPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [catForm, setCatForm] = useState({ slug: "", nameEn: "", nameAr: "", image: "", sort: 0 });
  const [catEdit, setCatEdit] = useState<number | null>(null);
  const [brandForm, setBrandForm] = useState({ slug: "", name: "" });
  const [brandEdit, setBrandEdit] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const load = () => {
    void api<{ items: Category[] }>("/admin/categories").then((r) => setCategories(r.items));
    void api<{ items: Brand[] }>("/admin/brands").then((r) => setBrands(r.items));
  };
  useEffect(load, []);

  const saveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (catEdit) await api(`/admin/categories/${catEdit}`, { method: "PUT", body: catForm });
      else await api("/admin/categories", { method: "POST", body: catForm });
      setCatForm({ slug: "", nameEn: "", nameAr: "", image: "", sort: 0 });
      setCatEdit(null);
      setMsg(t("admin.saved"));
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const saveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (brandEdit) await api(`/admin/brands/${brandEdit}`, { method: "PUT", body: brandForm });
      else await api("/admin/brands", { method: "POST", body: brandForm });
      setBrandForm({ slug: "", name: "" });
      setBrandEdit(null);
      setMsg(t("admin.saved"));
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("common.error"));
    }
  };

  return (
    <div>
      <PageHeader title={`${t("admin.categories")} / ${t("admin.brands")}`} />
      {msg && <p className="mb-4 rounded-lg bg-surface px-4 py-2.5 text-sm font-medium text-royal">{msg}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Categories */}
        <section className="card-kajok p-6">
          <h2 className="text-lg font-bold">{t("admin.categories")}</h2>
          <form onSubmit={saveCat} className="mt-4 space-y-3">
            <input placeholder={t("admin.nameEn")} required value={catForm.nameEn} onChange={(e) => setCatForm((f) => ({ ...f, nameEn: e.target.value }))} className="input-kajok" />
            <input placeholder={t("admin.nameAr")} required dir="rtl" value={catForm.nameAr} onChange={(e) => setCatForm((f) => ({ ...f, nameAr: e.target.value }))} className="input-kajok" />
            <input placeholder="Slug" required dir="ltr" value={catForm.slug} onChange={(e) => setCatForm((f) => ({ ...f, slug: e.target.value }))} className="input-kajok" />
            <input placeholder={t("admin.imageField")} dir="ltr" value={catForm.image} onChange={(e) => setCatForm((f) => ({ ...f, image: e.target.value }))} className="input-kajok" />
            <div className="flex items-center gap-3">
              <input type="number" placeholder={t("admin.sort")} value={catForm.sort} onChange={(e) => setCatForm((f) => ({ ...f, sort: Number(e.target.value) }))} className="input-kajok w-24" />
              <button type="submit" className="btn-primary px-5 py-2.5">{catEdit ? t("common.save") : t("common.add")}</button>
              {catEdit && (
                <button type="button" onClick={() => { setCatEdit(null); setCatForm({ slug: "", nameEn: "", nameAr: "", image: "", sort: 0 }); }} className="btn-secondary px-5 py-2.5">
                  {t("common.cancel")}
                </button>
              )}
            </div>
          </form>
          <ul className="mt-5 space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg border border-line px-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold">{c.nameEn} / {c.nameAr}</p>
                  <p className="text-xs text-slate-400">{c.slug}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button type="button" onClick={() => { setCatEdit(c.id); setCatForm({ slug: c.slug, nameEn: c.nameEn, nameAr: c.nameAr, image: c.image, sort: c.sort }); }} className="font-semibold text-royal hover:underline">
                    {t("common.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(t("admin.confirmDelete"))) return;
                      await api(`/admin/categories/${c.id}`, { method: "DELETE" });
                      load();
                    }}
                    className="font-semibold text-red-600 hover:underline"
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Brands */}
        <section className="card-kajok p-6">
          <h2 className="text-lg font-bold">{t("admin.brands")}</h2>
          <form onSubmit={saveBrand} className="mt-4 space-y-3">
            <input placeholder={t("admin.nameEn")} required value={brandForm.name} onChange={(e) => setBrandForm((f) => ({ ...f, name: e.target.value }))} className="input-kajok" />
            <input placeholder="Slug" required dir="ltr" value={brandForm.slug} onChange={(e) => setBrandForm((f) => ({ ...f, slug: e.target.value }))} className="input-kajok" />
            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary px-5 py-2.5">{brandEdit ? t("common.save") : t("common.add")}</button>
              {brandEdit && (
                <button type="button" onClick={() => { setBrandEdit(null); setBrandForm({ slug: "", name: "" }); }} className="btn-secondary px-5 py-2.5">
                  {t("common.cancel")}
                </button>
              )}
            </div>
          </form>
          <ul className="mt-5 space-y-2">
            {brands.map((b) => (
              <li key={b.id} className="flex items-center justify-between rounded-lg border border-line px-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold">{b.name}</p>
                  <p className="text-xs text-slate-400">{b.slug}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button type="button" onClick={() => { setBrandEdit(b.id); setBrandForm({ slug: b.slug, name: b.name }); }} className="font-semibold text-royal hover:underline">
                    {t("common.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(t("admin.confirmDelete"))) return;
                      await api(`/admin/brands/${b.id}`, { method: "DELETE" });
                      load();
                    }}
                    className="font-semibold text-red-600 hover:underline"
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
