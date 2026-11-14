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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api<{ items: Category[] }>("/categories", { auth: false }).then((r) => setCategories(r.items));
    void api<{ items: Brand[] }>("/brands", { auth: false }).then((r) => setBrands(r.items));
  }, []);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    const effectiveSort = sort === "relevance" ? "popularity" : sort;
    void api<PagedProducts>(`/products?q=${encodeURIComponent(q)}&sort=${effectiveSort}&page=${page}&limit=12`, { auth: false })
      .then(setData)
      .finally(() => setLoading(false));
  }, [q, sort, page]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  };

  return (
    <div className="container-kajok py-8">
      <PageHeader
        title={t("search.title", { q })}
        subtitle={data ? t("common.results", { n: data.total }) : undefined}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select value={sort} onChange={(e) => update("sort", e.target.value)} className="input-kajok w-auto" aria-label={t("common.sortBy")}>
          <option value="relevance">{t("search.suggestions")}</option>
          <option value="popularity">{t("home.bestSellers")}</option>
          <option value="newest">{t("home.latest")}</option>
          <option value="price-asc">{t("common.price")} ↑</option>
          <option value="price-desc">{t("common.price")} ↓</option>
          <option value="rating">{t("common.rating")}</option>
        </select>
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 6).map((c) => (
            <Link key={c.slug} to={`/products?category=${c.slug}`} className="badge-kajok border border-line bg-white text-ink hover:border-royal hover:text-royal">
              {pick(c.nameEn, c.nameAr)}
            </Link>
          ))}
          {brands.slice(0, 4).map((b) => (
            <Link key={b.slug} to={`/products?brand=${b.slug}`} className="badge-kajok border border-line bg-white text-ink hover:border-royal hover:text-royal">
              {b.name}
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : data && data.items.length > 0 ? (
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
