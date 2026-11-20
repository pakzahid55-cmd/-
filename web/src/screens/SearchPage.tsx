import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard";
import { EmptyState, PageHeader, Spinner } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import type { Brand, Category, Product } from "../lib/types";

interface PagedProducts {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

export function SearchPage() {
  const { t, pick } = useI18n();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "relevance";
  const page = Number(params.get("page") ?? 1);
  const [data, setData] = useState<PagedProducts | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(Boolean(q));
  const [error, setError] = useState(false);
  const filters = params.toString();

  useEffect(() => {
    void api<{ items: Category[] }>("/categories", { auth: false }).then((r) => setCategories(r.items)).catch(() => undefined);
    void api<{ items: Brand[] }>("/brands", { auth: false }).then((r) => setBrands(r.items)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!q) { setData(null); setLoading(false); return; }
    const abort = new AbortController();
    setError(false);
    setLoading(true);
    const query = new URLSearchParams(filters);
    query.set('sort', sort === "relevance" ? "popularity" : sort);
    query.set('limit', '12');
    void api<PagedProducts>(`/products?${query}`, { auth: false, signal: abort.signal })
      .then(setData).catch(() => { if (!abort.signal.aborted) setError(true); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [q, sort, filters]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  return (
    <div className="container-kujuk py-8">
      <PageHeader
        title={t("search.title", { q })}
        subtitle={data ? t("common.results", { n: data.total }) : undefined}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select value={sort} onChange={(e) => update("sort", e.target.value)} className="input-kujuk w-auto" aria-label={t("common.sortBy")}>
          <option value="relevance">{t("search.suggestions")}</option>
          <option value="popularity">{t("home.bestSellers")}</option>
          <option value="newest">{t("home.latest")}</option>
          <option value="price-asc">{t("common.price")} ↑</option>
          <option value="price-desc">{t("common.price")} ↓</option>
          <option value="rating">{t("common.rating")}</option>
        </select>
        <select className="input-kujuk w-auto" aria-label={t("common.category")} value={params.get("category") ?? ""} onChange={e => update('category', e.target.value)}><option value="">{pick('All categories','كل الأقسام')}</option>{categories.map(c => <option key={c.id} value={c.slug}>{pick(c.nameEn,c.nameAr)}</option>)}</select>
        <select className="input-kujuk w-auto" aria-label={t("common.brand")} value={params.get("brand") ?? ""} onChange={e => update('brand', e.target.value)}><option value="">{pick('All brands','كل العلامات')}</option>{brands.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}</select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={params.get('inStock') === 'true'} onChange={e => update('inStock', e.target.checked ? 'true' : '')}/>{pick('In stock only','المتوفر فقط')}</label>
        <form className="flex gap-2" key={q + (params.get('minPrice') ?? '') + (params.get('maxPrice') ?? '')} onSubmit={e => {
          e.preventDefault(); const values = new FormData(e.currentTarget); const next = new URLSearchParams(params);
          for (const field of ['minPrice','maxPrice']) { const val = String(values.get(field) ?? ''); if (val) next.set(field,val); else next.delete(field); }
          next.delete('page'); setParams(next);
        }}><input className="input-kujuk w-24" name="minPrice" min="0" type="number" defaultValue={params.get('minPrice') ?? ''} aria-label={t('search.min')} placeholder={t('search.min')} /><input className="input-kujuk w-24" name="maxPrice" min="0" type="number" defaultValue={params.get('maxPrice') ?? ''} aria-label={t('search.max')} placeholder={t('search.max')} /><button className="btn-secondary px-3">{t('common.apply')} (EGP)</button></form>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? <EmptyState title={t("common.error")} /> : data && data.items.length > 0 ? (
        <>
          <ProductGrid products={data.items} />
          {data.pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => update("page", String(p))}
                  className={`btn h-9 w-9 rounded-lg ${p === page ? "bg-royal text-white" : "border border-line bg-white"}`}
                >
                  {p}
                </button>
              ))}
            </nav>
          )}
        </>
      ) : (
        <EmptyState
          title={t("search.noResultsTitle", { q })}
          text={t("search.noResultsText")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <Link key={c.slug} to={`/products?category=${c.slug}`} className="btn-secondary px-4 py-2">
                  {pick(c.nameEn, c.nameAr)}
                </Link>
              ))}
            </div>
          }
        />
      )}
    </div>
  );
}
