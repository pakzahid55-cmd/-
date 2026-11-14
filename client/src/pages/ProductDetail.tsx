import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Heart, Star, ShoppingCart, Zap, Banknote, RotateCcw, ShieldCheck, Minus, Plus,
  ChevronRight, ChevronLeft, Truck, PackageCheck,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Product } from '../lib/price';
import { useI18n } from '../i18n/I18nContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

interface Review { id: number; author_name: string; rating: number; comment: string; created_at: string }

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useI18n();
  const { currency, fmt } = useCurrency();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    api<{ product: Product; reviews: Review[]; similar: Product[] }>(`/products/${id}?currency=${currency}`)
      .then(d => { setProduct(d.product); setReviews(d.reviews); setSimilar(d.similar); })
      .catch(err => { if (err instanceof ApiError && err.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id, currency]);

  useEffect(() => { load(); setQty(1); }, [load]);

  // Track recently viewed
  useEffect(() => {
    if (!id) return;
    try {
      const pid = Number(id);
      const rv: number[] = JSON.parse(localStorage.getItem('kajok_recent') || '[]');
      localStorage.setItem('kajok_recent', JSON.stringify([pid, ...rv.filter(i => i !== pid)].slice(0, 12)));
    } catch { /* ignore */ }
  }, [id]);

  const name = product ? (lang === 'ar' ? product.name_ar : product.name_en) : '';
  const description = product ? (lang === 'ar' ? product.description_ar : product.description_en) : '';
  const specs = useMemo(() => Object.entries(product?.specs || {}), [product]);
  const Chevron = lang === 'ar' ? ChevronLeft : ChevronRight;

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      await api('/reviews', { method: 'POST', body: JSON.stringify({ product_id: product.id, rating, comment }) });
      toast('success', t('reviewThanks'));
      setComment('');
      load();
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Error');
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-10"><div className="skeleton h-[420px] rounded-2xl" /></div>;
  if (notFound || !product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-black text-kajok-deep">404</h1>
      <Link to="/" className="mt-4 inline-block text-kajok-royal font-bold hover:underline">{t('home')}</Link>
    </div>
  );

  const wished = has(product.id);
  const oldPrice = product.discount_percent > 0 ? product.base_price : null;
  const stockState = product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : 'in';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-[11px] sm:text-xs text-kajok-muted mb-3 flex-wrap" aria-label="breadcrumb">
        <Link to="/" className="hover:text-kajok-royal">{t('home')}</Link><Chevron size={12} />
        {product.category_slug && <Link to={`/search?category=${product.category_slug}`} className="hover:text-kajok-royal">{lang === 'ar' ? product.category_name_ar : product.category_name_en}</Link>}
        <Chevron size={12} /><span className="text-kajok-deep font-semibold clamp-1 max-w-[50vw]">{name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Image panel */}
        <div className="relative bg-white rounded-2xl border border-kajok-soft shadow-card p-6 flex items-center justify-center aspect-square max-h-[540px]">
          {product.discount_percent > 0 && <span className="absolute top-4 start-4 bg-red-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg">{t('off', { n: product.discount_percent })}</span>}
          <img src={product.image} alt={name} className="w-full h-full object-contain max-h-[460px]" onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-black text-kajok-muted uppercase tracking-widest">{product.brand_name}</span>
            <span className="text-kajok-soft">|</span>
            <span className="text-kajok-muted">{t('sku')}: {product.sku}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-kajok-text leading-snug">{name}</h1>

          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} className={i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-kajok-soft fill-kajok-soft'} />)}
              <span className="ms-1 font-bold">{product.rating.toFixed(1)}</span>
              <span className="text-kajok-muted">({product.review_count} {t('reviews')})</span>
            </div>
            <span className="text-kajok-muted">· {t('soldCount', { n: product.sold_count })}</span>
          </div>

          {/* Price block */}
          <div className="bg-white rounded-2xl border border-kajok-soft shadow-card p-4 mt-1">
            <div className="flex flex-wrap items-end gap-3">
              <div className="text-3xl sm:text-4xl font-black text-kajok-deep">{fmt(product.price)}</div>
              {oldPrice !== null && <div className="text-lg text-kajok-muted line-through pb-1">{fmt(oldPrice)}</div>}
              {product.discount_percent > 0 && <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1 mb-1">{t('saveAmount', { n: fmt(oldPrice! - product.price) })}</div>}
            </div>
            {product.converted && <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{lang === 'ar' ? `سعر محوّل بسعر الصرف المعتمد (1 ج.م. = ${product.exchange_rate?.toFixed(2)} ج.س.) — السعر النهائي للأوامر يُحدد وقت الطلب.` : `Price converted at the approved exchange rate (1 EGP = ${product.exchange_rate?.toFixed(2)} SDG) — final order pricing is applied at checkout.`}</p>}
            <div className="mt-2 flex items-center gap-2 text-xs font-bold">
              {stockState === 'in' && <span className="text-emerald-700 flex items-center gap-1"><PackageCheck size={14} />{t('inStock')}</span>}
              {stockState === 'low' && <span className="text-amber-700">{t('onlyLeft', { n: product.stock })}</span>}
              {stockState === 'out' && <span className="text-red-600">{t('outOfStock')}</span>}
            </div>
          </div>

          {/* Qty + actions */}
          <div className="flex items-stretch gap-2 mt-1">
            <div className="flex items-center border border-kajok-soft rounded-xl bg-white overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-12 grid place-items-center hover:bg-kajok-bg" aria-label="-"><Minus size={16} /></button>
              <span className="w-10 text-center font-extrabold">{qty}</span>
              <button onClick={() => setQty(q => Math.min(99, q + 1))} className="w-10 h-12 grid place-items-center hover:bg-kajok-bg" aria-label="+"><Plus size={16} /></button>
            </div>
            <button
              onClick={() => toggle(product.id)}
              aria-pressed={wished}
              aria-label={t('wishlist')}
              className="w-12 h-12 grid place-items-center rounded-xl border border-kajok-soft bg-white hover:border-kajok-royal"
            >
              <Heart size={20} className={wished ? 'fill-red-500 text-red-500' : 'text-kajok-deep'} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { add(product.id, qty); toast('success', t('addedToCart')); }}
              disabled={product.stock === 0}
              className="h-12 sm:h-13 rounded-xl border-2 border-kajok-royal text-kajok-royal font-extrabold flex items-center justify-center gap-2 hover:bg-kajok-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 text-sm sm:text-base"
            >
              <ShoppingCart size={19} />{t('addToCart')}
            </button>
            <button
              onClick={() => { add(product.id, qty); navigate('/checkout'); }}
              disabled={product.stock === 0}
              className="h-12 sm:h-13 rounded-xl bg-kajok-royal text-white font-extrabold flex items-center justify-center gap-2 hover:bg-kajok-deep disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-3 text-sm sm:text-base shadow-card"
            >
              <Zap size={19} />{t('buyNow')}
            </button>
          </div>

          {/* Trust row */}
          <div className="grid grid-cols-3 gap-2 text-center mt-1">
            {[
              { icon: Banknote, label: t('cod') },
              { icon: RotateCcw, label: t('returns') },
              { icon: ShieldCheck, label: t('warranty') },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-xl bg-kajok-soft/60 border border-kajok-soft py-2 px-1 text-[10px] sm:text-[11px] font-bold text-kajok-deep flex flex-col items-center gap-1"><Icon size={16} className="text-kajok-royal" />{label}</div>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-kajok-muted"><Truck size={13} />{lang === 'ar' ? 'توصيل خلال 2–5 أيام عمل حسب المحافظة' : 'Delivery in 2–5 business days depending on your governorate'}</p>
        </div>
      </div>

      {/* Specs + description + reviews */}
      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
            <h2 className="font-extrabold text-kajok-deep mb-3">{t('specs')}</h2>
            <table className="w-full text-sm">
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k} className="border-b border-kajok-soft/70 last:border-0">
                    <th className="text-start py-2.5 pe-4 text-kajok-muted font-semibold w-1/3 align-top">{k}</th>
                    <td className="py-2.5 text-kajok-text">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
            <h2 className="font-extrabold text-kajok-deep mb-2">{t('description')}</h2>
            <p className="text-sm leading-7 text-kajok-text/90">{description}</p>
          </section>
        </div>

        {/* Reviews */}
        <section className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
          <h2 className="font-extrabold text-kajok-deep">{t('reviews')} ({reviews.length})</h2>
          <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-kajok-soft/70">
            {reviews.length === 0 && <p className="text-sm text-kajok-muted py-4">{lang === 'ar' ? 'كن أول من يقيّم هذا المنتج' : 'Be the first to review this product'}</p>}
            {reviews.map(r => (
              <div key={r.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{r.author_name}</span>
                  <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-kajok-soft fill-kajok-soft'} />)}</div>
                </div>
                {r.comment && <p className="text-[13px] text-kajok-text/85 mt-1 leading-6">{r.comment}</p>}
                <p className="text-[10px] text-kajok-muted mt-1">{new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</p>
              </div>
            ))}
          </div>
          {user ? (
            <form onSubmit={submitReview} className="mt-3 border-t border-kajok-soft pt-3">
              <h3 className="text-sm font-extrabold text-kajok-deep">{t('writeReview')}</h3>
              <div className="flex items-center gap-1 mt-2" role="radiogroup" aria-label={t('yourRating')}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <button type="button" key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} stars`}>
                    <Star size={22} className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-kajok-soft fill-kajok-soft'} />
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2} maxLength={1000} placeholder={t('yourReview')} className="mt-2 w-full text-sm border border-kajok-soft rounded-xl p-3 outline-none focus:border-kajok-royal" />
              <button type="submit" className="mt-2 h-10 px-5 rounded-lg bg-kajok-deep text-white text-sm font-bold hover:bg-kajok-royal transition-colors">{t('submitReview')}</button>
            </form>
          ) : (
            <Link to="/login" className="block mt-3 text-center text-xs font-bold text-kajok-royal border border-dashed border-kajok-accent rounded-xl py-3 hover:bg-kajok-soft">{t('loginToReview')}</Link>
          )}
        </section>
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg sm:text-xl font-extrabold text-kajok-deep mb-3 flex items-center gap-2"><span className="w-1.5 h-6 rounded-full bg-kajok-royal inline-block" />{t('similar')}</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">{similar.map(p => <div key={p.id} className="w-40 sm:w-48 shrink-0"><ProductCard product={p} /></div>)}</div>
        </section>
      )}
    </div>
  );
}
