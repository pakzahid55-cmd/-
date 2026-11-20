import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PageHeader, Spinner } from '../components/ui';
import { useI18n } from '../i18n/I18nProvider';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import { disablePush, enablePush, isPushEnabled, pushKey } from '../lib/push';
import { useAuth } from '../store/auth';

const labels: Record<string, [string, string]> = {
  order_created: ['Order placed', 'تم إنشاء الطلب'], seller_order: ['New seller order', 'طلب جديد لمتجرك'], order_processing: ['Order confirmed', 'تم تأكيد الطلب'],
  order_shipped: ['A shipment is on its way', 'شحنة في الطريق'], order_delivered: ['Delivery completed', 'تم التسليم'], order_cancelled: ['An order or shipment was cancelled', 'أُلغي طلب أو شحنة'],
  seller_approved: ['Your seller application is approved', 'تمت الموافقة على طلبك كبائع'], seller_rejected: ['Your seller application was declined', 'لم تتم الموافقة على طلبك كبائع'],
  admin_order: ['New marketplace order', 'طلب جديد على المنصة'], admin_seller: ['New seller application', 'طلب تسجيل بائع جديد'],
};
type Notification = { id: string; kind: string; reference: string | null; createdAt: string };
export function NotificationsPage() {
  const { pick, lang, t } = useI18n();
  const { user, initialized } = useAuth();
  const [items, setItems] = useState<Notification[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [optedIn, setOptedIn] = useState(isPushEnabled);
  useEffect(() => { if (user) void api<{ items: Notification[] }>('/notifications').then(r => setItems(r.items)).catch(e => setError(e.message)); }, [user]);
  if (!initialized) return <Spinner />;
  if (!user) return <Navigate replace to="/login?next=/notifications" />;
  const toggle = async () => {
    setBusy(true); setError('');
    try { if (optedIn) await disablePush(); else await enablePush(lang); setOptedIn(!optedIn); }
    catch { setError(pick('Could not update browser notifications. Check your browser permissions.', 'تعذّر تحديث الإشعارات. راجع أذونات المتصفح.')); }
    finally { setBusy(false); }
  };
  return <div className="container-kujuk py-8"><PageHeader title={pick('Notifications', 'الإشعارات')} />
    {pushKey && <button disabled={busy} onClick={() => void toggle()} className="btn-secondary mb-5 px-4 py-2">{optedIn ? pick('Disable browser push', 'إيقاف إشعارات المتصفح') : pick('Enable browser push', 'تفعيل إشعارات المتصفح')}</button>}
    {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
    {!items && !error && <Spinner />}
    {items?.length === 0 && <p className="card-kujuk p-5 text-sm">{pick('You’re all caught up.', 'لا توجد إشعارات جديدة.')}</p>}
    <ul className="space-y-3">{items?.map(n => { const label = labels[n.kind] ?? ['Marketplace update', 'تحديث من كجوك']; return <li key={n.id} className="card-kujuk flex flex-wrap items-center justify-between gap-3 p-4">
      <div><strong className="text-sm">{pick(...label)}</strong><p className="mt-1 text-xs text-slate-500">{formatDate(n.createdAt, lang)}</p></div>
      {n.reference && <Link className="text-sm font-bold text-royal" to={user.role === 'admin' ? '/admin/orders' : n.kind === 'seller_order' ? '/seller' : '/orders'}>{t('common.viewAll')} →</Link>}
    </li>; })}</ul>
  </div>;
}
