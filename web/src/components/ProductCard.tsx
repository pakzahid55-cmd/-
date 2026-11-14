import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import type { Product } from "../lib/types";
import { useCart } from "../store/cart";
import { useWishlist } from "../store/wishlist";
import { DiscountBadge, Price, Rating } from "./ui";

export function ProductCard({ product }: { product: Product }) {
  const { t, pick, lang } = useI18n();
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const [added, setAdded] = useState(false);
  const wished = has(product.id);
  const name = pick(product.nameEn, product.nameAr);
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      image: product.images[0] ?? "",
      price: product.price,
      discountPrice: product.discountPrice,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="card-kajok group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <div className="relative">
        <Link to={`/product/${product.slug}`} aria-label={name}>
          <div className="aspect-square overflow-hidden bg-surface">
            <img
              src={product.images[0] ?? "/images/categories/electronics.jpg"}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/categories/electronics.jpg";
              }}
            />
          </div>
        </Link>
        <div className="absolute top-2.5 flex flex-col gap-1.5">
          {product.isNew && <span className="badge-kajok bg-deep text-white">{t("common.new")}</span>}
          <DiscountBadge product={product} />
        </div>
        <button
          type="button"
          onClick={() => toggle(product)}
          aria-label={wished ? t("nav.wishlist") : t("nav.wishlist")}
          aria-pressed={wished}
          className="absolute top-2.5 end-2.5 rounded-full bg-white/90 p-2 shadow-card transition-colors hover:bg-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? "#6C3BCE" : "none"} stroke={wished ? "#6C3BCE" : "#64748B"} strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <Link to={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-ink hover:text-royal">
          {name}
        </Link>
        <div className="mt-1.5">
          <Rating value={product.rating} count={product.reviewCount} />
        </div>
        <div className="mt-2">
          <Price product={product} />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className={`btn mt-3 w-full ${added ? "btn-secondary" : "btn-primary"}`}
        >
          {outOfStock ? t("common.outOfStock") : added ? `✓ ${t("product.addedToCart")}` : t("product.addToCart")}
        </button>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
