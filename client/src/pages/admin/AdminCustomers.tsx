import { useEffect, useState } from 'react';
import { Users, ShieldCheck, User as UserIcon } from 'lucide-react';
import { api } from '../../lib/api';
import { useI18n } from '../../i18n/I18nContext';

interface AdminUser {
  id: number; email: string; full_name: string; phone: string | null; role: string;
  country: string; currency: string; created_at: string;
  orders_count: number | string; spent_egp: number | string; spent_sdg: number | string;
}

export default function AdminCustomers() {
  const { lang, t } = useI18n();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api<{ users: AdminUser[] }>('/admin/users').then(d => setUsers(d.users)).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-black text-kajok-deep flex items-center gap-2"><Users size={22} />{t('customers')}<span className="text-kajok-muted text-base font-bold">({users.length})</span></h1>
      <div className="mt-4 bg-white rounded-2xl border border-kajok-soft shadow-card overflow-x-auto">
        <table className="w-full text-xs min-w-[760px]">
          <thead className="bg-kajok-bg text-kajok-deep">
            <tr>
              <th className="text-start px-4 py-3">{t('customer')}</th>
              <th className="text-start px-4 py-3">Email</th>
              <th className="text-start px-4 py-3">{t('countryLabel')}</th>
              <th className="text-start px-4 py-3">{t('orders')}</th>
              <th className="text-start px-4 py-3">EGP</th>
              <th className="text-start px-4 py-3">SDG</th>
              <th className="text-start px-4 py-3">{t('joined')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kajok-soft/70">
            {loading && <tr><td colSpan={7} className="p-6"><div className="skeleton h-10 rounded-lg" /></td></tr>}
            {users.map(u => (
              <tr key={u.id} className="hover:bg-kajok-bg/60">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-lg grid place-items-center ${u.role === 'admin' ? 'bg-kajok-deep text-kajok-accent' : 'bg-kajok-soft text-kajok-royal'}`}>
                      {u.role === 'admin' ? <ShieldCheck size={15} /> : <UserIcon size={15} />}
                    </span>
                    <span className="font-bold">{u.full_name}<span className="block text-[9px] text-kajok-muted font-normal font-latin">{u.phone || ''}</span></span>
                  </div>
                </td>
                <td className="px-4 py-2.5 font-latin">{u.email}</td>
                <td className="px-4 py-2.5">{u.country === 'SD' ? '🇸🇩 SD' : '🇪🇬 EG'}</td>
                <td className="px-4 py-2.5 font-bold">{Number(u.orders_count)}</td>
                <td className="px-4 py-2.5">{Number(u.spent_egp).toLocaleString()}</td>
                <td className="px-4 py-2.5">{Number(u.spent_sdg).toLocaleString()}</td>
                <td className="px-4 py-2.5">{new Date(u.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
