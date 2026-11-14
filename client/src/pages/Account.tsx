import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Package, LogOut, Plus, Trash2, Star, Save, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency, type Country } from '../context/CurrencyContext';
import { useI18n } from '../i18n/I18nContext';
import { useToast } from '../context/ToastContext';

type Tab = 'profile' | 'addresses' | 'orders';
interface Address { id: number; label: string; country: string; city: string; street: string; phone: string | null; is_default: number }
interface Order { id: number; order_number: string; total: number; currency: string; status: string; created_at: string; items_count?: number }
interface OrderItem { id: number; name_ar: string; name_en: string; image: string; quantity: number; unit_price: number }

const STATUS_STYLE: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  confirming: 'bg-amber-50 text-amber-800 border-amber-200',
  confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  preparing: 'bg-purple-50 text-purple-700 border-purple-200',
  out_for_delivery: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function Account() {
  const { user, loading, logout, updateProfile } = useAuth();
  const { currency, country, setCurrency, setCountry } = useCurrency();
  const { lang, setLang, t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('profile');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrForm, setAddrForm] = useState({ label: '', country: 'EG' as Country, city: '', street: '', phone: '', is_default: false });
  const [addingAddr, setAddingAddr] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user) { setName(user.full_name); setPhone(user.phone || ''); }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (tab === 'addresses') api<{ addresses: Address[] }>('/auth/addresses').then(d => setAddresses(d.addresses)).catch(() => {});
    if (tab === 'orders') {
      setOrdersLoading(true);
      api<{ orders: Order[] }>('/orders').then(d => setOrders(d.orders)).catch(() => {}).finally(() => setOrdersLoading(false));
    }
  }, [tab, user]);

  useEffect(() => {
    if (!loading && !user) navigate('/login?next=/account', { replace: true });
  }, [loading, user, navigate]);

  if (loading) return <div className="max-w-5xl mx-auto p-10"><div className="skeleton h-64 rounded-2xl" /></div>;
  if (!user) return null;

  const Chevron = lang === 'ar' ? ChevronLeft : ChevronRight;

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ full_name: name.trim(), phone: phone.trim(), language: lang, country, currency });
      toast('success', t('savedOk'));
    } catch (err) { toast('error', err instanceof ApiError ? err.message : 'Error'); }
    finally { setSavingProfile(false); }
  };

  const addAddress = async (e: FormEvent) => {
    e.preventDefault();
    setAddingAddr(true);
    try {
      await api('/auth/addresses', { method: 'POST', body: JSON.stringify(addrForm) });
      setAddrForm({ label: '', country: 'EG', city: '', street: '', phone: '', is_default: false });
      const d = await api<{ addresses: Address[] }>('/auth/addresses');
      setAddresses(d.addresses);
      toast('success', t('savedOk'));
    } catch (err) { toast('error', err instanceof ApiError ? err.message : 'Error'); }
    finally { setAddingAddr(false); }
  };

  const deleteAddress = async (id: number) => {
    await api(`/auth/addresses/${id}`, { method: 'DELETE' }).catch(() => {});
    setAddresses(a => a.filter(x => x.id !== id));
  };

  const tabBtn = (key: Tab, icon: any, label: string) => {
    const Icon = icon;
    return (
      <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 h-11 rounded-xl text-sm font-bold transition-colors ${tab === key ? 'bg-kajok-deep text-white' : 'bg-white text-kajok-deep border border-kajok-soft hover:border-kajok-royal'}`}>
        <Icon size={16} />{label}
      </button>
    );
  };

  const inputCls = 'w-full h-11 px-4 rounded-xl border border-kajok-soft bg-white outline-none text-sm focus:border-kajok-royal';

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5">
      {/* Profile header card */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-kajok-deep text-white rounded-2xl p-5 sm:p-6 shadow-lift">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-kajok-royal grid place-items-center text-2xl sm:text-3xl font-black">{user.full_name.trim().charAt(0).toUpperCase()}</div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black truncate">{user.full_name}</h1>
          <p className="text-white/70 text-xs sm:text-sm font-latin">{user.email}</p>
          <p className="text-kajok-accent text-[10px] sm:text-[11px] mt-1">{t('memberSince')}: {new Date(user.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="sm:ms-auto flex items-center gap-2 h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors"><LogOut size={16} />{t('logout')}</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
        {tabBtn('profile', User, t('profile'))}
        {tabBtn('addresses', MapPin, t('addresses'))}
        {tabBtn('orders', Package, t('myOrders'))}
      </div>

      <div className="mt-4">
        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5 sm:p-6 max-w-2xl">
            <h2 className="font-extrabold text-kajok-deep">{t('profile')}</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-kajok-muted">{t('profileName')}</label>
                <input value={name} onChange={e => setName(e.target.value)} className={`${inputCls} mt-1`} required minLength={2} />
              </div>
              <div>
                <label className="text-xs font-bold text-kajok-muted">{t('phoneLabel')}</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className={`${inputCls} mt-1`} inputMode="tel" />
              </div>
              <div>
                <label className="text-xs font-bold text-kajok-muted">{t('languageLabel')}</label>
                <select className={`styled ${inputCls} mt-1`} value={lang} onChange={e => setLang(e.target.value as 'ar' | 'en')}>
                  <option value="ar">العربية (RTL)</option>
                  <option value="en">English (LTR)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-kajok-muted">{t('countryLabel')}</label>
                <select className={`styled ${inputCls} mt-1`} value={country} onChange={e => setCountry(e.target.value as Country)}>
                  <option value="EG">🇪🇬 {t('Egypt')} (EGP)</option>
                  <option value="SD">🇸🇩 {t('Sudan')} (SDG)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-kajok-muted">{t('currencyLabel')}</label>
                <select className={`styled ${inputCls} mt-1`} value={currency} onChange={e => setCurrency(e.target.value as 'EGP' | 'SDG')}>
                  <option value="EGP">EGP — ج.م.</option>
                  <option value="SDG">SDG — ج.س.</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={savingProfile} className="mt-5 h-12 px-8 rounded-xl bg-kajok-royal text-white font-extrabold hover:bg-kajok-deep transition-colors flex items-center gap-2 disabled:opacity-60">
              {savingProfile ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}{t('saveChanges')}
            </button>
          </form>
        )}

        {tab === 'addresses' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {addresses.length === 0 && <p className="text-sm text-kajok-muted bg-white rounded-2xl border border-dashed border-kajok-soft p-6 text-center">{t('noAddresses')}</p>}
              {addresses.map(a => (
                <div key={a.id} className="bg-white rounded-2xl border border-kajok-soft shadow-card p-4 flex gap-3">
                  <MapPin size={20} className="text-kajok-royal shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-kajok-deep flex items-center gap-2">{a.label}{a.is_default === 1 && <span className="text-[9px] bg-kajok-soft text-kajok-royal px-1.5 py-0.5 rounded font-black">{t('defaultAddress')}</span>}</p>
                    <p className="text-xs text-kajok-muted mt-0.5">{a.country === 'SD' ? '🇸🇩' : '🇪🇬'} {a.city} — {a.street}</p>
                    {a.phone && <p className="text-[11px] text-kajok-muted font-latin">{a.phone}</p>}
                  </div>
                  <button onClick={() => deleteAddress(a.id)} aria-label={t('deleteAddress')} className="p-2 text-kajok-muted hover:text-red-600"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
            <form onSubmit={addAddress} className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
              <h2 className="font-extrabold text-kajok-deep">{t('addAddress')}</h2>
              <div className="grid gap-3 mt-3">
                <input value={addrForm.label} onChange={e => setAddrForm({ ...addrForm, label: e.target.value })} placeholder={t('addressLabel')} className={inputCls} />
                <select value={addrForm.country} onChange={e => setAddrForm({ ...addrForm, country: e.target.value as Country })} className={`styled ${inputCls}`}>
                  <option value="EG">🇪🇬 {t('Egypt')}</option>
                  <option value="SD">🇸🇩 {t('Sudan')}</option>
                </select>
                <input required value={addrForm.city} onChange={e => setAddrForm({ ...addrForm, city: e.target.value })} placeholder={t('city')} className={inputCls} />
                <input required minLength={3} value={addrForm.street} onChange={e => setAddrForm({ ...addrForm, street: e.target.value })} placeholder={t('street')} className={inputCls} />
                <input value={addrForm.phone} onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })} placeholder={t('phone')} inputMode="tel" className={inputCls} />
                <label className="flex items-center gap-2 text-xs font-bold text-kajok-deep cursor-pointer"><input type="checkbox" className="accent-[#6C3BCE] w-4 h-4" checked={addrForm.is_default} onChange={e => setAddrForm({ ...addrForm, is_default: e.target.checked })} />{t('makeDefault')}</label>
                <button type="submit" disabled={addingAddr} className="h-11 rounded-xl bg-kajok-deep text-white font-bold hover:bg-kajok-royal transition-colors flex items-center justify-center gap-2 disabled:opacity-60">{addingAddr ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{t('addAddress')}</button>
              </div>
            </form>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-3">
            <p className="text-[11px] text-kajok-muted bg-kajok-soft/50 border border-kajok-soft rounded-xl px-4 py-2">{t('currencyLocked')}</p>
            {ordersLoading && <div className="skeleton h-24 rounded-2xl" />}
            {!ordersLoading && orders.length === 0 && (
              <div className="text-center bg-white rounded-2xl border border-dashed border-kajok-soft p-10">
                <Package size={48} className="mx-auto text-kajok-accent" strokeWidth={1.4} />
                <p className="mt-3 font-bold text-kajok-deep">{t('ordersEmpty')}</p>
                <Link to="/" className="mt-4 inline-block h-11 px-6 leading-[2.75rem] rounded-xl bg-kajok-royal text-white font-bold">{t('browseProducts')}</Link>
              </div>
            )}
            {orders.map(o => (
              <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center gap-3 bg-white rounded-2xl border border-kajok-soft shadow-card p-4 hover:border-kajok-royal transition-colors">
                <Package size={26} className="text-kajok-royal shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-black text-kajok-deep font-latin tracking-wide">{o.order_number}</p>
                  <p className="text-[11px] text-kajok-muted">{new Date(o.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB')} · {o.currency === 'SDG' ? 'ج.س.' : 'ج.م.'} {Number(o.total).toLocaleString()}</p>
                </div>
                <span className={`text-[10px] sm:text-[11px] font-extrabold border rounded-lg px-2 py-1 whitespace-nowrap ${STATUS_STYLE[o.status] || ''}`}>{t(`status_${o.status}`)}</span>
                <Chevron size={18} className="text-kajok-muted shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
