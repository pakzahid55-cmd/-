// Client-side price formatting for display. The SERVER is authoritative for
// order totals; these helpers mirror the same rules for consistent rendering.
export type Currency = 'EGP' | 'SDG';

export interface PublicSettings {
  egpEnabled: boolean;
  sdgEnabled: boolean;
  defaultCountry: 'EG' | 'SD';
  defaultCurrency: Currency;
  exchangeRate: number;
  marginPercent: number;
  shippingEG: number;
  shippingSD: number;
  minOrderEG: number;
  minOrderSD: number;
  rateUpdatedAt: string;
  rateSource: string;
}

export const DEFAULT_SETTINGS: PublicSettings = {
  egpEnabled: true, sdgEnabled: true, defaultCountry: 'EG', defaultCurrency: 'EGP',
  exchangeRate: 68, marginPercent: 2, shippingEG: 50, shippingSD: 5000,
  minOrderEG: 100, minOrderSD: 10000, rateUpdatedAt: '', rateSource: 'manual',
};

export interface Product {
  id: number; sku: string;
  name_ar: string; name_en: string;
  description_ar: string; description_en: string;
  category_id: number | null; category_slug?: string;
  category_name_ar?: string; category_name_en?: string;
  brand_id: number | null; brand_name?: string;
  price: number; base_price: number;
  price_egp: number; price_sdg: number | null; price_mode: string;
  discount_percent: number; stock: number; image: string; specs: Record<string, string>;
  featured: boolean; bestseller: boolean; new_arrival: boolean;
  sold_count: number; rating: number; review_count: number; created_at: string;
  currency: Currency; converted: boolean; exchange_rate: number | null;
}

export function formatPrice(amount: number, currency: Currency, lang: 'ar' | 'en'): string {
  const rounded = currency === 'SDG' ? Math.round(amount) : Math.round(amount * 100) / 100;
  const formatted = rounded.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG', { maximumFractionDigits: currency === 'SDG' ? 0 : 2 });
  if (lang === 'ar') return `${formatted} ${currency === 'EGP' ? 'ج.م.' : 'ج.س.'}`;
  return `${formatted} ${currency}`;
}

export function effectiveRate(s: PublicSettings): number {
  return s.exchangeRate * (1 + s.marginPercent / 100);
}

export function shippingFor(country: 'EG' | 'SD', s: PublicSettings): number {
  return country === 'SD' ? s.shippingSD : s.shippingEG;
}

export function minOrderFor(country: 'EG' | 'SD', s: PublicSettings): number {
  return country === 'SD' ? s.minOrderSD : s.minOrderEG;
}
