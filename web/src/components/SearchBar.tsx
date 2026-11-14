import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import type { Brand, Category } from "../lib/types";

interface SuggestResponse {
  products: { slug: string; nameEn: string; nameAr: string; image: string; price: number; discountPrice: number | null }[];
  categories: Category[];
  brands: Brand[];
}

export function SearchBar({ onNavigate }: { onNavigate?: () => void }) {
  const { t, pick, lang } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    window.clearTimeout(debounce.current);
    if (query.trim().length < 2) {
      setSuggestions(null);
      return;
    }
    setLoading(true);
    debounce.current = window.setTimeout(async () => {
      try {
        const data = await api<SuggestResponse>(`/products/suggest?q=${encodeURIComponent(query.trim())}`, { auth: false });
        setSuggestions(data);
        setOpen(true);
      } catch {
        setSuggestions(null);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => window.clearTimeout(debounce.current);
  }, [query]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onNavigate?.();
  };

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    navigate(to);
    onNavigate?.();
  };

  const hasResults =
    suggestions && (suggestions.products.length || suggestions.categories.length || suggestions.brands.length);

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} role="search">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions && setOpen(true)}
            placeholder={t("nav.searchPlaceholder")}
            aria-label={t("common.search")}
            className="input-kajok pe-10"
          />
          <button
            type="submit"
            aria-label={t("common.search")}
            className="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 hover:text-royal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </button>
        </div>
      </form>

      {open && (hasResults || loading) && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-lg border border-line bg-white shadow-lift">
          {loading && <div className="px-4 py-3 text-sm text-slate-400">{t("common.loading")}</div>}
          {suggestions?.products.length ? (
            <ul>
              {suggestions.products.map((p) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => go(`/product/${p.slug}`)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-start hover:bg-surface"
                  >
                    <img src={p.image} alt="" className="h-10 w-10 rounded-md object-cover" />
                    <span className="flex-1 truncate text-sm text-ink">{pick(p.nameEn, p.nameAr)}</span>
                    <span className="text-xs font-semibold text-royal">${(p.discountPrice ?? p.price).toFixed(2)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {(suggestions?.categories.length || suggestions?.brands.length) ? (
            <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
              {suggestions?.categories.map((c) => (
                <button key={c.slug} type="button" onClick={() => go(`/products?category=${c.slug}`)} className="badge-kajok bg-surface text-deep hover:bg-accent/20">
                  {pick(c.nameEn, c.nameAr)}
                </button>
              ))}
              {suggestions?.brands.map((b) => (
                <button key={b.slug} type="button" onClick={() => go(`/products?brand=${b.slug}`)} className="badge-kajok bg-surface text-deep hover:bg-accent/20">
                  {b.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
