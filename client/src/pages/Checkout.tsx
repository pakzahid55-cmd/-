import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { shippingFor, minOrderFor, type Product } from '../lib/price';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency, type Country } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface Address { id: number; label: string; country: string; city: string; street: string; phone: string | null; is_default: number }

export default function Checkout() {
  const { lang, t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { currency, country, settings, fmt, setCountry } = useCurrency();
  const { items, clear } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [form, setForm] = useState({ customer_name: '', phone: '', city: '', address: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ order_number: string; total: number; currency: string } | null>(null);

  const ids = useMemo(() => items.map(i => i.id), [items]);

  useEffect(() => {
    if (ids.length) {
      api<{ products: Product[] }>(`/products?ids=${ids.join(',')}&limit=50&currency=${currency}`)
        .then(d => setProducts(new Map(d.products.map(p => [p.id, p]))))
        .catch(() => {});
    }
  }, [ids.join(','), currency]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prefill from profile / default address
  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, customer_name: f.customer_name || user.full_name, phone: f.phone || user.phone || '' }));
      api<{ addresses: Address[] }>('/auth/addresses').then(d => {
        const def = d.addresses.find(a => a.is_default === 1) || d.addresses[0];
        if (def) setForm(f => ({ ...f, city: f.city || def.city, address: f.address || def.street, phone: f.phone || def.phone || '' }));
      }).catch(() => {});
    }
  }, [user]);

  const lines = items.map(i => ({ item: i, product: products.get(i.id) })).filter(l => l.product) as Array<{ item: typeof items[number]; product: Product }>;
  const itemsTotal = lines.reduce((s, l) => s + l.product.price * l.item.qty, 0);
  const shipping = shippingFor(country, settings);
  const coupon = (() => { try { return JSON.parse(sessionStorage.getItem('kajok_coupon') || 'null'); } catch { return null; } })();
  const couponDiscount = coupon
    ? coupon.type === 'percent' ? Math.round(itemsTotal * (coupon.value / 100) * 100) / 100 : Math.min(coupon.value, itemsTotal)
    : 0;
  const total = Math.max(0, itemsTotal - couponDiscount + shipping);
  const minOrder = minOrderFor(country, settings);
  const belowMin = itemsTotal < minOrder;

  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  if (!authLoading && !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <ShieldCheck size={56} className="mx-auto text-kajok-royal" strokeWidth={1.4} />
        <h1 className="mt-4 text-2xl font-black text-kajok-deep">{t('checkoutTitle')}</h1>
        <p className="mt-2 text-kajok-muted">{lang === 'ar' ? 'سجل الدخول أو أنشئ حساباً لإتمام طلبك وحفظ طلباتك' : 'Sign in or create an account to place and track your orders'}</p>
        <Link to="/login?next=/checkout" className="mt-6 inline-flex items-center gap-2 bg-kajok-royal text-white font-bold h-12 px-8 rounded-xl hover:bg-kajok-deep transition-colors">{t('login')}<Arrow size={18} /></Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <CheckCircle2 size={72} className="mx-auto text-emerald-500" strokeWidth={1.4} />
        <h1 className="mt-5 text-3xl font-black text-kajok-deep">{t('orderSuccess')}</h1>
        <p className="mt-2 text-kajok-muted">{t('orderSuccessSub')}</p>
        <div className="mt-6 inline-flex flex-col items-center bg-white border border-kajok-soft rounded-2xl shadow-card px-8 py-5">
          <span className="text-xs text-kajok-muted font-bold">{t('orderNumber')}</span>
          <span className="text-2xl font-black text-kajok-royal tracking-wider font-latin">{done.order_number}</span>
          <span className="mt-2 text-sm font-bold text-kajok-deep">{done.total.toLocaleString()} {done.currency === 'SDG' ? 'ج.س.' : 'ج.م.'}</span>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/account" className="h-12 px-6 grid place-items-center rounded-xl border border-kajok-royal text-kajok-royal font-bold hover:bg-kajok-soft">{t('myOrders')}</Link>
          <Link to="/" className="h-12 px-6 grid place-items-center rounded-xl bg-kajok-royal text-white font-bold hover:bg-kajok-deep">{t('continueShopping')}</Link>
        </div>
      </div>
    );
  }

  const placeOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (belowMin) { toast('error', t('minOrderNote', { amount: `${minOrder.toLocaleString()} ${currency === 'SDG' ? 'ج.س.' : 'ج.م.'}` })); return; }
    setBusy(true);
    try {
      const res = await api<{ order: { order_number: string; total: number; currency: string } }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: form.customer_name.trim(), phone: form.phone.trim(),
          country, city: form.city.trim(), address: form.address.trim(), notes: form.notes.trim(),
          coupon_code: coupon?.code || '', currency,
          items: items.map(i => ({ product_id: i.id, quantity: i.qty })),
        }),
      });
      clear();
      sessionStorage.removeItem('kajok_coupon');
      setDone(res.order);
      window.scrollTo({ top: 0 });
    } catch (err) {
      const apiErr = err as ApiError;
      toast('error', apiErr?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full h-12 px-4 rounded-xl border border-kajok-soft bg-white outline-none text-sm focus:border-kajok-royal focus:ring-2 focus:ring-kajok-royal/15';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
      <h1 className="text-xl sm:text-2xl font-black text-kajok-deep flex items-center gap-2"><ShieldCheck size={24} />{t('checkoutTitle')}</h1>

      <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-5 mt-4">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
            <h2 className="font-extrabold text-kajok-deep">{t('contactInfo')}</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <input required minLength={2} value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder={t('fullName')} aria-label={t('fullName')} className={inputCls} />
              <input required minLength={6} inputMode="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={t('phone')} aria-label={t('phone')} className={inputCls} />
              <select value={country} onChange={e => setCountry(e.target.value as Country)} className={`styled ${inputCls}`} aria-label={t('country')}>
                <option value="EG">🇪🇬 {t('Egypt')}</option>
                <option value="SD">🇸🇩 {t('Sudan')}</option>
              </select>
              <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder={t('city')} aria-label={t('city')} className={inputCls} />
              <input required minLength={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder={t('address')} aria-label={t('address')} className={`${inputCls} sm:col-span-2`} />
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t('notes')} aria-label={t('notes')} rows={2} className="sm:col-span-2 w-full p-4 rounded-xl border border-kajok-soft outline-none text-sm focus:border-kajok-royal resize-none" />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
            <h2 className="font-extrabold text-kajok-deep">{t('paymentMethod')}</h2>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 border-2 border-kajok-royal bg-kajok-soft/40 rounded-2xl p-4 cursor-pointer">
                <input type="radio" name="payment" checked readOnly className="accent-[#6C3BCE] w-5 h-5" />
                <Banknote size={26} className="text-kajok-royal shrink-0" />
                <span><span className="block font-extrabold text-kajok-deep">{t('cod')}</span><span className="block text-[11px] text-kajok-muted">{t('codDesc')}</span></span>
              </label>
              <div className="flex items-center gap-3 border-2 border-dashed border-kajok-soft rounded-2xl p-4 opacity-75 select-none" aria-disabled="true">
                <span className="w-5 h-5 rounded-full border-2 border-kajok-soft grid place-items-center shrink-0"><span className="w-2.5 h-2.5 rounded-full bg-kajok-soft" /></span>
                <CreditCard size={26} className="text-kajok-muted shrink-0" />
                <span><span className="block font-extrabold text-kajok-muted">{t('onlineSoon')}</span><span className="block text-[11px] text-kajok-muted">{t('onlineSoonDesc')}</span></span>
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5 h-fit sticky top-24">
          <h2 className="font-extrabold text-kajok-deep">{t('orderSummary')}</h2>
          <div className="mt-3 divide-y divide-kajok-soft/70 max-h-72 overflow-y-auto">
            {lines.map(({ item, product }) => (
              <div key={item.id} className="flex items-center gap-2 py-2">
                <img src={product.image} alt="" className="w-14 h-14 object-contain rounded-lg bg-kajok-bg shrink-0" onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
                <div className="min-w-0 flex-1">
                  <p className="clamp-1 text-[12px] font-bold">{lang === 'ar' ? product.name_ar : product.name_en}</p>
                  <p className="text-[10px] text-kajok-muted">× {item.qty}</p>
                </div>
                <span className="text-[12px] font-extrabold">{fmt(product.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <dl className="mt-3 space-y-2 text-sm border-t border-kajok-soft pt-3">
            <div className="flex justify-between"><dt className="text-kajok-muted">{t('subtotal')}</dt><dd>{fmt(itemsTotal)}</dd></div>
            {couponDiscount > 0 && <div className="flex justify-between text-emerald-700"><dt>{t('couponCode')} ({coupon.code})</dt><dd>−{fmt(couponDiscount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-kajok-muted">{t('shipping')}</dt><dd>{fmt(shipping)}</dd></div>
            <div className="flex justify-between items-baseline border-t border-kajok-soft pt-2"><dt className="font-extrabold text-kajok-deep">{t('total')}</dt><dd className="text-xl font-black text-kajok-deep">{fmt(total)}</dd></div>
          </dl>
          {belowMin && <p className="mt-2 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{t('minOrderNote', { amount: `${minOrder.toLocaleString()} ${currency === 'SDG' ? 'ج.س.' : 'ج.م.'}` })}</p>}
          <button type="submit" disabled={busy || belowMin || items.length === 0} className="mt-4 w-full py-4 rounded-xl bg-kajok-royal text-white font-extrabold hover:bg-kajok-deep disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {busy ? <Loader2 size={19} className="animate-spin" /> : <ShieldCheck size={19} />}{t('placeOrderNow')}
          </button>
          <p className="mt-2 text-[10px] text-center text-kajok-muted">{lang === 'ar' ? `سيتم تنفيذ الطلب بالـ${currency === 'EGP' ? 'جنيه المصري (ج.م.)' : 'جنيه السوداني (ج.س.)'} — ${t('currencyLocked')}` : `Order will be placed in ${currency}. ${t('currencyLocked')}`}</p>
        </aside>
      </form>
    </div>
  );
}
