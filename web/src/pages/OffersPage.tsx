import { useEffect, useState } from "react";
import { ProductGrid } from "../components/ProductCard";
import { PageHeader, Spinner } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import type { Coupon, Product } from "../lib/types";

export function OffersPage() {
  const { t, lang } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const [p, all] = await Promise.all([
          api<{ items: Product[] }>("/products?sort=discount&limit=12", { auth: false }),
          api<{ items: Coupon[] }>("/admin/coupons", { auth: false }).catch(() => ({ items: [] })),
        ]);
        setProducts(p.items.filter((x) => x.discountPrice !== null));
        setCoupons(all.items.filter((c) => c.active).slice(0, 3));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copy = (code: string) => {
    void navigator.clipboard?.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(""), 1500);
    });
  };

  return (
    <div className="container-kajok py-8">
      <PageHeader title={t("offers.title")} subtitle={t("offers.subtitle")} />

      {loading ? (
        <Spinner />
      ) : (
        <>
          {coupons.length > 0 && (
            <div className="mb-10 grid gap-4 sm:grid-cols-3">
              {coupons.map((c) => (
                <div key={c.id} className="relative overflow-hidden rounded-lg border-2 border-dashed border-royal bg-white p-5">
                  <span className="badge-kajok bg-royal text-white">{t("offers.endsSoon")}</span>
                  <p className="mt-3 text-2xl font-extrabold text-deep">
                    {c.type === "percent" ? `${c.value}% OFF` : `$${c.value} OFF`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {lang === "ar" ? "الحد الأدنى للطلب" : "Min order"}: ${c.minOrder.toFixed(2)}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <code className="flex-1 rounded-md bg-surface px-3 py-2 text-center text-sm font-bold tracking-wider text-deep">
                      {c.code}
                    </code>
                    <button type="button" onClick={() => copy(c.code)} className="btn-primary px-4 py-2">
                      {copied === c.code ? t("offers.copied") : t("offers.copyCode")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="section-title mb-5">{t("home.specialOffers")}</h2>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="text-slate-500">{t("common.noResults")}</p>
          )}
        </>
      )}
    </div>
  );
}
