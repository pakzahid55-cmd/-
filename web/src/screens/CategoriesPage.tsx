import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumbs, PageHeader, Spinner } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import type { Category, Product } from "../lib/types";

export function CategoriesPage() {
  const { t, pick } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const { items } = await api<{ items: Category[] }>("/categories", { auth: false });
        setCategories(items);
        const entries = await Promise.all(
          items.map(async (c) => {
            const res = await api<{ total: number }>(`/products?category=${c.slug}&limit=1`, { auth: false });
            return [c.slug, res.total] as const;
          }),
        );
        setCounts(Object.fromEntries(entries));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container-kujuk py-8">
      <Breadcrumbs items={[{ label: t("nav.home"), to: "/" }, { label: t("nav.categories") }]} />
      <PageHeader title={t("nav.categories")} subtitle={t("home.featuredCategories")} />

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="group relative overflow-hidden rounded-lg border border-line bg-white shadow-card transition-shadow hover:shadow-lift"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={c.image}
                  alt={pick(c.nameEn, c.nameAr)}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <h2 className="text-lg font-bold text-ink group-hover:text-royal">{pick(c.nameEn, c.nameAr)}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t("common.results", { n: counts[c.slug] ?? 0 })}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-royal transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
