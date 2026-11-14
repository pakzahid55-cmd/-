import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Smartphone, Cpu, Laptop, Shirt, Footprints, Watch, CookingPot, Sparkles, Trophy, Gamepad2, Tag,
  Banknote, Truck, ShieldCheck, Mail, ChevronLeft, ChevronRight, BadgePercent, ArrowLeft, ArrowRight,
} from 'lucide-react';
import { api } from '../lib/api';
import type { Product } from '../lib/price';
import { useI18n } from '../i18n/I18nContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import Section from '../components/Section';

const CATEGORY_ICONS: Record<string, any> = {
  Smartphone, Cpu, Laptop, Shirt, Footprints, Watch, CookingPot, Sparkles, Trophy, Gamepad2,
};

interface Category { id: number; name_ar: string; name_en: string; slug: string; icon: string }
interface Brand { id: number; name: string; slug: string; color: string }
interface Banner { id: number; title_ar: string; title_en: string; subtitle_ar: string; subtitle_en: string; image: string; link: string }

export default function Home() {
  const { lang, t } = useI18n();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [suggested, setSuggested] = useState<Product[]>([]);
  const [recent, setRecent] = useState<Product[]>([]);
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const heroTimer = useRef<number | undefined>(undefined);

  const cur = `currency=${currency}`;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api<{ categories: Category[] }>('/categories'),
      api<{ brands: Brand[] }>('/brands'),
      api<{ banners: Banner[] }>('/banners'),
      api<{ products: Product[] }>(`/products?bestseller=1&limit=8&${cur}`),
      api<{ products: Product[] }>(`/products?new_arrival=1&limit=8&${cur}`),
      api<{ products: Product[] }>(`/products?on_sale=1&limit=8&${cur}`),
      api<{ products: Product[] }>(`/products?featured=1&limit=8&${cur}`),
    ]).then(([c, b, bn, bs, na, dl, sg]) => {
      setCategories(c.categories); setBrands(b.brands); setBanners(bn.banners);
      setBestsellers(bs.products); setNewArrivals(na.products); setDeals(dl.products); setSuggested(sg.products);
    }).catch(() => {}).finally(() => setLoading(false));
    // Recently viewed
    try {
      const ids: number[] = JSON.parse(localStorage.getItem('kajok_recent') || '[]');
      if (ids.length) api<{ products: Product[] }>(`/products?ids=${ids.join(',')}&limit=12&${cur}`).then(d => setRecent(d.products)).catch(() => {});
    } catch { /* ignore */ }
  }, [currency]);

  // Hero auto-advance
  useEffect(() => {
    if (banners.length < 2) return;
    heroTimer.current = window.setInterval(() => setSlide(s => (s + 1) % banners.length), 5000);
    return () => window.clearInterval(heroTimer.current);
  }, [banners.length]);

  const slides = banners.length ? banners : [];
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;
  const prevSlide = () => setSlide(s => (s - 1 + slides.length) % slides.length);
  const nextSlide = () => setSlide(s => (s + 1) % slides.length);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { toast('error', t('newsletterInvalid')); return; }
    const list = JSON.parse(localStorage.getItem('kajok_newsletter') || '[]');
    localStorage.setItem('kajok_newsletter', JSON.stringify(Array.from(new Set([...list, email.trim().toLowerCase()]))));
    setEmail('');
    toast('success', t('newsletterDone'));
  };

  const productRow = (items: Product[]) => (
    <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
      {loading
        ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton w-40 sm:w-48 aspect-[3/5] shrink-0" />)
        : items.map(p => <div key={p.id} className="w-40 sm:w-48 shrink-0 snap-start"><ProductCard product={p} /></div>)}
    </div>
  );

  return (
    <div className="pb-4">
      {/* ===== Hero ===== */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3">
        <div className="relative rounded-2xl overflow-hidden shadow-lift h-[240px] sm:h-[340px] lg:h-[400px] bg-kajok-deep">
          {slides.map((b, i) => (
            <button
              key={b.id}
              onClick={() => navigate(b.link || '/search')}
              aria-label={lang === 'ar' ? b.title_ar : b.title_en}
              className={`hero-fade absolute inset-0 w-full h-full transition-opacity duration-700 ${i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img src={b.image} alt="" className="absolute inset-0 w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = '/hero-electronics.jpg'; }} />
              <span className="absolute inset-0 bg-gradient-to-t from-kajok-deep/95 via-kajok-deep/35 to-transparent" />
              <span className="absolute bottom-0 start-0 p-4 sm:p-8 max-w-xl text-start">
                <span className="inline-block text-[10px] sm:text-xs font-bold text-kajok-accent border border-kajok-accent/40 bg-kajok-deep/60 backdrop-blur px-2.5 py-1 rounded-full mb-2">{t('heroBadge')}</span>
                <span className="block text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">{lang === 'ar' ? b.title_ar : b.title_en}</span>
                <span className="hidden sm:block mt-2 text-white/85 text-sm lg:text-base">{lang === 'ar' ? b.subtitle_ar : b.subtitle_en}</span>
                <span className="inline-flex items-center gap-2 mt-3 bg-kajok-accent text-kajok-deep text-xs sm:text-sm font-extrabold px-4 sm:px-5 h-9 sm:h-11 rounded-xl hover:bg-white transition-colors">{t('heroCta')}<Arrow size={16} /></span>
              </span>
            </button>
          ))}
          {slides.length > 1 && (
            <>
              <button onClick={prevSlide} aria-label="Previous" className="absolute z-20 top-1/2 -translate-y-1/2 start-2 w-9 h-9 grid place-items-center rounded-full bg-black/35 text-white hover:bg-black/60 backdrop-blur"><ChevronLeft size={18} className="rtl:rotate-180" /></button>
              <button onClick={nextSlide} aria-label="Next" className="absolute z-20 top-1/2 -translate-y-1/2 end-2 w-9 h-9 grid place-items-center rounded-full bg-black/35 text-white hover:bg-black/60 backdrop-blur"><ChevronRight size={18} className="rtl:rotate-180" /></button>
              <div className="absolute z-20 bottom-3 end-4 flex gap-1.5">
                {slides.map((_, i) => <button key={i} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === slide ? 'w-6 bg-kajok-accent' : 'w-2.5 bg-white/50'}`} />)}
              </div>
            </>
          )}
        </div>

        {/* USP cards row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3">
          {[
            { icon: Truck, title: t('usp1Title'), sub: t('usp1Sub') },
            { icon: Banknote, title: t('usp2Title'), sub: t('usp2Sub') },
            { icon: ShieldCheck, title: t('usp3Title'), sub: t('usp3Sub') },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="bg-white rounded-card border border-kajok-soft shadow-card px-2 py-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 grid place-items-center rounded-xl bg-kajok-soft text-kajok-royal"><Icon size={20} /></div>
              <div className="min-w-0">
                <div className="text-[11px] sm:text-[13px] font-extrabold text-kajok-deep leading-tight">{title}</div>
                <div className="hidden sm:block text-[11px] text-kajok-muted leading-tight mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Categories ===== */}
      <Section title={t('categoriesTitle')}>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 sm:gap-3">
          {categories.map(c => {
            const Icon = CATEGORY_ICONS[c.icon] || Tag;
            return (
              <Link key={c.id} to={`/search?category=${c.slug}`} className="group flex flex-col items-center gap-1.5 bg-white rounded-card border border-kajok-soft shadow-card p-2 sm:p-3 hover:border-kajok-royal hover:shadow-lift transition-all">
                <div className="w-11 h-11 sm:w-14 sm:h-14 grid place-items-center rounded-2xl bg-kajok-soft text-kajok-royal group-hover:bg-kajok-royal group-hover:text-white transition-colors">
                  <Icon size={22} className="sm:w-7 sm:h-7" strokeWidth={1.8} />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-kajok-deep text-center leading-tight clamp-2 h-7 sm:h-8">{lang === 'ar' ? c.name_ar : c.name_en}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* ===== Deals ===== */}
      {(loading || deals.length > 0) && (
        <Section title={t('dealsTitle')} link="/search?on_sale=1">
          <div className="relative">
            <div className="absolute -top-9 end-0 sm:static sm:mb-2 flex items-center gap-1.5 text-red-600 text-[11px] font-black"><BadgePercent size={14} />{t('hotDeal')}</div>
            {productRow(deals)}
          </div>
        </Section>
      )}

      {/* ===== Best sellers ===== */}
      {(loading || bestsellers.length > 0) && <Section title={t('bestSellers')} link="/search?sort=bestselling">{productRow(bestsellers)}</Section>}

      {/* ===== New arrivals ===== */}
      {(loading || newArrivals.length > 0) && <Section title={t('newArrivals')} link="/search?sort=newest">{productRow(newArrivals)}</Section>}

      {/* ===== Suggested ===== */}
      {(loading || suggested.length > 0) && <Section title={t('suggested')} link="/search?featured=1">{productRow(suggested)}</Section>}

      {/* ===== Recently viewed ===== */}
      {recent.length > 0 && <Section title={t('recentlyViewed')}>{productRow(recent)}</Section>}

      {/* ===== Brands ===== */}
      <Section title={t('brandsTitle')}>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {brands.map(b => (
            <Link key={b.id} to={`/search?brand=${encodeURIComponent(b.name)}`} className="aspect-[4/3] grid place-items-center rounded-card bg-white border border-kajok-soft shadow-card hover:border-kajok-royal hover:shadow-lift transition-all">
              <span className="font-black text-[11px] sm:text-sm tracking-wide" style={{ color: b.color }}>{b.name}</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ===== Newsletter ===== */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 mt-10">
        <div className="rounded-2xl bg-kajok-deep text-white px-5 py-7 sm:p-10 flex flex-col md:flex-row md:items-center gap-5 shadow-lift">
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2"><Mail className="text-kajok-accent" />{t('newsletterTitle')}</h3>
            <p className="text-white/70 text-sm mt-1.5">{t('newsletterSub')}</p>
          </div>
          <form onSubmit={subscribe} className="flex w-full md:w-auto gap-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('newsletterPlaceholder')} aria-label={t('newsletterPlaceholder')}
              className="flex-1 md:w-80 h-12 px-4 rounded-xl text-kajok-text bg-white outline-none border-2 border-transparent focus:border-kajok-accent" />
            <button type="submit" className="h-12 px-5 sm:px-7 rounded-xl bg-kajok-royal hover:bg-kajok-accent hover:text-kajok-deep font-extrabold transition-colors">{t('newsletterCta')}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
