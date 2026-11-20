import { Link } from "react-router-dom";
import { ProductGrid } from "../components/ProductCard";
import { EmptyState, PageHeader } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { useWishlist } from "../store/wishlist";

export function WishlistPage() {
  const { t } = useI18n();
  const items = useWishlist((s) => s.items);

  return (
    <div className="container-kujuk py-8">
      <PageHeader title={t("wishlist.title")} subtitle={items.length ? t("common.results", { n: items.length }) : undefined} />
      {items.length === 0 ? (
        <EmptyState
          title={t("wishlist.empty")}
          text={t("wishlist.emptyText")}
          action={
            <Link to="/products" className="btn-primary px-6 py-3">
              {t("cart.continueShopping")}
            </Link>
          }
        />
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
