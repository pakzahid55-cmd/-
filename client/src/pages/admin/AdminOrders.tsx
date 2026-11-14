import { useEffect, useState } from 'react';
import { ShoppingBag, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useI18n } from '../../i18n/I18nContext';
import { useToast } from '../../context/ToastContext';

interface Order {
  id: number; order_number: string; customer_name: string; phone: string; country: string; city: string;
  address: string; notes: string; currency: 'EGP' | 'SDG'; subtotal: number | string; discount: number | string;
  shipping_fee: number | string; total: number | string; payment_method: string; status: string; created_at: string;
}
interface OrderItem { id: number; name_ar: string; name_en: string; image: string; quantity: number; unit_price: number | string }

const STATUSES = ['new', 'confirming', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const;
const STATUS_STYLE: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200', confirming: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200', preparing: 'bg-purple-50 text-purple-700 border-purple-200',
  out_for_delivery: 'bg-cyan-50 text-cyan-800 border-cyan-200', delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminOrders() {
  const { lang, t } = useI18n();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [detail, setDetail] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (status) p.set('status', status);
    if (search.trim()) p.set('search', search.trim());
    api<{ orders: Order[] }>(`/admin/orders?${p}`).then(d => setOrders(d.orders)).catch(() => setOrders([])).finally(() => setLoading(false));
  };

  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [status, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = async (orderId: number) => {
    if (expanded === orderId) { setExpanded(null); return; }
    setExpanded(orderId);
    const d = await api<{ items: OrderItem[] }>(`/admin/orders/${orderId}`).catch(() => ({ items: [] as OrderItem[] }));
    setDetail(d.items);
  };

  const updateStatus = async (order: Order, next: string) => {
    try {
      await api(`/admin/orders/${order.id}/status`, { method: 'PUT', body: JSON.stringify({ status: next }) });
      setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status: next } : o)));
      toast('success', t('savedOk'));
    } catch (err) { toast('error', err instanceof ApiError ? err.message : 'Error'); }
  };

  const fmtMoney = (n: number | string, cur: string) => `${Number(n).toLocaleString()} ${cur === 'SDG' ? 'ج.س.' : 'ج.م.'}`;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-black text-kajok-deep flex items-center gap-2"><ShoppingBag size={22} />{t('orders')}</h1>

      {/* Status filter chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto mt-4 pb-1">
        <button onClick={() => setStatus('')} className={`whitespace-nowrap h-9 px-4 rounded-full text-xs font-extrabold border ${!status ? 'bg-kajok-deep text-white border-kajok-deep' : 'bg-white text-kajok-deep border-kajok-soft'}`}>{t('allStatuses')}</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`whitespace-nowrap h-9 px-4 rounded-full text-xs font-extrabold border ${status === s ? 'bg-kajok-deep text-white border-kajok-deep' : 'bg-white text-kajok-deep border-kajok-soft'}`}>{t(`status_${s}`)}</button>
        ))}
      </div>
      <div className="relative mt-3 max-w-md">
        <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-kajok-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="KAJ-... / اسم العميل / الهاتف" className="w-full h-11 ps-10 pe-4 rounded-xl border border-kajok-soft bg-white outline-none focus:border-kajok-royal" />
      </div>

      <div className="mt-3 space-y-2">
        {loading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        {!loading && orders.length === 0 && <p className="text-center text-kajok-muted py-10">{t('noResults')}</p>}
        {orders.map(o => (
          <div key={o.id} className="bg-white rounded-2xl border border-kajok-soft shadow-card">
            <button onClick={() => toggleExpand(o.id)} className="w-full flex flex-wrap items-center gap-3 p-4 text-start">
              <span className="font-latin font-black text-kajok-deep text-sm">{o.order_number}</span>
              <span className="text-xs font-bold text-kajok-text">{o.customer_name} <span className="text-kajok-muted font-normal">· {o.phone}</span></span>
              <span className="text-[10px] text-kajok-muted">{o.country === 'SD' ? '🇸🇩' : '🇪🇬'} {o.city}</span>
              <span className="ms-auto text-sm font-black text-kajok-deep">{fmtMoney(o.total, o.currency)}</span>
              <span className={`text-[10px] font-extrabold border rounded-lg px-2 py-1 ${STATUS_STYLE[o.status]}`}>{t(`status_${o.status}`)}</span>
              {expanded === o.id ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>
            {expanded === o.id && (
              <div className="border-t border-kajok-soft p-4 grid md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-kajok-muted leading-6">📍 {o.address} {o.notes && <>· 📝 {o.notes}</>}</p>
                  <p className="text-kajok-muted mt-1">{new Date(o.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</p>
                  <p className="mt-1">{t('subtotal')}: {fmtMoney(o.subtotal, o.currency)} · {t('discount')}: {fmtMoney(o.discount, o.currency)} · {t('shipping')}: {fmtMoney(o.shipping_fee, o.currency)}</p>
                  <div className="mt-3 space-y-1.5">
                    {detail.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        <img src={item.image} alt="" className="w-9 h-9 object-contain rounded bg-kajok-bg" onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
                        <span className="flex-1 clamp-1">{lang === 'ar' ? item.name_ar : item.name_en}</span>
                        <span className="text-kajok-muted">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-extrabold text-kajok-deep uppercase tracking-wide">{t('updateStatus')}</label>
                  <select value={o.status} onChange={e => updateStatus(o, e.target.value)} className="styled w-full mt-2">
                    {STATUSES.map(s => <option key={s} value={s}>{t(`status_${s}`)}</option>)}
                  </select>
                  <p className="mt-2 text-[10px] text-kajok-muted">{lang === 'ar' ? 'إلغاء الطلب يعيد المنتجات إلى المخزون تلقائياً.' : 'Cancelling an order automatically restocks the items.'}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
