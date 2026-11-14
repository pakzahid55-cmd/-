import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Globe, ChevronDown, Menu, X, PhoneCall, Truck, Banknote, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { api } from '../lib/api';
import type { Product } from '../lib/price';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency, type Country } from '../context/CurrencyContext';

interface Category { id: number; name_ar: string; name_en: string; slug: string }

export default function Header() {
  const { lang, setLang, t } = useI18n();
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { currency, country, settings, setCurrency, setCountry, fmt } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const suggestRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    api<{ categories: Category[] }>('/categories').then(d => setCategories(d.categories)).catch(() => {});
  }, []);

  // Close suggest on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (!suggestRef.current?.contains(e.target as Node)) setShowSuggest(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setShowMobileMenu(false); setShowMobileSearch(false); setShowSuggest(false); }, [location.pathname]);

  // Debounced live suggestions
  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) { setSuggestions([]); return; }
    debounceRef.current = window.setTimeout(() => {
      api<{ suggestions: Product[] }>(`/search/suggest?q=${encodeURIComponent(q)}&currency=${currency}`)
        .then(d => setSuggestions(d.suggestions))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => window.clearTimeout(debounceRef.current);
  }, [query, currency]);

  const submitSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    setShowSuggest(false);
  };

  const pickSuggestion = (p: Product) => { setQuery(''); setShowSuggest(false); navigate(`/product/${p.id}`); };

  const marketCurrencyLabel: Record<string, string> = { EGP: 'EGP · ج.م.', SDG: 'SDG · ج.س.' };

  const searchBox = (
    <form onSubmit={submitSearch} className="relative flex-1" ref={suggestRef}>
      <div className="flex items-stretch h-11 rounded-xl overflow-hidden border-2 border-kajok-royal/90 focus-within:border-kajok-deep bg-white shadow-card">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSuggest(true); }}
          onFocus={() => setShowSuggest(true)}
          type="text"
          role="combobox"
          aria-expanded={showSuggest}
          aria-label={t('searchPlaceholder')}
          placeholder={t('searchPlaceholder')}
          className="flex-1 min-w-0 px-3 sm:px-4 text-sm bg-transparent outline-none placeholder:text-kajok-muted"
        />
        <button type="submit" aria-label={t('search')} className="px-3 sm:px-5 bg-kajok-royal text-white hover:bg-kajok-deep transition-colors grid place-items-center">
          <Search size={19} strokeWidth={2.4} />
        </button>
      </div>

      {showSuggest && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 start-0 end-0 z-50 bg-white rounded-card shadow-lift border border-kajok-soft overflow-hidden max-h-[26rem] overflow-y-auto">
          {suggestions.map(p => (
            <button key={p.id} onClick={() => pickSuggestion(p)} className="flex items-center gap-3 w-full p-2 hover:bg-kajok-bg text-start transition-colors">
              <img src={p.image} alt="" className="w-12 h-12 object-contain rounded-lg bg-kajok-bg" loading="lazy" onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
              <span className="flex-1 min-w-0">
                <span className="clamp-1 text-[13px] font-semibold">{lang === 'ar' ? p.name_ar : p.name_en}</span>
                <span className="text-[11px] text-kajok-muted">{p.brand_name}</span>
              </span>
              <span className="text-[13px] font-extrabold text-kajok-deep">{fmt(p.price)}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );

  return (
    <header className="sticky top-0 z-40">
      {/* Top utility bar */}
      <div className="bg-kajok-deep text-white text-[11px] sm:text-[11.5px]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <span className="flex items-center gap-1.5 whitespace-nowrap"><Truck size={13} className="text-kajok-accent" />{t('usp1Title')}</span>
            <span className="hidden sm:flex items-center gap-1.5 whitespace-nowrap"><Banknote size={13} className="text-kajok-accent" />{t('usp2Title')}</span>
            <span className="hidden md:flex items-center gap-1.5 whitespace-nowrap"><ShieldCheck size={13} className="text-kajok-accent" />{t('usp3Title')}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:19000" className="flex items-center gap-1.5 hover:text-kajok-accent transition-colors whitespace-nowrap"><PhoneCall size={13} />19000</a>
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="flex items-center gap-1.5 hover:text-kajok-accent transition-colors whitespace-nowrap font-bold" aria-label="Switch language">
              <Globe size={13} />{t('language')}
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white/95 backdrop-blur border-b border-kajok-soft">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="h-16 flex items-center gap-2 sm:gap-4">
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 -ms-2 text-kajok-deep" onClick={() => setShowMobileMenu(v => !v)} aria-label="Menu">
              {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0" aria-label="KAJOK">
              <img src="/logo.jpg" alt="KAJOK — Your Order. Your Way." className="h-11 sm:h-12 w-auto object-contain rounded-lg" />
            </Link>

            {/* Desktop search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-2">{searchBox}</div>

            {/* Market / currency selectors (desktop) */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <select className="styled" value={country} onChange={e => setCountry(e.target.value as Country)} aria-label={t('countryLabel')}>
                <option value="EG">🇪🇬 {t('Egypt')}</option>
                <option value="SD">🇸🇩 {t('Sudan')}</option>
              </select>
              <select className="styled" value={currency} onChange={e => setCurrency(e.target.value as 'EGP' | 'SDG')} aria-label={t('currencyLabel')}>
                {settings.egpEnabled && <option value="EGP">{marketCurrencyLabel.EGP}</option>}
                {settings.sdgEnabled && <option value="SDG">{marketCurrencyLabel.SDG}</option>}
              </select>
            </div>

            {/* Action icons */}
            <nav className="flex items-center gap-0.5 sm:gap-1.5 ms-auto shrink-0">
              <button className="md:hidden p-2 text-kajok-deep" onClick={() => setShowMobileSearch(v => !v)} aria-label={t('search')}>
                <Search size={21} />
              </button>
              <Link to="/wishlist" className="relative p-2 text-kajok-deep hover:text-kajok-royal transition-colors" aria-label={t('wishlist')}>
                <Heart size={21} />
                {wishCount > 0 && <span className="absolute top-0.5 end-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold grid place-items-center">{wishCount}</span>}
              </Link>
              <Link to="/cart" className="relative p-2 text-kajok-deep hover:text-kajok-royal transition-colors" aria-label={t('cart')}>
                <ShoppingCart size={21} />
                {count > 0 && <span className="absolute top-0.5 end-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-kajok-royal text-white text-[9px] font-bold grid place-items-center">{count}</span>}
              </Link>
              {user ? (
                <Link to="/account" className="p-2 text-kajok-deep hover:text-kajok-royal transition-colors" aria-label={t('account')}>
                  <User size={21} />
                </Link>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-1.5 ms-1 bg-kajok-deep text-white text-xs font-bold px-4 h-9 rounded-lg hover:bg-kajok-royal transition-colors">
                  <User size={15} />{t('login')}
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="p-2 text-kajok-royal hover:text-kajok-deep transition-colors" aria-label={t('adminPanel')} title={t('adminPanel')}>
                  <LayoutDashboard size={20} />
                </Link>
              )}
            </nav>
          </div>

          {/* Mobile search row */}
          {showMobileSearch && <div className="md:hidden pb-2">{searchBox}</div>}

          {/* Mobile market/currency row */}
          <div className="lg:hidden flex md:hidden items-center gap-2 pb-2">
            <select className="styled flex-1" value={country} onChange={e => setCountry(e.target.value as Country)} aria-label={t('countryLabel')}>
              <option value="EG">🇪🇬 {t('Egypt')}</option>
              <option value="SD">🇸🇩 {t('Sudan')}</option>
            </select>
            <select className="styled flex-1" value={currency} onChange={e => setCurrency(e.target.value as 'EGP' | 'SDG')} aria-label={t('currencyLabel')}>
              {settings.egpEnabled && <option value="EGP">{marketCurrencyLabel.EGP}</option>}
              {settings.sdgEnabled && <option value="SDG">{marketCurrencyLabel.SDG}</option>}
            </select>
          </div>
        </div>

        {/* Category strip */}
        <div className="border-t border-kajok-soft/70 hidden sm:block">
          <div className="max-w-7xl mx-auto px-3 sm:px-4">
            <div className="no-scrollbar flex items-center gap-1 h-11 overflow-x-auto text-[12.5px] font-bold text-kajok-deep whitespace-nowrap">
              {categories.map(c => (
                <Link key={c.id} to={`/search?category=${c.slug}`} className="px-3 h-full flex items-center hover:text-kajok-royal border-b-2 border-transparent hover:border-kajok-royal transition-colors">
                  {lang === 'ar' ? c.name_ar : c.name_en}
                </Link>
              ))}
              <Link to="/search?on_sale=1" className="px-3 h-full flex items-center text-red-600">{t('deals')} 🔥</Link>
            </div>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-kajok-soft bg-white max-h-[70vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-4 grid sm:grid-cols-2 gap-1">
              {categories.map(c => (
                <Link key={c.id} to={`/search?category=${c.slug}`} className="px-3 py-2.5 rounded-lg hover:bg-kajok-bg text-sm font-semibold text-kajok-deep">
                  {lang === 'ar' ? c.name_ar : c.name_en}
                </Link>
              ))}
              <Link to="/account" className="px-3 py-2.5 rounded-lg hover:bg-kajok-bg text-sm font-semibold text-kajok-royal">{user ? t('account') : t('login')}</Link>
              {user && <button onClick={logout} className="px-3 py-2.5 rounded-lg hover:bg-kajok-bg text-sm font-semibold text-red-600 text-start">{t('logout')}</button>}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
