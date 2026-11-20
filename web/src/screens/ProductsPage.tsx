import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard";
import { Breadcrumbs, EmptyState, PageHeader, Spinner } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import type { Brand, Category, Product } from "../lib/types";

interface PagedProducts {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

const SORTS = ["newest", "popularity", "price-asc", "price-desc", "rating", "discount"] as const;

export function ProductsPage() {
  const { t, pick } = useI18n();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<PagedProducts | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");

  const [error, setError] = useState(false);
  const appliedMin = params.get("minPrice");
  const appliedMax = params.get("maxPrice");
  const inStock = params.get("inStock") === "true";
  const featured = params.get("featured") === "true";
  const category = params.get("category") ?? "";
  const brand = params.get("brand") ?? "";
  const sort = params.get("sort") ?? "newest";
  const page = Number(params.get("page") ?? 1);

  useEffect(() => {
    void api<{ items: Category[] }>("/categories", { auth: false }).then((r) => setCategories(r.items)).catch(() => undefined);
    void api<{ items: Brand[] }>("/brands", { auth: false }).then((r) => setBrands(r.items)).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const abort = new AbortController();
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (brand) qs.set("brand", brand);
    if (sort) qs.set("sort", sort);
    if (appliedMin) qs.set("minPrice", appliedMin);
    if (appliedMax) qs.set("maxPrice", appliedMax);
    if (inStock) qs.set("inStock", "true");
    if (featured) qs.set("featured", "true");
    qs.set("page", String(page));
    qs.set("limit", "12");
    void api<PagedProducts>(`/products?${qs.toString()}`, { auth: false, signal: abort.signal })
      .then(setData)
      .catch(() => { if (!abort.signal.aborted) setError(true); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, brand, sort, page, appliedMin, appliedMax, inStock, featured]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="container-kujuk py-8">
      <Breadcrumbs items={[{ label: t("nav.home"), to: "/" }, { label: t("nav.products") }]} />
      <PageHeader title={activeCategory ? pick(activeCategory.nameEn, activeCategory.nameAr) : t("nav.products")} />

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="card-kujuk space-y-6 p-5">
            <div>
              <h3 className="mb-3 text-sm font-bold">{t("common.filters")}</h3>
              <button
                type="button"
                onClick={() => {
                  setParams(new URLSearchParams());
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="text-xs font-semibold text-royal hover:underline"
              >
                {t("common.clearAll")}
              </button>
            </div>

            <div>
              <h4 className="label-kujuk">{t("common.category")}</h4>
              <div className="flex flex-col gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => update("category", category === c.slug ? "" : c.slug)}
                    className={`rounded-md px-2.5 py-1.5 text-start text-sm ${category === c.slug ? "bg-royal font-semibold text-white" : "text-ink hover:bg-surface"}`}
                  >
                    {pick(c.nameEn, c.nameAr)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="label-kujuk">{t("common.brand")}</h4>
              <div className="flex flex-col gap-1.5">
                {brands.map((b) => (
                  <button
                    key={b.slug}
                    type="button"
                    onClick={() => update("brand", brand === b.slug ? "" : b.slug)}
                    className={`rounded-md px-2.5 py-1.5 text-start text-sm ${brand === b.slug ? "bg-royal font-semibold text-white" : "text-ink hover:bg-surface"}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={inStock} onChange={(e) => update('inStock', e.target.checked ? 'true' : '')} />{pick('In stock only','المتوفر فقط')}</label>
            <div>
              <h4 className="label-kujuk">{t("search.priceRange")} (EGP)</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder={t("search.min")}
                  aria-label={t("search.min")}
                  className="input-kujuk"
                />
                <span className="text-slate-300">–</span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder={t("search.max")}
                  aria-label={t("search.max")}
                  className="input-kujuk"
                />
              </div>
              <button
                type="button"
                className="btn-primary mt-3 w-full py-2"
                onClick={() => {
                  const next = new URLSearchParams(params);
                  if (minPrice) next.set("minPrice", minPrice);
                  else next.delete("minPrice");
                  if (maxPrice) next.set("maxPrice", maxPrice);
                  else next.delete("maxPrice");
                  next.delete("page");
                  setParams(next);
                }}
              >
                {t("common.apply")}
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section className="flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">{data ? t("common.results", { n: data.total }) : t("common.loading")}</p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">{t("common.sortBy")}</span>
              <select value={sort} onChange={(e) => update("sort", e.target.value)} className="input-kujuk w-auto" aria-label={t("common.sortBy")}>
                {SORTS.map((s) => (
                  <option key={s} value={s}>
                    {s === "price-asc" ? `${t("common.price")} ↑` : s === "price-desc" ? `${t("common.price")} ↓` : s === "popularity" ? t("home.bestSellers") : s === "newest" ? t("home.latest") : s === "rating" ? t("common.rating") : t("common.sale")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <Spinner />
          ) : error ? <EmptyState title={t("common.error")} /> : data && data.items.length > 0 ? (
            <>
              <ProductGrid products={data.items} />
              {data.pages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => update("page", String(page - 1))}
                    className="btn-secondary px-4"
                  >
                    ←
                  </button>
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
                  <button
                    type="button"
                    disabled={page >= data.pages}
                    onClick={() => update("page", String(page + 1))}
                    className="btn-secondary px-4"
                  >
                    →
                  </button>
                </nav>
              )}
            </>
          ) : (
            <EmptyState title={t("common.noResults")} text={t("search.noResultsText")} />
          )}
        </section>
      </div>
    </div>
  );
}
