import type { ReactNode } from "react";
import { useI18n } from "../i18n/I18nProvider";
import { discountPercent, formatPrice } from "../lib/format";
import type { Product } from "../lib/types";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-10 ${className}`} role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-royal" />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-white px-6 py-16 text-center">
      <div className="mb-4 text-accent">{icon ?? <EmptyBoxIcon />}</div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {text && <p className="mt-2 max-w-md text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function EmptyBoxIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

export function Rating({ value, count }: { value: number; count?: number }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center gap-1.5" aria-label={`${t("common.rating")}: ${value}`}>
      <Stars value={value} />
      <span className="text-xs font-semibold text-ink">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-slate-400">({count})</span>}
    </div>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= Math.round(value) ? "#F5B301" : "#E9E4F4"}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

export function Price({ product, size = "md" }: { product: Pick<Product, "price" | "discountPrice">; size?: "sm" | "md" | "lg" }) {
  const { lang } = useI18n();
  const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price;
  const sizes = {
    sm: { current: "text-sm", old: "text-xs" },
    md: { current: "text-base", old: "text-sm" },
    lg: { current: "text-2xl", old: "text-base" },
  }[size];
  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-bold text-ink ${sizes.current}`}>{formatPrice(product.discountPrice ?? product.price, lang)}</span>
      {hasDiscount && <span className={`text-slate-400 line-through ${sizes.old}`}>{formatPrice(product.price, lang)}</span>}
    </div>
  );
}

export function DiscountBadge({ product }: { product: Pick<Product, "price" | "discountPrice"> }) {
  const { t } = useI18n();
  const pct = discountPercent(product.price, product.discountPrice);
  if (!pct) return null;
  return <span className="badge-kajok bg-red-600 text-white">{t("common.off", { n: pct })}</span>;
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">{subtitle}</p>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {idx > 0 && <span className="text-slate-300">/</span>}
            {item.to ? (
              <a href={item.to} className="hover:text-royal">
                {item.label}
              </a>
            ) : (
              <span className="font-medium text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function QuantityStepper({
  value,
  onChange,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-line">
      <button
        type="button"
        className="px-3 py-1.5 text-slate-500 hover:text-royal"
        onClick={() => onChange(value - 1)}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-9 text-center text-sm font-semibold">{value}</span>
      <button
        type="button"
        className="px-3 py-1.5 text-slate-500 hover:text-royal"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
