import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, SearchX, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import type { Product } from '../lib/price';
import { useI18n } from '../i18n/I18nContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';

interface Brand { id: number; name: string }

export default function Search() {
  const { lang, t } = useI18n();
  const { currency } = useCurrency();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const brand = params.get('brand') || '';
  const sort = params.get('sort') || 'newest';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const onSale = params.get('on_sale') || '';
  const featured = params.get('featured') || '';
  const page = Math.max(1, Number(params.get('page') || '1'));

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);

  const title = q ? t('resultsFor', { q }) : category ? category : brand ? brand : onSale ? t('deals') : t('searchTitle');

  useEffect(() => { api<{ brands: Brand[] }>('/brands').then(d => setBrands(d.brands)).catch(() => {}); }, []);
  useEffect(() => { setMinInput(minPrice); setMaxInput(maxPrice); }, [minPrice, maxPrice]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (category) p.set('category', category);
    if (brand) p.set('brand', brand);
    if (sort) p.set('sort', sort);
    if (minPrice) p.set('minPrice', minPrice);
    if (maxPrice) p.set('maxPrice', maxPrice);
    if (onSale) p.set('on_sale', onSale);
    if (featured) p.set('featured', featured);
    p.set('page', String(page));
    p.set('limit', '24');
    p.set('currency', currency);
    return p.toString();
  }, [q, category, brand, sort, minPrice, maxPrice, onSale, featured, page, currency]);

  useEffect(() => {
    setLoading(true);
    api<{ products: Product[]; total: number; pages: number }>(`/products?${queryString}`)
      .then(d => { setProducts(d.products); setTotal(d.total); setPages(d.pages || 1); })
      .catch(() => { setProducts([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [queryString]);

  // Fallback suggestions when nothing matches
  useEffect(() => {
    if (!loading && total === 0) {
      api<{ products: Product[] }>(`/products?bestseller=1&limit=6&currency=${currency}`).then(d => setSuggestions(d.products)).catch(() => {});
    }
  }, [loading, total, currency]);

  const update = (patch: Record<string, string>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) p.set(k, v); else p.delete(k);
    }
    if (!('page' in patch)) p.set('page', '1');
    setParams(p, { replace: true });
  };

  const applyPrice = () => update({ minPrice: minInput, maxPrice: maxInput });
  const clearFilters = () => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    p.set('sort', 'newest');
    setParams(p, { replace: true });
  };

  const Arrow = lang === 'ar' ? ChevronRight : ChevronLeft;
  const ArrowBack = lang === 'ar' ? ChevronLeft : ChevronRight;

  const filterPanel = (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <label className="text-xs font-extrabold text-kajok-deep uppercase tracking-wide">{t('sortBy')}</label>
        <select className="styled w-full mt-2" value={sort} onChange={e => update({ sort: e.target.value })}>
          <option value="newest">{t('sort_newest')}</option>
          <option value="oldest">{t('sort_oldest')}</option>
          <option value="price_asc">{t('sort_price_asc')}</option>
          <option value="price_desc">{t('sort_price_desc')}</option>
          <option value="bestselling">{t('sort_bestselling')}</option>
          <option value="rating">{t('sort_rating')}</option>
          <option value="discount">{t('sort_discount')}</option>
        </select>
      </div>
      {/* Price */}
      <div>
        <span className="text-xs font-extrabold text-kajok-deep uppercase tracking-wide">{t('minPrice')} / {t('maxPrice')} ({currency === 'EGP' ? 'ج.م.' : 'ج.س.'})</span>
        <div className="flex items-center gap-2 mt-2">
          <input inputMode="numeric" value={minInput} onChange={e => setMinInput(e.target.value)} placeholder="0" className="w-full h-10 px-3 rounded-lg border border-kajok-soft outline-none text-sm focus:border-kajok-royal" />
          <span className="text-kajok-muted">—</span>
          <input inputMode="numeric" value={maxInput} onChange={e => setMaxInput(e.target.value)} placeholder="∞" className="w-full h-10 px-3 rounded-lg border border-kajok-soft outline-none text-sm focus:border-kajok-royal" />
        </div>
        <button onClick={applyPrice} className="mt-2 w-full h-10 rounded-lg bg-kajok-deep text-white text-sm font-bold hover:bg-kajok-royal transition-colors">{t('apply')}</button>
      </div>
      {/* Brands */}
      <div>
        <span className="text-xs font-extrabold text-kajok-deep uppercase tracking-wide">{t('brandFilter')}</span>
        <div className="mt-2 flex flex-wrap lg:flex-col gap-1.5 max-h-56 overflow-y-auto">
          <button onClick={() => update({ brand: '' })} className={`text-xs px-3 py-2 rounded-lg border text-start font-semibold transition-colors ${!brand ? 'border-kajok-royal bg-kajok-soft text-kajok-deep' : 'border-kajok-soft text-kajok-muted hover:border-kajok-accent'}`}>{t('allCategories')}</button>
          {brands.map(b => (
            <button key={b.id} onClick={() => update({ brand: b.name })} className={`text-xs px-3 py-2 rounded-lg border text-start font-semibold transition-colors ${brand === b.name ? 'border-kajok-royal bg-kajok-soft text-kajok-deep' : 'border-kajok-soft text-kajok-muted hover:border-kajok-accent'}`}>{b.name}</button>
          ))}
        </div>
      </div>
      <button onClick={clearFilters} className="text-xs font-bold text-kajok-royal hover:underline">{t('clearFilters')}</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 border-b border-kajok-soft pb-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-kajok-deep clamp-1">{title}</h1>
          <p className="text-xs text-kajok-muted">{total} {lang === 'ar' ? 'منتج' : 'products'}</p>
        </div>
        <button onClick={() => setShowFilters(v => !v)} className="lg:hidden flex items-center gap-1.5 h-10 px-4 rounded-xl border border-kajok-soft bg-white text-sm font-bold text-kajok-deep">
          <SlidersHorizontal size={16} />{t('filters')}
          {showFilters && <X size={16} />}
        </button>
      </div>

      <div className="flex gap-6 mt-4">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">{filterPanel}</aside>
        {/* Mobile filters */}
        {showFilters && <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h2 className="font-extrabold text-kajok-deep">{t('filters')}</h2><button onClick={() => setShowFilters(false)} aria-label={t('close')}><X size={20} /></button></div>
            {filterPanel}
          </div>
        </div>}

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/5]" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-14">
              <SearchX size={56} className="mx-auto text-kajok-accent" strokeWidth={1.4} />
              <h2 className="mt-4 text-xl font-black text-kajok-deep">{t('noResultsTitle')}</h2>
              <p className="mt-1 text-sm text-kajok-muted">{t('noResultsSub')}</p>
              {suggestions.length > 0 && (
                <div className="mt-8 text-start">
                  <h3 className="text-sm font-extrabold text-kajok-deep mb-2">{t('suggestions')}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{suggestions.map(p => <ProductCard key={p.id} product={p} />)}</div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} className="w-10 h-10 grid place-items-center rounded-lg border border-kajok-soft disabled:opacity-30"><ArrowBack size={18} /></button>
                  <span className="text-sm font-bold text-kajok-deep px-3">{page} / {pages}</span>
                  <button disabled={page >= pages} onClick={() => update({ page: String(page + 1) })} className="w-10 h-10 grid place-items-center rounded-lg border border-kajok-soft disabled:opacity-30"><Arrow size={18} /></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
