/**
 * Money & date formatting.
 *
 * Product/catalog prices are stored in EGP (base currency). `formatPrice`
 * converts them for display using the CURRENT manually-entered exchange rate.
 * Historical orders store their own currency + applied rate — format those with
 * `formatMoney(value, order.currency)` so history is never re-converted.
 */

export type Currency = "EGP" | "SDG";

let current: { currency: Currency; rate: number | null } = { currency: "EGP", rate: null };

/** Called by the currency store whenever selection or rate changes. */
export function setCurrentCurrency(currency: Currency, rate: number | null): void {
  current = { currency, rate };
}

export function canUseCurrency(currency: Currency, rate: number | null): boolean {
  return currency === "EGP" || (rate !== null && rate > 0);
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Format a raw amount that is ALREADY in the given currency (e.g. historical orders). */
export function formatMoney(value: number, currency: Currency, lang: "en" | "ar" = "en"): string {
  const n = formatNumber(value);
  if (lang === "ar") return currency === "SDG" ? `${n} ج.س` : `${n} ج.م`;
  return currency === "SDG" ? `SDG ${n}` : `EGP ${n}`;
}

/** Convert an EGP base amount to the currently selected currency. */
export function convertFromEgp(valueEgp: number): { value: number; currency: Currency } {
  if (current.currency === "SDG" && current.rate) {
    return { value: Math.round(valueEgp * current.rate * 100) / 100, currency: "SDG" };
  }
  return { value: valueEgp, currency: "EGP" };
}

/** Format an EGP base amount in the currently selected currency (catalog/cart/checkout). */
export function formatPrice(valueEgp: number, lang: "en" | "ar" = "en"): string {
  const { value, currency } = convertFromEgp(valueEgp);
  return formatMoney(value, currency, lang);
}

export function formatDate(iso: string, lang: "en" | "ar" = "en"): string {
  return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function discountPercent(price: number, discountPrice: number | null): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}
