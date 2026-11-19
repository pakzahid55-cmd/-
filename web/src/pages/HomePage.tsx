import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MediaVideo } from "../components/Media";
import { ProductGrid } from "../components/ProductCard";
import { Spinner } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import type { Banner, Category, Product } from "../lib/types";
import { useRecentlyViewed } from "../store/wishlist";

export function HomePage() {
  const { t, pick, lang } = useI18n();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const recentlyViewed = useRecentlyViewed((s) => s.items);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [b, c, best, newItems, deal, rec] = await Promise.all([
        api<{ items: Banner[] }>("/banners", { auth: false }),
        api<{ items: Category[] }>("/categories", { auth: false }),
        api<Paged>("/products?sort=popularity&limit=8", { auth: false }),
        api<Paged>("/products?sort=newest&limit=8", { auth: false }),
        api<Paged>("/products?sort=discount&limit=4", { auth: false }),
        api<Paged>("/products?sort=rating&limit=4", { auth: false }),
      ]);
      setBanners(b.items);
      setCategories(c.items);
      setBestSellers(best.items);
      setLatest(newItems.items);
      setOffers(deal.items);
      setRecommended(rec.items);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const hero = banners[0];

  return (
    <div>
      {/* Hero */}
      <section aria-label="Hero" className="container-kajok pt-6">
        {hero ? (
          <div className="relative overflow-hidden rounded-lg bg-deep">
            {hero.video ? (
              <MediaVideo src={hero.video} poster={hero.image} autoPlay loop className="h-[320px] w-full object-cover sm:h-[420px]" />
            ) : (
              <img src={hero.image} alt="" className="h-[320px] w-full object-cover opacity-90 sm:h-[420px]" />
            )}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-xl px-6 sm:px-12">
                <span className="badge-kajok bg-accent/20 text-white">{t("home.heroCta")}</span>
                <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl">
                  {pick(hero.titleEn, hero.titleAr)}
                </h1>
                <p className="mt-4 text-sm text-white/85 sm:text-lg">{pick(hero.subtitleEn, hero.subtitleAr)}</p>
                <Link to={hero.link} className="btn-primary mt-6 px-6 py-3 text-base">
                  {t("common.shopNow")}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[320px] animate-pulse rounded-lg bg-deep/20 sm:h-[420px]" />
        )}
      </section>

      {/* Value props */}
      <section className="container-kajok mt-10">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { title: t("home.fastDelivery"), text: t("home.fastDeliveryText"), icon: "M13 3L4 14h6l-1 7 9-11h-6l1-7z" },
            { title: t("home.securePayment"), text: t("home.securePaymentText"), icon: "M12 2l8 4v6c0 5-3.4 9.2-8 10-4.6-.8-8-5-8-10V6l8-4z" },
            { title: t("home.easyReturns"), text: t("home.easyReturnsText"), icon: "M4 12a8 8 0 1114 5.3M4 12V7m0 5h5" },
            { title: t("home.support"), text: t("home.supportText"), icon: "M21 12a9 9 0 11-9-9 9 9 0 016 2.3M21 3v5h-5" },
          ].map((item) => (
            <div key={item.title} className="card-kajok flex items-start gap-3 p-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-royal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={item.icon} />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-bold">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="container-kajok mt-8">
          <div className="card-kajok p-6 text-center text-sm text-red-600">
            {t("common.error")}{" "}
            <button type="button" onClick={load} className="font-semibold text-royal underline">
              {t("common.retry")}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Categories */}
          <Section title={t("home.featuredCategories")} link="/categories" linkLabel={t("common.viewAll")}>
            <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
              {categories.map((c) => (
                <Link key={c.id} to={`/products?category=${c.slug}`} className="group text-center">
                  <div className="aspect-square overflow-hidden rounded-lg border border-line bg-white">
                    <img
                      src={c.image}
                      alt={pick(c.nameEn, c.nameAr)}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink group-hover:text-royal">{pick(c.nameEn, c.nameAr)}</p>
                </Link>
              ))}
            </div>
          </Section>

          {/* Best sellers */}
          <Section title={t("home.bestSellers")} link="/products?sort=popularity" linkLabel={t("common.viewAll")}>
            <ProductGrid products={bestSellers} />
          </Section>

          {/* Special offers banner + products */}
          {banners[1] && (
            <section className="container-kajok mt-12">
              <Link to={banners[1].link} className="block overflow-hidden rounded-lg bg-deep">
                <div className="relative">
                  {banners[1].video ? (
                    <MediaVideo src={banners[1].video} poster={banners[1].image} autoPlay loop className="h-44 w-full object-cover sm:h-56" />
                  ) : (
                    <img src={banners[1].image} alt="" className="h-44 w-full object-cover opacity-80 sm:h-56" />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-extrabold text-white sm:text-3xl">{pick(banners[1].titleEn, banners[1].titleAr)}</h2>
                    <p className="mt-2 text-sm text-white/85">{pick(banners[1].subtitleEn, banners[1].subtitleAr)}</p>
                    <span className="btn-primary mt-4 px-6 py-2.5">{t("offers.shopDeals")}</span>
                  </div>
                </div>
              </Link>
            </section>
          )}

          <Section title={t("home.specialOffers")} link="/offers" linkLabel={t("common.viewAll")}>
            <ProductGrid products={offers} />
          </Section>

          {/* Latest */}
          <Section title={t("home.latest")} link="/products?sort=newest" linkLabel={t("common.viewAll")}>
            <ProductGrid products={latest} />
          </Section>

          {/* Recommended */}
          <Section title={t("home.recommended")}>
            <ProductGrid products={recommended} />
          </Section>

          {/* Recently viewed */}
          {recentlyViewed.length > 0 && (
            <Section title={t("home.recentlyViewed")}>
              <div className="scrollbar-thin overflow-x-auto pb-2">
                <div className="grid min-w-[640px] grid-cols-4 gap-4">
                  {recentlyViewed.slice(0, 8).map((p) => (
                    <Link key={p.id} to={`/product/${p.slug}`} className="card-kajok flex items-center gap-3 p-3 hover:shadow-lift">
                      <img src={p.images[0]} alt="" className="h-14 w-14 rounded-md object-cover" />
                      <div>
                        <p className="line-clamp-2 text-xs font-semibold">{pick(p.nameEn, p.nameAr)}</p>
                        <p className="mt-1 text-xs font-bold text-royal">${(p.discountPrice ?? p.price).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Section>
          )}

          {/* Newsletter */}
          <section className="container-kajok mt-14">
            <div className="rounded-lg bg-royal px-6 py-10 text-center text-white sm:px-12">
              <h2 className="text-2xl font-bold">{t("home.newsletter")}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/80">{t("home.newsletterText")}</p>
              <form
                className="mx-auto mt-6 flex max-w-md gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(t("home.subscribed"));
                }}
              >
                <input type="email" required placeholder={t("auth.email")} aria-label={t("auth.email")} className="input-kajok" />
                <button type="submit" className="btn bg-white px-5 text-royal hover:bg-accent hover:text-white">
                  {t("home.subscribe")}
                </button>
              </form>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Section({
  title,
  link,
  linkLabel,
  children,
}: {
  title: string;
  link?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-kajok mt-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="section-title">{title}</h2>
        {link && (
          <Link to={link} className="text-sm font-semibold text-royal hover:underline">
            {linkLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

type Paged = { items: Product[] };
