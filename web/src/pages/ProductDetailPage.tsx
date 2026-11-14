import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard";
import { Breadcrumbs, DiscountBadge, Price, QuantityStepper, Rating, Spinner, Stars } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import { asset } from "../lib/asset";
import { formatDate } from "../lib/format";
import type { Brand, Category, Product, Review } from "../lib/types";
import { useAuth } from "../store/auth";
import { useCart } from "../store/cart";
import { useRecentlyViewed, useWishlist } from "../store/wishlist";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, pick, lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const addRecent = useRecentlyViewed((s) => s.add);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    setActiveImage(0);
    setQuantity(1);
    void Promise.all([
      api<{ product: Product; reviews: Review[]; related: Product[] }>(`/products/${slug}`, { auth: false }),
      api<{ items: Brand[] }>("/brands", { auth: false }),
      api<{ items: Category[] }>("/categories", { auth: false }),
    ])
      .then(([detail, b, c]) => {
        setProduct(detail.product);
        setReviews(detail.reviews);
        setRelated(detail.related);
        setBrands(b.items);
        setCategories(c.items);
        addRecent(detail.product);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) return <Spinner className="py-24" />;
  if (error || !product) {
    return (
      <div className="container-kajok py-24 text-center">
        <h1 className="text-xl font-bold">{t("common.noResults")}</h1>
        <Link to="/products" className="btn-primary mt-6 px-6 py-3">
          {t("cart.continueShopping")}
        </Link>
      </div>
    );
  }

  const name = pick(product.nameEn, product.nameAr);
  const description = pick(product.descriptionEn, product.descriptionAr);
  const brand = brands.find((b) => b.id === product.brandId);
  const category = categories.find((c) => c.id === product.categoryId);
  const wished = has(product.id);
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        image: product.images[0] ?? "",
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    handleAdd();
    navigate("/cart");
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setReviewMsg("");
    try {
      const { review } = await api<{ review: Review }>(`/products/${product.id}/reviews`, {
        method: "POST",
        body: { rating, comment },
      });
      setReviews((r) => [review, ...r]);
      setComment("");
      setReviewMsg(t("product.reviewSubmitted"));
    } catch (err) {
      setReviewMsg(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-kajok py-8">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), to: "/" },
          { label: t("nav.products"), to: "/products" },
          ...(category ? [{ label: pick(category.nameEn, category.nameAr), to: `/products?category=${category.slug}` }] : []),
          { label: name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            <img
              src={product.images[activeImage] ?? product.images[0]}
              alt={name}
              className="aspect-square w-full object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = asset("/images/categories/electronics.jpg"))}
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${i === activeImage ? "border-royal" : "border-line"}`}
                  aria-label={`${t("product.image")} ${i + 1}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            {product.isNew && <span className="badge-kajok bg-deep text-white">{t("common.new")}</span>}
            <DiscountBadge product={product} />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Rating value={product.rating} count={product.reviewCount} />
            {brand && (
              <span className="text-sm text-slate-500">
                {t("common.brand")}: <span className="font-semibold text-ink">{brand.name}</span>
              </span>
            )}
          </div>

          <div className="mt-5 border-y border-line py-5">
            <Price product={product} size="lg" />
            <p className="mt-2 text-sm text-slate-500">
              {outOfStock ? (
                <span className="font-semibold text-red-600">{t("common.outOfStock")}</span>
              ) : product.stock <= 10 ? (
                <span className="font-semibold text-amber-600">{t("common.lowStock", { n: product.stock })}</span>
              ) : (
                <span className="font-semibold text-green-700">{t("common.inStock")}</span>
              )}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <QuantityStepper value={quantity} onChange={(v) => setQuantity(Math.max(1, v))} max={product.stock} />
            <button type="button" onClick={handleAdd} disabled={outOfStock} className="btn-primary px-8 py-3">
              {added ? `✓ ${t("product.addedToCart")}` : t("product.addToCart")}
            </button>
            <button type="button" onClick={handleBuyNow} disabled={outOfStock} className="btn-secondary px-8 py-3">
              {t("product.buyNow")}
            </button>
            <button
              type="button"
              onClick={() => toggle(product)}
              aria-pressed={wished}
              className="btn-secondary p-3"
              aria-label={t("nav.wishlist")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? "#6C3BCE" : "none"} stroke={wished ? "#6C3BCE" : "currentColor"} strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
              </svg>
            </button>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <CheckIcon /> {t("product.freeShipping")}
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon /> {t("product.secureTransaction")}
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon /> {t("product.soldBy")}
            </li>
          </ul>

          <div className="mt-8">
            <h2 className="text-lg font-bold">{t("product.description")}</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{description}</p>
          </div>

          {Object.keys(product.specs).length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold">{t("product.specifications")}</h2>
              <table className="mt-3 w-full overflow-hidden rounded-lg border border-line text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([k, v]) => (
                    <tr key={k} className="odd:bg-surface/60">
                      <th className="w-1/3 px-4 py-2.5 text-start font-semibold text-ink">{k}</th>
                      <td className="px-4 py-2.5 text-slate-600">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14">
        <h2 className="section-title">{t("product.customerReviews")}</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {reviews.length === 0 && <p className="text-sm text-slate-500">{t("product.noReviews")}</p>}
            {reviews.map((r) => (
              <article key={r.id} className="card-kajok p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface font-bold text-royal">
                      {r.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.userName}</p>
                      <p className="text-xs text-slate-400">{formatDate(r.createdAt, lang)}</p>
                    </div>
                  </div>
                  <Stars value={r.rating} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.comment}</p>
              </article>
            ))}
          </div>

          <div className="card-kajok h-fit p-5">
            <h3 className="font-bold">{t("product.writeReview")}</h3>
            {user ? (
              <form onSubmit={submitReview} className="mt-4 space-y-4">
                <div>
                  <span className="label-kajok">{t("product.yourRating")}</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                        <svg width="26" height="26" viewBox="0 0 20 20" fill={n <= rating ? "#F5B301" : "#E9E4F4"}>
                          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="review-comment" className="label-kajok">
                    {t("product.yourComment")}
                  </label>
                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    minLength={3}
                    rows={4}
                    placeholder={t("product.reviewPlaceholder")}
                    className="input-kajok resize-none"
                  />
                </div>
                {reviewMsg && <p className="text-sm font-medium text-green-700">{reviewMsg}</p>}
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? t("common.saving") : t("product.submitReview")}
                </button>
              </form>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                <Link to="/login" className="font-semibold text-royal hover:underline">
                  {t("product.loginToReview")}
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-5">{t("product.related")}</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6C3BCE" strokeWidth="2.5" className="shrink-0">
      <path d="M4 12l5 5L20 6" />
    </svg>
  );
}
