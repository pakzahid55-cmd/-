import { hostedPreview } from "../lib/preview";
import type { CheckoutQuote as Quote, DeliveryCountry } from "../../../shared/checkout";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import { formatMoney, formatPrice } from "../lib/format";
import { useCurrency } from "../store/currency";
import type { Address, Order } from "../lib/types";
import { useAuth } from "../store/auth";
import { useCart } from "../store/cart";

const getCountry = (value: string) => ["sudan", "sd", "السودان"].includes(value.toLowerCase()) ? "Sudan" : "Egypt";

export function CheckoutPage() {
  const { t, pick, lang } = useI18n();
  const navigate = useNavigate();
  const { user, initialized } = useAuth();
  const { items, couponCode, clear } = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [quoteVersion, refreshQuote] = useState(0);
  const inFlight = useRef(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    country: "Egypt" as DeliveryCountry,
    area: "",
    city: "",
    address: "",
    instructions: "",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const { currency, setCurrency, info } = useCurrency();

  useEffect(() => {
    if (!initialized) return;
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
          country: getCountry(def.country),
          city: def.city,
          address: def.address,
          instructions: def.instructions ?? "",
        }));
      }
    }).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, initialized, navigate]);

  useEffect(() => {
    if (!user) return;
    const storageKey = `kujuk.checkout.${user.id}`;
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return;
    const abort = new AbortController();
    try {
      const { key } = JSON.parse(raw);
      void api<{ order: Order | null }>(`/orders/recovery/${encodeURIComponent(key)}`, { signal: abort.signal }).then(({ order }) => {
        if (!order || abort.signal.aborted) return;
        sessionStorage.removeItem(storageKey);
        setPlacedOrder(order);
        clear();
      }).catch(() => undefined);
    } catch { sessionStorage.removeItem(storageKey); }
    return () => abort.abort();
  }, [user, clear]);

  const payload = JSON.stringify({ items: items.map(({ productId, quantity }) => ({ productId, quantity })), country: form.country, couponCode: couponCode ?? null, currency: currency === "SDG" && info.rate ? "SDG" : "EGP" });
  useEffect(() => {
    setQuote(null);
    setQuoteError("");
    if (!user || !items.length || placedOrder) return;
    const controller = new AbortController();
    void api<Quote>("/orders/quote", { method: "POST", body: JSON.parse(payload), signal: controller.signal })
      .then((q) => { if (!controller.signal.aborted) setQuote(q); })
      .catch((e) => { if (!controller.signal.aborted) setQuoteError(e.message); });
    return () => controller.abort();
  }, [payload, user, items.length, placedOrder, quoteVersion]);

  const formatQuote = (amount: number) => formatMoney(amount, quote?.currency ?? "EGP", lang);

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="container-kujuk py-12">
        <PageHeader title={t("checkout.title")} />
        <div className="card-kujuk p-8 text-center">
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
      <div className="container-kujuk py-12">
        <div className="card-kujuk mx-auto max-w-lg p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 12l5 5L20 6" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold">{t("checkout.orderPlaced")}</h1>
          <p className="mt-3 text-slate-500">
            {t("checkout.orderPlacedText")}{" "}
            <span className="break-all font-bold text-royal" dir="ltr">{placedOrder.reference}</span>
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
    if (!quote || inFlight.current || !user) return;
    inFlight.current = true;
    setPlacing(true);
    setError("");
    try {
      const { country: _country, ...basket } = JSON.parse(payload);
      const body = { ...basket, customer: { ...form, area: form.area || undefined, instructions: form.instructions || null }, paymentMethod: "cod", expectedTotal: quote.total };
      // Store only a SHA-256 fingerprint + request ID, never the address or phone.
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(body)));
      const fingerprint = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      const storageKey = `kujuk.checkout.${user.id}`;
      const pending = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      const key = pending?.fingerprint === fingerprint ? pending.key : crypto.randomUUID();
      sessionStorage.setItem(storageKey, JSON.stringify({ key, fingerprint }));
      const { order } = await api<{ order: Order }>("/orders", { method: "POST", headers: { "Idempotency-Key": key }, body });
      sessionStorage.removeItem(storageKey);
      setPlacedOrder(order);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
      if ((err as { status?: number }).status === 409) refreshQuote(v => v + 1);
    } finally {
      inFlight.current = false;
      setPlacing(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="container-kujuk py-8">
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
                          country: getCountry(a.country),
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

          <div className="card-kujuk p-6">
            <h2 className="text-lg font-bold">{t("checkout.deliveryDetails")}</h2>
            {hostedPreview && <button type="button" className="btn-secondary mt-3 px-4 py-2" onClick={() => setForm(f => ({ ...f, name: 'KUJUK Test', phone: '+201000000000', city: f.country === 'Sudan' ? 'Khartoum' : 'Cairo', area: 'Test district', address: '10 Test Street', instructions: '' }))}>{pick('Fill with sample details', 'املأ ببيانات وهمية')}</button>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="co-name" className="label-kujuk">{t("checkout.fullName")}</label>
                <input id="co-name" required minLength={2} value={form.name} onChange={set("name")} className="input-kujuk" />
              </div>
              <div>
                <label htmlFor="co-phone" className="label-kujuk">{t("checkout.phone")}</label>
                <input id="co-phone" required minLength={6} value={form.phone} onChange={set("phone")} className="input-kujuk" dir="ltr" />
              </div>
              <div>
                <label htmlFor="co-country" className="label-kujuk">{t("checkout.country")}</label>
                <select id="co-country" value={form.country} onChange={set("country")} className="input-kujuk"><option value="Egypt">{pick("Egypt", "مصر")}</option><option value="Sudan">{pick("Sudan", "السودان")}</option></select>
              </div>
              <div>
                <label htmlFor="co-city" className="label-kujuk">{t("checkout.city")}</label>
                <input id="co-city" required value={form.city} onChange={set("city")} className="input-kujuk" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-area" className="label-kujuk">{pick("Area / district", "المنطقة / الحي")}</label>
                <input id="co-area" minLength={2} maxLength={80} value={form.area} onChange={set("area")} className="input-kujuk" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-address" className="label-kujuk">{t("checkout.address")}</label>
                <input id="co-address" required minLength={5} value={form.address} onChange={set("address")} className="input-kujuk" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-instructions" className="label-kujuk">
                  {t("checkout.instructions")} <span className="text-slate-400">({t("common.optional")})</span>
                </label>
                <textarea
                  id="co-instructions"
                  rows={3}
                  value={form.instructions}
                  onChange={set("instructions")}
                  placeholder={t("checkout.instructionsPlaceholder")}
                  className="input-kujuk resize-none"
                />
              </div>
            </div>
          </div>

          <div className="card-kujuk p-6">
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

          <div className="card-kujuk p-6">
            <h2 className="text-lg font-bold">{t("checkout.paymentMethod")}</h2>
            <div className="mt-4 rounded-lg border border-royal bg-surface p-4"><strong>{t("checkout.cod")}</strong><p className="mt-1 text-sm text-slate-500">{t("checkout.codDesc")}</p></div>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="card-kujuk p-5">
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
            {quote ? <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">{t("common.subtotal")}</dt>
                <dd className="font-semibold">{formatQuote(quote.subtotal)}</dd>
              </div>
              {quote.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt>{t("common.discount")}</dt>
                  <dd className="font-semibold">−{formatQuote(quote.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-slate-500">{t("common.shipping")}</dt>
                <dd className="font-semibold">{quote.shipping === 0 ? t("common.free") : formatQuote(quote.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-bold">{t("common.total")}</dt>
                <dd className="font-bold text-royal">{formatQuote(quote?.total ?? 0)}</dd>
              </div>
            </dl> : <p className="mt-4 text-sm text-slate-500" role="status">{quoteError || t("common.loading")}</p>}
            {quoteError && <button type="button" className="mt-2 text-sm font-bold text-royal" onClick={() => refreshQuote(v => v + 1)}>{t("common.retry")}</button>}
            {quote && quote.shipments > 1 && <p className="mt-3 text-xs text-slate-500">{pick(`${quote.shipments} separate shipments`, `${quote.shipments} شحنات منفصلة`)}</p>}

            {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}

            <button type="submit" disabled={placing || !quote || !user} className="btn-primary mt-5 w-full py-3 text-base">
              {placing ? t("checkout.placingOrder") : quote ? `${t("checkout.placeOrder")} — ${formatQuote(quote.total)}` : t("checkout.placeOrder")}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
