import { FormEvent, useEffect, useState } from 'react';
import { Coins, Save, Loader2, Info, RefreshCw, ArrowLeftRight } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { PublicSettings } from '../../lib/price';
import { effectiveRate } from '../../lib/price';
import { useI18n } from '../../i18n/I18nContext';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';

type FormState = {
  egp_enabled: boolean; sdg_enabled: boolean;
  default_country: 'EG' | 'SD'; default_currency: 'EGP' | 'SDG';
  exchange_rate_egp_sdg: number; conversion_margin_percent: number;
  shipping_fee_eg: number; shipping_fee_sd: number;
  min_order_eg: number; min_order_sd: number;
};

export default function AdminCurrency() {
  const { lang, t } = useI18n();
  const { toast } = useToast();
  const { currency } = useCurrency();
  const [form, setForm] = useState<FormState | null>(null);
  const [meta, setMeta] = useState<{ rateUpdatedAt: string; rateSource: string }>({ rateUpdatedAt: '', rateSource: 'manual' });
  const [busy, setBusy] = useState(false);

  const load = () => api<{ settings: PublicSettings }>('/admin/settings').then(d => {
    const s = d.settings;
    setForm({
      egp_enabled: s.egpEnabled, sdg_enabled: s.sdgEnabled,
      default_country: s.defaultCountry, default_currency: s.defaultCurrency,
      exchange_rate_egp_sdg: s.exchangeRate, conversion_margin_percent: s.marginPercent,
      shipping_fee_eg: s.shippingEG, shipping_fee_sd: s.shippingSD,
      min_order_eg: s.minOrderEG, min_order_sd: s.minOrderSD,
    });
    setMeta({ rateUpdatedAt: s.rateUpdatedAt, rateSource: s.rateSource });
  }).catch(() => toast('error', 'Failed to load settings'));

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    try {
      const res = await api<{ settings: PublicSettings }>('/admin/settings', { method: 'PUT', body: JSON.stringify(form) });
      setMeta({ rateUpdatedAt: res.settings.rateUpdatedAt, rateSource: res.settings.rateSource });
      toast('success', t('settingsSaved'));
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Error');
    } finally {
      setBusy(false);
    }
  };

  if (!form) return <div className="skeleton h-96 rounded-2xl" />;

  const effective = effectiveRate({ ...form, egpEnabled: form.egp_enabled, sdgEnabled: form.sdg_enabled, defaultCountry: form.default_country, defaultCurrency: form.default_currency, exchangeRate: form.exchange_rate_egp_sdg, marginPercent: form.conversion_margin_percent, shippingEG: form.shipping_fee_eg, shippingSD: form.shipping_fee_sd, minOrderEG: form.min_order_eg, minOrderSD: form.min_order_sd, rateUpdatedAt: meta.rateUpdatedAt, rateSource: meta.rateSource });
  const preview = Math.round((1000 * effective) / 5) * 5;
  const inputCls = 'w-full h-12 px-4 rounded-xl border border-kajok-soft outline-none text-sm focus:border-kajok-royal';
  const toggle = (key: 'egp_enabled' | 'sdg_enabled', label: string, sub: string) => (
    <label className="flex items-center justify-between gap-4 bg-kajok-bg rounded-2xl border border-kajok-soft px-5 py-4 cursor-pointer">
      <span>
        <span className="block font-extrabold text-kajok-deep text-sm">{label}</span>
        <span className="block text-[11px] text-kajok-muted">{sub}</span>
      </span>
      <button type="button" role="switch" aria-checked={form[key]} onClick={e => { e.preventDefault(); setForm({ ...form, [key]: !form[key] }); }}
        className={`w-14 h-8 rounded-full p-1 transition-colors ${form[key] ? 'bg-kajok-royal' : 'bg-kajok-soft'}`}>
        <span className={`block w-6 h-6 rounded-full bg-white shadow transition-transform ${form[key] ? (lang === 'ar' ? '-translate-x-6' : 'translate-x-6') : ''}`} />
      </button>
    </label>
  );

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl sm:text-2xl font-black text-kajok-deep flex items-center gap-2"><Coins size={24} />{t('currencySettings')}</h1>

      <form onSubmit={save} className="mt-4 space-y-4">
        {/* Enable currencies */}
        <section className="grid sm:grid-cols-2 gap-3">
          {toggle('egp_enabled', t('egpEnabled'), 'Egypt market — ج.م.')}
          {toggle('sdg_enabled', t('sdgEnabled'), 'Sudan market · Khartoum — ج.س.')}
        </section>

        {/* Defaults */}
        <section className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
          <h2 className="font-extrabold text-kajok-deep text-sm">{t('defaultMarket')} / {t('defaultCurrency')}</h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <select value={form.default_country} onChange={e => setForm({ ...form, default_country: e.target.value as 'EG' | 'SD', default_currency: e.target.value === 'SD' ? 'SDG' : 'EGP' })} className={`styled ${inputCls}`}>
              <option value="EG">🇪🇬 {t('Egypt')} — EGP (ج.م.)</option>
              <option value="SD">🇸🇩 {t('Sudan')} — SDG (ج.س.)</option>
            </select>
            <select value={form.default_currency} onChange={e => setForm({ ...form, default_currency: e.target.value as 'EGP' | 'SDG' })} className={`styled ${inputCls}`}>
              <option value="EGP">EGP — ج.م.</option>
              <option value="SDG">SDG — ج.س.</option>
            </select>
          </div>
        </section>

        {/* Exchange rate */}
        <section className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-extrabold text-kajok-deep text-sm flex items-center gap-2"><ArrowLeftRight size={17} />{t('exchangeRate')}</h2>
            <button type="button" onClick={load} title="Reload" className="p-2 rounded-lg hover:bg-kajok-bg text-kajok-muted"><RefreshCw size={16} /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="text-[11px] font-bold text-kajok-muted">{t('exchangeRate')}</label>
              <input type="number" required min={1} step="0.01" value={form.exchange_rate_egp_sdg} onChange={e => setForm({ ...form, exchange_rate_egp_sdg: Number(e.target.value) })} className={`${inputCls} mt-1 font-latin font-bold`} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-kajok-muted">{t('conversionMargin')}</label>
              <input type="number" min={0} max={30} step="0.1" value={form.conversion_margin_percent} onChange={e => setForm({ ...form, conversion_margin_percent: Number(e.target.value) })} className={`${inputCls} mt-1 font-latin font-bold`} />
            </div>
            <div className="bg-kajok-soft/50 border border-kajok-soft rounded-xl px-4 py-2.5 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-kajok-muted uppercase">{lang === 'ar' ? 'السعر الفعلي بعد الهامش' : 'Effective rate after margin'}</span>
              <span className="text-lg font-black text-kajok-deep font-latin">1 EGP = {effective.toFixed(2)} SDG</span>
              <span className="text-[10px] text-kajok-muted">1,000 EGP ≈ {preview.toLocaleString()} SDG</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-kajok-muted">
            <span>{t('rateLastUpdated')}: <b className="text-kajok-deep">{meta.rateUpdatedAt ? new Date(meta.rateUpdatedAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB') : t('never')}</b></span>
            <span>{t('source')}: <b className="text-kajok-deep">{meta.rateSource === 'manual' ? (lang === 'ar' ? 'يدوي (من لوحة الإدارة)' : 'Manual (admin panel)') : meta.rateSource}</b></span>
          </div>
          <div className="mt-3 flex gap-2 text-[11px] leading-5 text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Info size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold">{t('settingsNote')}</p>
              <p className="mt-1">{lang === 'ar'
                ? 'المنتجات بنظام "سعر مستقل" تعرض السعر السوداني المحدد لها. المنتجات بنظام "محسوب بسعر الصرف" تعرض سعراً استرشادياً بالجنيه السوداني، ويُحتسب السعر النهائي للطلب لحظة إنشائه بسعر الصرف المعتمد وقتها.'
                : 'Independent-price products show their Sudan-specific price. Rate-converted products show an indicative SDG price; the final order price is computed at creation time using the approved rate then.'}</p>
            </div>
          </div>
        </section>

        {/* Shipping & minimum order per market */}
        <section className="bg-white rounded-2xl border border-kajok-soft shadow-card p-5">
          <h2 className="font-extrabold text-kajok-deep text-sm">{lang === 'ar' ? 'التوصيل والحد الأدنى للطلب حسب السوق' : 'Delivery & minimum order per market'}</h2>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div><label className="text-[11px] font-bold text-kajok-muted">{t('shippingFeeEg')}</label><input type="number" min={0} value={form.shipping_fee_eg} onChange={e => setForm({ ...form, shipping_fee_eg: Number(e.target.value) })} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-[11px] font-bold text-kajok-muted">{t('shippingFeeSd')}</label><input type="number" min={0} value={form.shipping_fee_sd} onChange={e => setForm({ ...form, shipping_fee_sd: Number(e.target.value) })} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-[11px] font-bold text-kajok-muted">{t('minOrderEg')}</label><input type="number" min={0} value={form.min_order_eg} onChange={e => setForm({ ...form, min_order_eg: Number(e.target.value) })} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-[11px] font-bold text-kajok-muted">{t('minOrderSd')}</label><input type="number" min={0} value={form.min_order_sd} onChange={e => setForm({ ...form, min_order_sd: Number(e.target.value) })} className={`${inputCls} mt-1`} /></div>
          </div>
        </section>

        <button type="submit" disabled={busy} className="w-full sm:w-auto h-13 px-10 py-4 rounded-xl bg-kajok-royal text-white font-extrabold hover:bg-kajok-deep disabled:opacity-60 flex items-center justify-center gap-2 shadow-card">
          {busy ? <Loader2 size={19} className="animate-spin" /> : <Save size={18} />}{t('saveSettings')}
        </button>
        <p className="text-[10px] text-kajok-muted">{lang === 'ar' ? `العملة المعروضة حالياً في المتجر: ${currency}. تغييرات هذا القسم تؤثر فوراً على طلبات جديدة.` : `Storefront currency shown right now: ${currency}. Changes here apply immediately to new orders.`}</p>
      </form>
    </div>
  );
}
