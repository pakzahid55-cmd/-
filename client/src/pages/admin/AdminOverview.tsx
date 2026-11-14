import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, ShoppingBag, Clock, Users, Package, AlertTriangle, TrendingUp, Flame } from 'lucide-react';
import { api } from '../../lib/api';
import { useI18n } from '../../i18n/I18nContext';

interface Stats {
  stats: { total_revenue: Record<string, number>; total_orders: number; revenue_orders: number; customers: number; products: number; low_stock: number; pending_orders: number };
  daily: Array<{ day: string; total: number; orders: number }>;
  top_products: Array<{ id: number; name_ar: string; name_en: string; image: string; sold_count: number; stock: number }>;
  recent_orders: Array<{ id: number; order_number: string; total: number; currency: string; status: string; created_at: string; country: string }>;
}

export default function AdminOverview() {
  const { lang, t } = useI18n();
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => { api<Stats>('/admin/stats').then(setData).catch(() => setError(true)); }, []);

  if (error) return <p className="text-red-600 font-bold">Failed to load stats</p>;
  if (!data) return <div className="skeleton h-64 rounded-2xl" />;

  const { stats, daily, top_products, recent_orders } = data;
  const maxDailyOrders = Math.max(1, ...daily.map(d => d.orders));
  const fmtMoney = (n: number, cur: string) => `${Math.round(n).toLocaleString()} ${cur === 'SDG' ? 'ج.س.' : 'ج.م.'}`;

  const cards = [
    { icon: Banknote, label: t('totalRevenue'), value: `${fmtMoney(stats.total_revenue.EGP || 0, 'EGP')} · ${fmtMoney(stats.total_revenue.SDG || 0, 'SDG')}`, accent: true, sub: t('revenueByMarket') },
    { icon: ShoppingBag, label: t('totalOrders'), value: String(stats.total_orders), sub: `${stats.revenue_orders} ${t('ordersValue')}` },
    { icon: Clock, label: t('pendingOrders'), value: String(stats.pending_orders), sub: t('status_preparing') },
    { icon: Users, label: t('totalCustomers'), value: String(stats.customers), sub: t('customers') },
    { icon: Package, label: t('productsCount'), value: String(stats.products), sub: t('inventory') },
    { icon: AlertTriangle, label: t('lowStock'), value: String(stats.low_stock), sub: t('stockLabel') },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl sm:text-2xl font-black text-kajok-deep flex items-center gap-2"><TrendingUp size={22} />{t('overview')}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map(({ icon: Icon, label, value, sub, accent }: any) => (
          <div key={label} className={`rounded-2xl border shadow-card p-4 ${accent ? 'bg-kajok-deep text-white border-kajok-deep col-span-2 md:col-span-3 xl:col-span-2' : 'bg-white border-kajok-soft'}`}>
            <Icon size={19} className={accent ? 'text-kajok-accent' : 'text-kajok-royal'} />
            <p className={`mt-2 text-[10px] uppercase tracking-wide font-bold ${accent ? 'text-white/60' : 'text-kajok-muted'}`}>{label}</p>
            <p className={`mt-0.5 text-sm sm:text-base font-black leading-snug ${accent ? 'text-white' : 'text-kajok-deep'}`}>{value}</p>
            <p className={`text-[9px] ${accent ? 'text-white/50' : 'text-kajok-muted'}`}>{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* 14-day orders chart (currency-agnostic) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
          <h2 className="font-extrabold text-kajok-deep text-sm">{t('salesLast14')} <span className="text-kajok-muted font-bold">· {t('orders')}</span></h2>
          <div className="mt-4 flex items-end gap-[3px] h-40">
            {daily.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] font-bold text-kajok-royal opacity-0 group-hover:opacity-100 transition-opacity">{d.orders}</span>
                <div className="w-full rounded-t-md bg-kajok-royal/85 group-hover:bg-kajok-royal transition-all" style={{ height: `${(d.orders / maxDailyOrders) * 100}%`, minHeight: d.orders > 0 ? 6 : 2 }} />
                <span className="text-[8px] text-kajok-muted font-latin">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
          <h2 className="font-extrabold text-kajok-deep text-sm flex items-center gap-1.5"><Flame size={16} className="text-orange-500" />{t('topProducts')}</h2>
          <ol className="mt-3 divide-y divide-kajok-soft/70">
            {top_products.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2 py-2">
                <span className="w-5 text-xs font-black text-kajok-muted">{i + 1}.</span>
                <img src={p.image} alt="" className="w-10 h-10 object-contain rounded-lg bg-kajok-bg" onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
                <span className="flex-1 min-w-0 clamp-1 text-[11px] font-bold">{lang === 'ar' ? p.name_ar : p.name_en}</span>
                <span className="text-[10px] font-extrabold text-kajok-royal whitespace-nowrap">{p.sold_count}×</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5 overflow-x-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-kajok-deep text-sm">{t('recentOrders')}</h2>
          <Link to="/admin/orders" className="text-xs font-bold text-kajok-royal hover:underline">{t('viewAll')}</Link>
        </div>
        <table className="w-full text-xs mt-3 min-w-[560px]">
          <thead><tr className="text-kajok-muted text-start"><th className="text-start py-2">{t('orderNumber')}</th><th className="text-start py-2">{t('orders')}</th><th className="text-start py-2">{t('total')}</th><th className="text-start py-2">{t('updateStatus')}</th></tr></thead>
          <tbody className="divide-y divide-kajok-soft/70">
            {recent_orders.map(o => (
              <tr key={o.id}>
                <td className="py-2.5 font-latin font-bold text-kajok-deep">{o.order_number}</td>
                <td className="py-2.5">{new Date(o.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')} · {o.country === 'SD' ? '🇸🇩' : '🇪🇬'}</td>
                <td className="py-2.5 font-bold">{fmtMoney(o.total, o.currency)}</td>
                <td className="py-2.5"><span className="text-[10px] font-extrabold bg-kajok-soft text-kajok-deep rounded-md px-2 py-1">{t(`status_${o.status}`)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
