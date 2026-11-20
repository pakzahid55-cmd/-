import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MediaVideo } from "../components/Media";
import { ProductGrid } from "../components/ProductCard";
import { Spinner } from "../components/ui";
import { formatPrice } from "../lib/format";
import { useCurrency } from "../store/currency";
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
  useCurrency(s => s.currency);
  const recentlyViewed = useRecentlyViewed((s) => s.items);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [b, c, best, newItems, deal, rec] = await Promise.all([
        api<{ items: Banner[] }>("/banners", { auth: false }),
        api<{ items: Category[] }>("/categories", { auth: false }),
        api<Paged>("/products?featured=true&sort=popularity&limit=8", { auth: false }),
        api<Paged>("/products?sort=newest&limit=8", { auth: false }),
        api<Paged>("/products?sort=discount&offers=true&limit=4", { auth: false }),
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
      <section aria-label={pick("Featured campaign", "الحملة المميزة")} className="container-kujuk pt-6">
        <div className="campaign">
          {hero?.video ? (
            <MediaVideo src={hero.video} poster={hero.image} autoPlay loop className="campaign-image" />
          ) : (
            <img src={hero?.image && hero.image !== "/images/hero.jpg" ? hero.image : "/images/kujuk-campaign.jpg"} alt="" fetchPriority="high" className="campaign-image" />
          )}
          <div className="campaign-copy">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.19em] text-[#D7C9FF]"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{pick("The KUJUK Marketplace", "سوق كجوك الإلكتروني")}</p>
            <h1 className="mt-4 max-w-[12ch] text-[2.6rem] font-extrabold leading-[1.06] tracking-[-.05em] text-white sm:text-[3.4rem] lg:text-[4.3rem]">{lang === "en" && (!hero || hero.titleEn === "Your Order. Your Way.") ? <>Your Order.<br />Your Way.</> : hero ? pick(hero.titleEn, hero.titleAr) : "طلبك. على طريقتك."}</h1>
            <p className="mt-5 max-w-[34ch] text-sm leading-6 text-[#DFD4EE] sm:text-base">{hero ? pick(hero.subtitleEn, hero.subtitleAr) : pick("Discover products from independent sellers, all in one marketplace.", "تسوّق منتجات من بائعين مستقلين، كلهم في مكان واحد.")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={hero?.link || "/products"} className="btn-primary px-5 py-3">{t("common.shopNow")} <span aria-hidden="true">{pick("↗", "↖")}</span></Link>
              <Link to="/offers" className="btn border border-white/30 px-5 py-3 text-white hover:bg-white/10">{pick("Explore offers", "استكشف العروض")}</Link>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 divide-x divide-line rtl:divide-x-reverse rounded-lg border border-line bg-white lg:grid-cols-4">
          {[
            ["M2 5h13v12H2z M15 9h4l3 4v4h-7 M5 17a2 2 0 1 0 4 0 M16 17a2 2 0 1 0 4 0", "Order tracking", "تتبّع الطلب", "Follow your delivery", "تابع حالة توصيل طلبك"],
            ["M3 6h18v12H3z M3 10h18 M6 14h4", "Cash on delivery", "الدفع عند الاستلام", "Pay when your order arrives", "ادفع عند وصول الطلب"],
            ["M3 9l2-5h14l2 5 M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0 M5 12v8h14v-8 M10 20v-5h4v5", "Multiple sellers", "بائعون متعددون", "Shop in one basket", "تسوّق بسلة واحدة"],
            ["M12 22s7-6 7-13a7 7 0 0 0-14 0c0 7 7 13 7 13z M12 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4z", "Egypt & Sudan", "مصر والسودان", "EGP & SDG supported", "دعم الجنيه المصري والسوداني"],
          ].map(([icon, en, ar, sub, subAr]) => (
            <div className="flex items-center gap-3 px-3 py-4 lg:px-5" key={en}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#F0EAFB] text-royal"><svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon}/></svg></span>
              <span><strong className="block text-xs sm:text-sm">{pick(en, ar)}</strong><span className="mt-1 hidden text-xs text-slate-500 sm:block">{pick(sub, subAr)}</span></span>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="container-kujuk mt-8">
          <div className="card-kujuk p-6 text-center text-sm text-red-600">
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
                  <div className="aspect-[5/3] overflow-hidden rounded-lg border border-line bg-white">
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
          <Section title={pick("Featured products", "المنتجات المميزة")} link="/products?featured=true&sort=popularity" linkLabel={t("common.viewAll")}>
            <ProductGrid products={bestSellers} />
          </Section>

          {/* Special offers banner + products */}
          {banners[1] && (
            <section className="container-kujuk mt-12">
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
                    <Link key={p.id} to={`/product/${p.slug}`} className="card-kujuk flex items-center gap-3 p-3 hover:shadow-lift">
                      <img src={p.images[0]} alt="" className="h-14 w-14 rounded-md object-cover" />
                      <div>
                        <p className="line-clamp-2 text-xs font-semibold">{pick(p.nameEn, p.nameAr)}</p>
                        <p className="mt-1 text-xs font-bold text-royal">{formatPrice(p.discountPrice ?? p.price, lang)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Section>
          )}

          <section className="container-kujuk mt-14">
            <div className="flex flex-wrap items-center justify-between gap-5 rounded-lg border border-line bg-white p-6 sm:p-9">
              <div><p className="text-xs font-extrabold uppercase tracking-widest text-royal">KUJUK MARKETPLACE</p><h2 className="mt-2 text-2xl font-extrabold">{pick("Bring your shop to KUJUK", "افتح متجرك على كجوك")}</h2></div>
              <Link className="btn-primary px-5 py-3" to="/seller/apply">{t("nav.sell")} ↗</Link>
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
    <section className="container-kujuk mt-10">
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
