import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, X, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { useI18n } from '../i18n/I18nContext';
import { useCurrency } from '../context/CurrencyContext';

interface Order {
  id: number; order_number: string; customer_name: string; phone: string; country: string; city: string;
  address: string; notes: string; currency: 'EGP' | 'SDG'; subtotal: number | string; discount: number | string;
  shipping_fee: number | string; total: number | string; exchange_rate: number | string | null;
  payment_method: string; status: string; created_at: string;
}
interface OrderItem { id: number; product_id: number | null; name_ar: string; name_en: string; image: string; quantity: number; unit_price: number | string; currency: string }

const FLOW = ['new', 'confirming', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'] as const;

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useI18n();
  const { fmt } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const Chevron = lang === 'ar' ? ChevronLeft : ChevronRight;

  useEffect(() => {
    api<{ order: Order; items: OrderItem[] }>(`/orders/${id}`)
      .then(d => { setOrder(d.order); setItems(d.items); })
      .catch(() => setError('NOT_FOUND'));
  }, [id]);

  if (error) return <div className="max-w-2xl mx-auto py-20 text-center text-kajok-muted">404 — {t('noResults')}</div>;
  if (!order) return <div className="max-w-5xl mx-auto p-8"><div className="skeleton h-80 rounded-2xl" /></div>;

  const cancelled = order.status === 'cancelled';
  const currentStep = cancelled ? -1 : FLOW.indexOf(order.status as any);
  const fmtCur = (v: number | string) => fmt(Number(v), order.currency);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5">
      <Link to="/account" className="inline-flex items-center gap-1 text-sm font-bold text-kajok-royal hover:underline"><Chevron size={16} className="rotate-180" />{t('myOrders')}</Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-kajok-deep font-latin tracking-wide">{order.order_number}</h1>
          <p className="text-xs text-kajok-muted">{new Date(order.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</p>
        </div>
        <span className={`text-xs font-extrabold border rounded-xl px-3 py-1.5 ${cancelled ? 'bg-red-50 text-red-700 border-red-200' : 'bg-kajok-soft text-kajok-deep border-kajok-accent'}`}>{t(`status_${order.status}`)}</span>
      </div>

      {/* Status timeline */}
      {!cancelled ? (
        <div className="mt-5 bg-white rounded-2xl border border-kajok-soft shadow-card p-5 overflow-x-auto no-scrollbar">
          <ol className="flex items-center min-w-[560px]">
            {FLOW.map((step, i) => {
              const done = i <= currentStep;
              return (
                <li key={step} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && <span className={`absolute top-4 -start-1/2 w-full h-1 ${i <= currentStep ? 'bg-kajok-royal' : 'bg-kajok-soft'}`} />}
                  <span className={`relative z-10 w-8 h-8 rounded-full grid place-items-center border-2 text-xs ${done ? 'bg-kajok-royal border-kajok-royal text-white' : 'bg-white border-kajok-soft text-kajok-muted'}`}>
                    {done ? <Check size={15} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`relative z-10 mt-1.5 text-[9px] sm:text-[10px] font-bold text-center leading-tight max-w-[72px] ${done ? 'text-kajok-deep' : 'text-kajok-muted'}`}>{t(`status_${step}`)}</span>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div className="mt-5 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3 text-red-700 font-bold"><X size={22} />{t('status_cancelled')}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-5 mt-5">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-kajok-soft shadow-card divide-y divide-kajok-soft/70">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-4">
              <img src={item.image} alt="" className="w-16 h-16 object-contain rounded-xl bg-kajok-bg shrink-0" onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
              <div className="min-w-0 flex-1">
                <p className="clamp-2 text-[13px] font-bold">{lang === 'ar' ? item.name_ar : item.name_en}</p>
                <p className="text-[11px] text-kajok-muted">× {item.quantity}</p>
              </div>
              <span className="text-sm font-extrabold text-kajok-deep">{fmtCur(Number(item.unit_price) * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Summary & delivery */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
            <h2 className="font-extrabold text-kajok-deep flex items-center gap-2"><Package size={17} />{t('orderSummary')}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-kajok-muted">{t('subtotal')}</dt><dd>{fmtCur(order.subtotal)}</dd></div>
              <div className="flex justify-between text-emerald-700"><dt>{t('discount')}</dt><dd>−{fmtCur(order.discount)}</dd></div>
              <div className="flex justify-between"><dt className="text-kajok-muted">{t('shipping')}</dt><dd>{fmtCur(order.shipping_fee)}</dd></div>
              <div className="flex justify-between items-baseline border-t border-kajok-soft pt-2"><dt className="font-extrabold text-kajok-deep">{t('total')}</dt><dd className="text-xl font-black text-kajok-deep">{fmtCur(order.total)}</dd></div>
            </dl>
            <div className="mt-3 pt-3 border-t border-kajok-soft text-[11px] text-kajok-muted space-y-1">
              <p className="flex justify-between"><span>{t('currencyLabel')}</span><span className="font-bold text-kajok-deep">{order.currency} ({order.currency === 'SDG' ? 'ج.س.' : 'ج.م.'})</span></p>
              {order.exchange_rate !== null && <p className="flex justify-between"><span>{lang === 'ar' ? 'سعر الصرف وقت الطلب' : 'Rate at purchase'}</span><span className="font-bold text-kajok-deep">1 EGP = {Number(order.exchange_rate).toFixed(2)} SDG</span></p>}
              <p className="flex justify-between"><span>{t('paymentMethod')}</span><span className="font-bold text-kajok-deep">{t('cod')}</span></p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5 text-sm">
            <h2 className="font-extrabold text-kajok-deep">{t('contactInfo')}</h2>
            <p className="mt-2 font-bold">{order.customer_name} · <span className="font-latin">{order.phone}</span></p>
            <p className="text-kajok-muted text-xs mt-1">{order.country === 'SD' ? '🇸🇩' : '🇪🇬'} {order.city} — {order.address}</p>
            {order.notes && <p className="text-kajok-muted text-xs mt-1">{order.notes}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
