import { FormEvent, useEffect, useState } from 'react';
import { Megaphone, Tag, Image as ImageIcon, LayoutGrid, Award, Plus, Trash2, Loader2 } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useI18n } from '../../i18n/I18nContext';
import { useToast } from '../../context/ToastContext';

type Tab = 'coupons' | 'banners' | 'categories' | 'brands';

export default function AdminMarketing() {
  const { lang, t } = useI18n();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('coupons');
  const [busy, setBusy] = useState(false);

  const [coupons, setCoupons] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  const [couponForm, setCouponForm] = useState({ code: '', type: 'percent', value: 10, min_order: 0, uses_left: 1000, active: true });
  const [bannerForm, setBannerForm] = useState({ title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', image: '/hero-electronics.jpg', link: '/search', sort_order: 10, active: true });
  const [catForm, setCatForm] = useState({ name_ar: '', name_en: '', slug: '', icon: 'Tag', sort_order: 100 });
  const [brandForm, setBrandForm] = useState({ name: '', slug: '', color: '#6C3BCE' });

  const loadAll = () => {
    api<{ coupons: any[] }>('/admin/coupons').then(d => setCoupons(d.coupons)).catch(() => {});
    api<{ banners: any[] }>('/admin/banners').then(d => setBanners(d.banners)).catch(() => {});
    api<{ categories: any[] }>('/admin/categories').then(d => setCategories(d.categories)).catch(() => {});
    api<{ brands: any[] }>('/admin/brands').then(d => setBrands(d.brands)).catch(() => {});
  };
  useEffect(loadAll, []);

  const run = async (fn: () => Promise<any>, successMsg: string) => {
    setBusy(true);
    try { await fn(); toast('success', successMsg); loadAll(); }
    catch (err) { toast('error', err instanceof ApiError ? err.message : 'Error'); }
    finally { setBusy(false); }
  };

  const del = async (path: string) => {
    if (!window.confirm(lang === 'ar' ? 'تأكيد الحذف؟' : 'Confirm delete?')) return;
    run(() => api(path, { method: 'DELETE' }), t('savedOk'));
  };

  const inputCls = 'w-full h-11 px-3 rounded-lg border border-kajok-soft outline-none text-sm focus:border-kajok-royal';
  const tabBtn = (key: Tab, icon: any, label: string) => {
    const Icon = icon;
    return <button onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 h-11 rounded-xl text-xs font-extrabold whitespace-nowrap ${tab === key ? 'bg-kajok-deep text-white' : 'bg-white text-kajok-deep border border-kajok-soft'}`}><Icon size={15} />{label}</button>;
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-black text-kajok-deep flex items-center gap-2"><Megaphone size={22} />{t('marketing')}</h1>
      <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
        {tabBtn('coupons', Tag, t('coupons'))}
        {tabBtn('banners', ImageIcon, t('banners'))}
        {tabBtn('categories', LayoutGrid, t('categories'))}
        {tabBtn('brands', Award, t('brandsAdmin'))}
      </div>

      {/* ============ Coupons ============ */}
      {tab === 'coupons' && (
        <div className="grid lg:grid-cols-5 gap-4 mt-4">
          <form onSubmit={e => { e.preventDefault(); run(() => api('/admin/coupons', { method: 'POST', body: JSON.stringify(couponForm) }), t('couponSaved')); }} className="lg:col-span-2 bg-white rounded-2xl border border-kajok-soft shadow-card p-5 h-fit">
            <h2 className="font-extrabold text-kajok-deep flex items-center gap-2"><Plus size={17} />{t('addCoupon')}</h2>
            <div className="grid gap-2.5 mt-3 text-xs">
              <input required value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} placeholder="KAJOK20" className={`${inputCls} font-latin font-bold tracking-widest`} />
              <select value={couponForm.type} onChange={e => setCouponForm({ ...couponForm, type: e.target.value })} className={`styled ${inputCls}`}><option value="percent">{t('percentType')}</option><option value="fixed">{t('fixedType')}</option></select>
              <input required type="number" min={1} value={couponForm.value} onChange={e => setCouponForm({ ...couponForm, value: Number(e.target.value) })} placeholder={t('value')} className={inputCls} />
              <input type="number" min={0} value={couponForm.min_order} onChange={e => setCouponForm({ ...couponForm, min_order: Number(e.target.value) })} placeholder={t('minOrderAmount')} className={inputCls} />
              <input type="number" min={0} value={couponForm.uses_left} onChange={e => setCouponForm({ ...couponForm, uses_left: Number(e.target.value) })} placeholder={t('usesLeft')} className={inputCls} />
              <button disabled={busy} className="h-11 rounded-xl bg-kajok-royal text-white font-extrabold hover:bg-kajok-deep disabled:opacity-60 flex items-center justify-center gap-2">{busy && <Loader2 size={15} className="animate-spin" />}{t('save')}</button>
            </div>
          </form>
          <div className="lg:col-span-3 space-y-2">
            {coupons.map(c => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-kajok-soft shadow-card p-4">
                <Tag size={18} className="text-kajok-royal" />
                <div className="min-w-0"><p className="font-latin font-black text-kajok-deep tracking-widest">{c.code}</p><p className="text-[10px] text-kajok-muted">{c.type === 'percent' ? `${c.value}%` : `${c.value}`} · {t('minOrderAmount')}: {c.min_order} · {t('usesLeft')}: {c.uses_left}</p></div>
                <span className={`ms-auto text-[10px] font-extrabold px-2 py-1 rounded-md ${c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{c.active ? t('active') : 'OFF'}</span>
                <button onClick={() => run(() => api(`/admin/coupons/${c.id}`, { method: 'PUT', body: JSON.stringify({ active: !c.active }) }), t('savedOk'))} className="text-[10px] font-bold text-kajok-royal hover:underline">{c.active ? 'Disable' : 'Enable'}</button>
                <button onClick={() => del(`/admin/coupons/${c.id}`)} aria-label={t('delete')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            ))}
            {coupons.length === 0 && <p className="text-sm text-kajok-muted p-6 text-center">{t('noResults')}</p>}
          </div>
        </div>
      )}

      {/* ============ Banners ============ */}
      {tab === 'banners' && (
        <div className="grid lg:grid-cols-5 gap-4 mt-4">
          <form onSubmit={e => { e.preventDefault(); run(() => api('/admin/banners', { method: 'POST', body: JSON.stringify(bannerForm) }), t('bannerSaved')); }} className="lg:col-span-2 bg-white rounded-2xl border border-kajok-soft shadow-card p-5 h-fit">
            <h2 className="font-extrabold text-kajok-deep flex items-center gap-2"><Plus size={17} />{t('addBanner')}</h2>
            <div className="grid gap-2.5 mt-3 text-xs">
              <input required value={bannerForm.title_ar} onChange={e => setBannerForm({ ...bannerForm, title_ar: e.target.value })} placeholder={t('bannerTitleAr')} className={inputCls} />
              <input required value={bannerForm.title_en} onChange={e => setBannerForm({ ...bannerForm, title_en: e.target.value })} placeholder={t('bannerTitleEn')} className={inputCls} />
              <input value={bannerForm.subtitle_ar} onChange={e => setBannerForm({ ...bannerForm, subtitle_ar: e.target.value })} placeholder="Subtitle (AR)" className={inputCls} />
              <input value={bannerForm.subtitle_en} onChange={e => setBannerForm({ ...bannerForm, subtitle_en: e.target.value })} placeholder="Subtitle (EN)" className={inputCls} />
              <input required value={bannerForm.image} onChange={e => setBannerForm({ ...bannerForm, image: e.target.value })} placeholder={t('bannerImage')} className={`${inputCls} font-latin`} />
              <input value={bannerForm.link} onChange={e => setBannerForm({ ...bannerForm, link: e.target.value })} placeholder={t('bannerLink')} className={`${inputCls} font-latin`} />
              <button disabled={busy} className="h-11 rounded-xl bg-kajok-royal text-white font-extrabold hover:bg-kajok-deep disabled:opacity-60">{t('save')}</button>
            </div>
          </form>
          <div className="lg:col-span-3 space-y-2">
            {banners.map(b => (
              <div key={b.id} className="flex items-center gap-3 bg-white rounded-2xl border border-kajok-soft shadow-card p-3">
                <img src={b.image} alt="" className="w-24 h-14 object-cover rounded-lg bg-kajok-bg" onError={e => { (e.target as HTMLImageElement).src = '/hero-electronics.jpg'; }} />
                <div className="min-w-0 flex-1"><p className="font-bold text-xs clamp-1">{lang === 'ar' ? b.title_ar : b.title_en}</p><p className="text-[10px] text-kajok-muted font-latin">{b.link}</p></div>
                <button onClick={() => run(() => api(`/admin/banners/${b.id}`, { method: 'PUT', body: JSON.stringify({ active: !b.active }) }), t('savedOk'))} className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${b.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{b.active ? t('active') : 'OFF'}</button>
                <button onClick={() => del(`/admin/banners/${b.id}`)} aria-label={t('delete')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            ))}
            {banners.length === 0 && <p className="text-sm text-kajok-muted p-6 text-center">{t('noResults')}</p>}
          </div>
        </div>
      )}

      {/* ============ Categories ============ */}
      {tab === 'categories' && (
        <div className="grid lg:grid-cols-5 gap-4 mt-4">
          <form onSubmit={e => { e.preventDefault(); run(() => api('/admin/categories', { method: 'POST', body: JSON.stringify(catForm) }), t('itemSaved')); setCatForm({ ...catForm, name_ar: '', name_en: '', slug: '' }); }} className="lg:col-span-2 bg-white rounded-2xl border border-kajok-soft shadow-card p-5 h-fit">
            <h2 className="font-extrabold text-kajok-deep flex items-center gap-2"><Plus size={17} />{t('addCategory')}</h2>
            <div className="grid gap-2.5 mt-3 text-xs">
              <input required value={catForm.name_ar} onChange={e => setCatForm({ ...catForm, name_ar: e.target.value })} placeholder={t('nameArShort')} className={inputCls} />
              <input required value={catForm.name_en} onChange={e => setCatForm({ ...catForm, name_en: e.target.value })} placeholder={t('nameEnShort')} className={inputCls} />
              <input required value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder={t('slug')} className={`${inputCls} font-latin`} />
              <input value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} placeholder={t('iconName')} className={`${inputCls} font-latin`} />
              <button disabled={busy} className="h-11 rounded-xl bg-kajok-royal text-white font-extrabold hover:bg-kajok-deep disabled:opacity-60">{t('save')}</button>
            </div>
          </form>
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-2 content-start">
            {categories.map(c => (
              <div key={c.id} className="flex items-center gap-2 bg-white rounded-2xl border border-kajok-soft shadow-card p-4">
                <div className="min-w-0 flex-1"><p className="font-extrabold text-xs text-kajok-deep">{lang === 'ar' ? c.name_ar : c.name_en}</p><p className="text-[10px] text-kajok-muted font-latin">{c.slug} · {c.icon}</p></div>
                <button onClick={() => del(`/admin/categories/${c.id}`)} aria-label={t('delete')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ Brands ============ */}
      {tab === 'brands' && (
        <div className="grid lg:grid-cols-5 gap-4 mt-4">
          <form onSubmit={e => { e.preventDefault(); run(() => api('/admin/brands', { method: 'POST', body: JSON.stringify(brandForm) }), t('itemSaved')); setBrandForm({ ...brandForm, name: '', slug: '' }); }} className="lg:col-span-2 bg-white rounded-2xl border border-kajok-soft shadow-card p-5 h-fit">
            <h2 className="font-extrabold text-kajok-deep flex items-center gap-2"><Plus size={17} />{t('addBrand')}</h2>
            <div className="grid gap-2.5 mt-3 text-xs">
              <input required value={brandForm.name} onChange={e => setBrandForm({ ...brandForm, name: e.target.value })} placeholder={t('brand')} className={inputCls} />
              <input required value={brandForm.slug} onChange={e => setBrandForm({ ...brandForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder={t('slug')} className={`${inputCls} font-latin`} />
              <label className="flex items-center gap-2 font-bold text-kajok-deep">{t('color')}<input type="color" value={brandForm.color} onChange={e => setBrandForm({ ...brandForm, color: e.target.value })} className="w-12 h-9 rounded cursor-pointer border border-kajok-soft" /></label>
              <button disabled={busy} className="h-11 rounded-xl bg-kajok-royal text-white font-extrabold hover:bg-kajok-deep disabled:opacity-60">{t('save')}</button>
            </div>
          </form>
          <div className="lg:col-span-3 grid sm:grid-cols-3 gap-2 content-start">
            {brands.map(b => (
              <div key={b.id} className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-kajok-soft shadow-card p-4">
                <span className="font-black text-sm" style={{ color: b.color }}>{b.name}</span>
                <button onClick={() => del(`/admin/brands/${b.id}`)} aria-label={t('delete')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
