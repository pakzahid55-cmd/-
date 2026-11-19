import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import { formatMoney, formatPrice } from "../lib/format";
import { useCurrency } from "../store/currency";
import type { Address, Order } from "../lib/types";
import { useAuth } from "../store/auth";
import { cartTotals, useCart } from "../store/cart";

const FREE_SHIPPING_OVER = 150;

export function CheckoutPage() {
  const { t, pick, lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, couponCode, couponDiscount, clear } = useCart();
  const { subtotal } = cartTotals(items);
  const discount = Math.min(couponDiscount, subtotal);
  const shipping = items.length === 0 || subtotal - discount >= FREE_SHIPPING_OVER ? 0 : 5.99;
  const total = Math.max(0, subtotal - discount + shipping);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    instructions: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const { currency, setCurrency, info } = useCurrency();

  useEffect(() => {
    if (!user) {
      navigate("/login?next=/checkout");
      return;
    }
    setForm((f) => ({ ...f, name: user.name, phone: user.phone ?? "" }));
    void api<{ items: Address[] }>("/auth/addresses").then((r) => {
      setAddresses(r.items);
      const def = r.items.find((a) => a.isDefault) ?? r.items[0];
      if (def) {
        setForm((f) => ({
          ...f,
          name: def.fullName,
          phone: def.phone,
          country: def.country,
          city: def.city,
          address: def.address,
          instructions: def.instructions ?? "",
        }));
      }
    }).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="container-kajok py-12">
        <PageHeader title={t("checkout.title")} />
        <div className="card-kajok p-8 text-center">
          <p className="text-slate-500">{t("cart.empty")}</p>
          <Link to="/products" className="btn-primary mt-5 inline-flex px-6 py-3">
            {t("cart.continueShopping")}
          </Link>
        </div>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="container-kajok py-12">
        <div className="card-kajok mx-auto max-w-lg p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12l5 5L20 6" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold">{t("checkout.orderPlaced")}</h1>
          <p className="mt-3 text-slate-500">
            {t("checkout.orderPlacedText")}{" "}
            <span className="font-bold text-royal">{placedOrder.reference}</span>
          </p>
          <div className="mt-4 rounded-lg bg-surface p-4 text-sm">
            <p className="font-semibold">{t("common.total")}: {formatMoney(placedOrder.total, placedOrder.currency ?? "EGP", lang)}</p>
            {(placedOrder.currency ?? "EGP") === "SDG" && (
              <p className="mt-1 text-xs text-slate-500">{t("currency.rateApplied", { rate: placedOrder.exchangeRate })}</p>
            )}
            <p className="mt-1 text-slate-500">{placedOrder.paymentMethod === "cod" ? t("checkout.cod") : t("checkout.online")}</p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link to={`/orders/track?ref=${placedOrder.reference}`} className="btn-primary py-3">
              {t("checkout.trackIt")}
            </Link>
            <Link to="/products" className="btn-secondary py-3">
              {t("cart.continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const { order } = await api<{ order: Order }>("/orders", {
        method: "POST",
        body: {
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          customer: {
            name: form.name,
            phone: form.phone,
            country: form.country,
            city: form.city,
            address: form.address,
            instructions: form.instructions || null,
          },
          paymentMethod,
          couponCode: couponCode ?? null,
          currency: currency === "SDG" && info.rate ? "SDG" : "EGP",
        },
      });
      clear();
      setPlacedOrder(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setPlacing(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="container-kajok py-8">
      <PageHeader title={t("checkout.title")} />

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {addresses.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-bold">{t("account.savedAddresses")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => {
                  const selected = form.address === a.address && form.city === a.city;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          name: a.fullName,
                          phone: a.phone,
                          country: a.country,
                          city: a.city,
                          address: a.address,
                          instructions: a.instructions ?? "",
                        }))
                      }
                      className={`rounded-lg border p-4 text-start ${selected ? "border-royal bg-surface" : "border-line bg-white hover:border-accent"}`}
                    >
                      <p className="text-sm font-bold">{a.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{a.fullName} · {a.city}, {a.country}</p>
                      <p className="mt-1 text-xs text-slate-500">{a.address}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card-kajok p-6">
            <h2 className="text-lg font-bold">{t("checkout.deliveryDetails")}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-name" className="label-kajok">{t("checkout.fullName")}</label>
                <input id="co-name" required minLength={2} value={form.name} onChange={set("name")} className="input-kajok" />
              </div>
              <div>
                <label htmlFor="co-phone" className="label-kajok">{t("checkout.phone")}</label>
                <input id="co-phone" required minLength={6} value={form.phone} onChange={set("phone")} className="input-kajok" dir="ltr" />
              </div>
              <div>
                <label htmlFor="co-country" className="label-kajok">{t("checkout.country")}</label>
                <input id="co-country" required value={form.country} onChange={set("country")} className="input-kajok" />
              </div>
              <div>
                <label htmlFor="co-city" className="label-kajok">{t("checkout.city")}</label>
                <input id="co-city" required value={form.city} onChange={set("city")} className="input-kajok" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-address" className="label-kajok">{t("checkout.address")}</label>
                <input id="co-address" required minLength={5} value={form.address} onChange={set("address")} className="input-kajok" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-instructions" className="label-kajok">
                  {t("checkout.instructions")} <span className="text-slate-400">({t("common.optional")})</span>
                </label>
                <textarea
                  id="co-instructions"
                  rows={3}
                  value={form.instructions}
                  onChange={set("instructions")}
                  placeholder={t("checkout.instructionsPlaceholder")}
                  className="input-kajok resize-none"
                />
              </div>
            </div>
          </div>

          <div className="card-kajok p-6">
            <h2 className="text-lg font-bold">{t("currency.title")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCurrency("EGP")}
                className={`rounded-lg border p-4 text-start transition-colors ${currency === "EGP" ? "border-royal bg-surface" : "border-line hover:border-slate-300"}`}
              >
                <span className="block font-semibold">🇪🇬 {t("currency.egp")}</span>
                <span className="text-xs text-slate-500">{t("currency.default")}</span>
              </button>
              <button
                type="button"
                onClick={() => info.rate && setCurrency("SDG")}
                disabled={!info.rate}
                title={info.rate ? undefined : t("currency.noRate")}
                className={`rounded-lg border p-4 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${currency === "SDG" && info.rate ? "border-royal bg-surface" : "border-line hover:border-slate-300"}`}
              >
                <span className="block font-semibold">🇸🇩 {t("currency.sdg")}</span>
                <span className="text-xs text-slate-500">{info.rate ? `1 ${t("currency.egp")} = ${info.rate} ${t("currency.sdg")}` : t("currency.noRate")}</span>
              </button>
            </div>
          </div>

          <div className="card-kajok p-6">
            <h2 className="text-lg font-bold">{t("checkout.paymentMethod")}</h2>
            <div className="mt-4 space-y-3">
              <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${paymentMethod === "cod" ? "border-royal bg-surface" : "border-line"}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold">{t("checkout.cod")}</span>
                  <span className="mt-1 block text-sm text-slate-500">{t("checkout.codDesc")}</span>
                </span>
              </label>
              <label className="flex cursor-not-allowed items-start gap-3 rounded-lg border border-line p-4 opacity-60">
                <input type="radio" name="payment" disabled className="mt-1" />
                <span>
                  <span className="block font-semibold">{t("checkout.online")}</span>
                  <span className="mt-1 block text-sm text-slate-500">{t("checkout.onlineUnavailable")}</span>
                </span>
              </label>
            </div>
            <p className="mt-4 rounded-lg bg-surface px-3.5 py-2.5 text-xs text-slate-500">
              {t("product.secureTransaction")} — {t("home.securePaymentText")}
            </p>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="card-kajok p-5">
            <h2 className="text-lg font-bold">{t("checkout.orderSummary")}</h2>
            <ul className="mt-4 space-y-3">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3">
                  <img src={i.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{pick(i.nameEn, i.nameAr)}</p>
                    <p className="text-xs text-slate-500">× {i.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice((i.discountPrice ?? i.price) * i.quantity, lang)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
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

            {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}

            <button type="submit" disabled={placing} className="btn-primary mt-5 w-full py-3 text-base">
              {placing ? t("checkout.placingOrder") : `${t("checkout.placeOrder")} — ${formatPrice(total, lang)}`}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
