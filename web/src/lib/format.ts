export function formatPrice(value: number, lang: "en" | "ar" = "en"): string {
  const formatted = value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return lang === "ar" ? `${formatted} $` : `$${formatted}`;
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
