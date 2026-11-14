import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Minus, Plus, Tag, X, ArrowRight, ArrowLeft, BadgePercent } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Product } from '../lib/price';
import { shippingFor } from '../lib/price';
import { useI18n } from '../i18n/I18nContext';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function Cart() {
  const { lang, t } = useI18n();
  const { currency, country, settings, fmt } = useCurrency();
  const { items, setQty, remove, count } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; type: string; value: number } | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('kajok_coupon') || 'null'); } catch { return null; }
  });
  const [couponBusy, setCouponBusy] = useState(false);

  const ids = useMemo(() => items.map(i => i.id), [items]);

  useEffect(() => {
    if (ids.length === 0) { setProducts(new Map()); setLoading(false); return; }
    setLoading(true);
    api<{ products: Product[] }>(`/products?ids=${ids.join(',')}&limit=50&currency=${currency}`)
      .then(d => setProducts(new Map(d.products.map(p => [p.id, p]))))
      .catch(() => setProducts(new Map()))
      .finally(() => setLoading(false));
  }, [ids.join(','), currency]); // eslint-disable-line react-hooks/exhaustive-deps

  const lines = items.map(i => ({ item: i, product: products.get(i.id) })).filter(l => l.product) as Array<{ item: typeof items[number]; product: Product }>;

  const subtotalBase = lines.reduce((s, l) => s + l.product.base_price * l.item.qty, 0);
  const itemsFinal = lines.reduce((s, l) => s + l.product.price * l.item.qty, 0);
  const productSavings = subtotalBase - itemsFinal;
  const couponDiscount = coupon
    ? coupon.type === 'percent' ? Math.round(itemsFinal * (coupon.value / 100) * 100) / 100 : Math.min(coupon.value, itemsFinal)
    : 0;
  const shipping = shippingFor(country, settings);
  const total = Math.max(0, itemsFinal - couponDiscount + shipping);

  const applyCoupon = async (e: FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    try {
      const res = await api<{ coupon: { code: string; type: string; value: number } }>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal: itemsFinal, currency }) });
      setCoupon(res.coupon);
      sessionStorage.setItem('kajok_coupon', JSON.stringify(res.coupon));
      toast('success', t('couponApplied'));
    } catch (err) {
      setCoupon(null);
      sessionStorage.removeItem('kajok_coupon');
      toast('error', err instanceof ApiError ? err.message : t('couponInvalid'));
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => { setCoupon(null); setCouponInput(''); sessionStorage.removeItem('kajok_coupon'); };
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  if (!loading && lines.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingCart size={64} className="mx-auto text-kajok-accent" strokeWidth={1.3} />
        <h1 className="mt-5 text-2xl sm:text-3xl font-black text-kajok-deep">{t('cartEmpty')}</h1>
        <p className="mt-2 text-kajok-muted">{t('cartEmptySub')}</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 bg-kajok-royal text-white font-bold h-12 px-8 rounded-xl hover:bg-kajok-deep transition-colors">{t('continueShopping')}<Arrow size={18} /></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <h1 className="text-xl sm:text-2xl font-black text-kajok-deep flex items-center gap-2"><ShoppingCart size={24} />{t('cartTitle')}<span className="text-kajok-muted text-base font-bold">({t('itemsCount', { n: count })})</span></h1>

      <div className="grid lg:grid-cols-3 gap-5 mt-4">
        {/* Lines */}
        <div className="lg:col-span-2 space-y-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)
            : lines.map(({ item, product }) => (
              <div key={item.id} className="flex gap-3 bg-white rounded-2xl border border-kajok-soft shadow-card p-3">
                <Link to={`/product/${product.id}`} className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-kajok-bg">
                  <img src={product.image} alt="" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${product.id}`} className="clamp-2 text-[13px] sm:text-sm font-bold leading-5 hover:text-kajok-royal">{lang === 'ar' ? product.name_ar : product.name_en}</Link>
                    <button onClick={() => remove(item.id)} aria-label={t('remove')} className="p-1.5 text-kajok-muted hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <span className="font-extrabold text-kajok-deep">{fmt(product.price)}</span>
                    {product.discount_percent > 0 && <span className="text-[11px] text-kajok-muted line-through">{fmt(product.base_price)}</span>}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center border border-kajok-soft rounded-lg overflow-hidden bg-kajok-bg">
                      <button onClick={() => setQty(item.id, item.qty - 1)} className="w-8 h-9 grid place-items-center" aria-label="-"><Minus size={14} /></button>
                      <span className="w-9 text-center text-sm font-extrabold">{item.qty}</span>
                      <button onClick={() => setQty(item.id, item.qty + 1)} className="w-8 h-9 grid place-items-center" aria-label="+"><Plus size={14} /></button>
                    </div>
                    <span className="text-xs font-bold text-kajok-muted">{fmt(product.price * item.qty)}</span>
                  </div>
                </div>
              </div>
            ))}
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-kajok-royal hover:underline pt-1">{lang === 'ar' ? '→ متابعة التسوق' : '← Continue shopping'}</Link>
        </div>

        {/* Summary */}
        <aside className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5 h-fit sticky top-24">
          <h2 className="font-extrabold text-kajok-deep">{t('orderSummary')}</h2>

          {/* Coupon */}
          {coupon ? (
            <div className="mt-3 flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2 text-emerald-800 text-sm font-extrabold"><BadgePercent size={16} />{coupon.code} <span className="font-semibold text-emerald-700">(−{fmt(couponDiscount)})</span></div>
              <button onClick={removeCoupon} aria-label={t('remove')}><X size={17} className="text-emerald-800" /></button>
            </div>
          ) : (
            <form onSubmit={applyCoupon} className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Tag size={15} className="absolute top-1/2 -translate-y-1/2 start-3 text-kajok-muted" />
                <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} placeholder={t('couponCode')} aria-label={t('couponCode')} className="w-full h-11 ps-9 pe-3 rounded-xl border border-kajok-soft outline-none text-sm font-bold tracking-widest uppercase focus:border-kajok-royal" />
              </div>
              <button type="submit" disabled={couponBusy || !couponInput.trim()} className="h-11 px-4 rounded-xl bg-kajok-deep text-white text-xs font-extrabold hover:bg-kajok-royal disabled:opacity-50">{t('applyCoupon')}</button>
            </form>
          )}

          <dl className="mt-4 space-y-2 text-sm border-b border-kajok-soft pb-4">
            <div className="flex justify-between"><dt className="text-kajok-muted">{t('subtotal')}</dt><dd>{fmt(subtotalBase)}</dd></div>
            {productSavings > 0 && <div className="flex justify-between text-emerald-700"><dt>{t('discount')}</dt><dd>−{fmt(productSavings)}</dd></div>}
            {couponDiscount > 0 && <div className="flex justify-between text-emerald-700"><dt>{t('couponCode')}</dt><dd>−{fmt(couponDiscount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-kajok-muted">{t('shipping')} ({country === 'SD' ? t('Sudan') : t('Egypt')})</dt><dd>{fmt(shipping)}</dd></div>
          </dl>
          <div className="flex justify-between items-baseline mt-3">
            <span className="font-extrabold text-kajok-deep">{t('total')}</span>
            <span className="text-2xl font-black text-kajok-deep">{fmt(total)}</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="mt-4 w-full h-13 py-4 rounded-xl bg-kajok-royal text-white font-extrabold text-base hover:bg-kajok-deep transition-colors flex items-center justify-center gap-2 shadow-card">{t('proceedCheckout')}<Arrow size={18} /></button>
        </aside>
      </div>
    </div>
  );
}
