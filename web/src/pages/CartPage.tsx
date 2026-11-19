import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState, PageHeader, QuantityStepper } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import { asset } from "../lib/asset";
import { formatPrice } from "../lib/format";
import { cartTotals, useCart } from "../store/cart";
import { useAuth } from "../store/auth";

const FREE_SHIPPING_OVER = 150;

export function CartPage() {
  const { t, pick, lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, setQuantity, removeItem, couponCode, couponDiscount, applyCoupon, removeCoupon } = useCart();
  const [codeInput, setCodeInput] = useState(couponCode ?? "");
  const [couponError, setCouponError] = useState("");
  const [applying, setApplying] = useState(false);

  const { subtotal, count } = cartTotals(items);
  const discount = Math.min(couponDiscount, subtotal);
  const shipping = items.length === 0 || subtotal - discount >= FREE_SHIPPING_OVER ? 0 : 5.99;
  const total = Math.max(0, subtotal - discount + shipping);

  const submitCoupon = async () => {
    if (!codeInput.trim()) return;
    setApplying(true);
    setCouponError("");
    try {
      const res = await api<{ coupon: { code: string }; discount: number }>("/coupons/validate", {
        method: "POST",
        body: { code: codeInput.trim(), subtotal },
        auth: false,
      });
      applyCoupon(res.coupon.code, res.discount);
    } catch (err) {
      removeCoupon();
      setCouponError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-kajok py-12">
        <PageHeader title={t("cart.title")} />
        <EmptyState
          title={t("cart.empty")}
          text={t("cart.emptyText")}
          action={
            <Link to="/products" className="btn-primary px-6 py-3">
              {t("cart.continueShopping")}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-kajok py-8">
      <PageHeader title={t("cart.title")} subtitle={t("cart.itemsCount", { n: count })} />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.productId} className="card-kajok flex flex-col gap-4 p-4 sm:flex-row">
              <Link to={`/product/${item.slug}`} className="shrink-0">
                <img
                  src={item.image}
                  alt={pick(item.nameEn, item.nameAr)}
                  className="h-24 w-24 rounded-lg object-cover"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = asset("/images/categories/electronics.jpg"))}
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/product/${item.slug}`} className="font-semibold text-ink hover:text-royal">
                    {pick(item.nameEn, item.nameAr)}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={t("common.remove")}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7h16M9 7V5h6v2m-8 0l1 13h8l1-13" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatPrice(item.discountPrice ?? item.price, lang)} × {item.quantity}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(v) => setQuantity(item.productId, v)}
                    max={item.stock}
                  />
                  <p className="font-bold text-ink">{formatPrice((item.discountPrice ?? item.price) * item.quantity, lang)}</p>
                </div>
              </div>
            </article>
          ))}

          <Link to="/products" className="btn-secondary inline-flex px-5 py-2.5">
            ← {t("cart.continueShopping")}
          </Link>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="card-kajok p-5">
            <h2 className="text-lg font-bold">{t("cart.orderSummary")}</h2>

            {/* Coupon */}
            <div className="mt-4">
              {couponCode ? (
                <div className="flex items-center justify-between rounded-lg bg-green-50 px-3.5 py-2.5 text-sm">
                  <span className="font-medium text-green-800">
                    {t("cart.couponApplied", { code: couponCode, amount: formatPrice(discount, lang) })}
                  </span>
                  <button type="button" onClick={removeCoupon} className="text-green-800 underline">
                    {t("cart.removeCoupon")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder={t("cart.couponPlaceholder")}
                    aria-label={t("cart.couponPlaceholder")}
                    className="input-kajok"
                  />
                  <button type="button" onClick={submitCoupon} disabled={applying} className="btn-primary px-5">
                    {t("cart.applyCoupon")}
                  </button>
                </div>
              )}
              {couponError && <p className="mt-2 text-xs text-red-600">{couponError}</p>}
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">{t("common.subtotal")}</dt>
                <dd className="font-semibold">{formatPrice(subtotal, lang)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt>{t("common.discount")}</dt>
                  <dd className="font-semibold">−{formatPrice(discount, lang)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">{t("common.shipping")}</dt>
                <dd className="font-semibold">{shipping === 0 ? t("common.free") : formatPrice(shipping, lang)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-bold">{t("common.total")}</dt>
                <dd className="font-bold text-royal">{formatPrice(total, lang)}</dd>
              </div>
            </dl>

            {shipping > 0 && (
              <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-slate-500">
                {t("cart.freeShippingNote", { amount: formatPrice(FREE_SHIPPING_OVER - (subtotal - discount), lang) })}
              </p>
            )}
            {shipping === 0 && items.length > 0 && (
              <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                {t("cart.youHaveFreeShipping")}
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate(user ? "/checkout" : "/login?next=/checkout")}
              className="btn-primary mt-5 w-full py-3 text-base"
            >
              {t("cart.proceedToCheckout")}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
