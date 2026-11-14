import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, Loader2, Package } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { Product, Currency } from '../../lib/price';
import { useI18n } from '../../i18n/I18nContext';
import { useToast } from '../../context/ToastContext';

interface Category { id: number; name_ar: string; name_en: string; slug: string }
interface Brand { id: number; name: string }

const emptyForm = {
  sku: '', name_ar: '', name_en: '', description_ar: '', description_en: '',
  category_id: '' as string | number, brand_id: '' as string | number,
  price_egp: '', price_sdg: '', price_mode: 'independent' as 'independent' | 'converted',
  discount_percent: 0, stock: 0, image: '/products/phone-s25.svg', specs: '',
  featured: false, bestseller: false, new_arrival: false,
};

export default function AdminProducts() {
  const { lang, t } = useI18n();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<null | 'new' | number>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const q = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    api<{ products: Product[] }>(`/products?limit=48&currency=EGP${q}`)
      .then(d => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api<{ categories: Category[] }>('/admin/categories').then(d => setCategories(d.categories)).catch(() => {});
    api<{ brands: Brand[] }>('/admin/brands').then(d => setBrands(d.brands)).catch(() => {});
  }, []);
  useEffect(() => { const id = setTimeout(load, 250); return () => clearTimeout(id); }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = (p?: Product) => {
    if (!p) { setForm(emptyForm); setEditing('new'); return; }
    setForm({
      sku: p.sku, name_ar: p.name_ar, name_en: p.name_en,
      description_ar: p.description_ar, description_en: p.description_en,
      category_id: p.category_id ?? '', brand_id: p.brand_id ?? '',
      price_egp: String(p.price_egp), price_sdg: p.price_sdg !== null ? String(p.price_sdg) : '',
      price_mode: p.price_mode as any, discount_percent: p.discount_percent, stock: p.stock,
      image: p.image, specs: Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join('\n'),
      featured: p.featured, bestseller: p.bestseller, new_arrival: p.new_arrival,
    });
    setEditing(p.id);
  };

  const parseSpecs = (raw: string) => {
    const obj: Record<string, string> = {};
    for (const line of raw.split('\n')) {
      const idx = line.indexOf(':');
      if (idx > 0) obj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
    return JSON.stringify(obj);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      sku: form.sku.trim(), name_ar: form.name_ar.trim(), name_en: form.name_en.trim(),
      description_ar: form.description_ar, description_en: form.description_en,
      category_id: form.category_id === '' ? null : Number(form.category_id),
      brand_id: form.brand_id === '' ? null : Number(form.brand_id),
      price_egp: Number(form.price_egp), price_sdg: form.price_sdg === '' ? null : Number(form.price_sdg),
      price_mode: form.price_mode, discount_percent: Number(form.discount_percent), stock: Number(form.stock),
      image: form.image.trim(), specs_json: parseSpecs(form.specs),
      featured: form.featured, bestseller: form.bestseller, new_arrival: form.new_arrival,
    };
    try {
      if (editing === 'new') await api('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      else await api(`/admin/products/${editing}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast('success', t('productSaved'));
      setEditing(null);
      load();
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!window.confirm(t('deleteProductConfirm'))) return;
    try {
      const res = await api<{ soft_deleted?: boolean; message?: string }>(`/admin/products/${p.id}`, { method: 'DELETE' });
      toast(res.soft_deleted ? 'info' : 'success', res.soft_deleted ? `${t('deactivatedNote')} — ${res.message || ''}` : t('productSaved'));
      load();
    } catch (err) { toast('error', err instanceof ApiError ? err.message : 'Error'); }
  };

  const inputCls = 'w-full h-11 px-3 rounded-lg border border-kajok-soft outline-none text-sm focus:border-kajok-royal';
  const priceImg = form.image;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-black text-kajok-deep flex items-center gap-2"><Package size={22} />{t('products')}</h1>
        <button onClick={() => openEdit()} className="h-11 px-5 rounded-xl bg-kajok-royal text-white text-sm font-extrabold hover:bg-kajok-deep flex items-center gap-2"><Plus size={17} />{t('addProduct')}</button>
      </div>

      <div className="relative mt-4 max-w-md">
        <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-kajok-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchProducts')} className="w-full h-11 ps-10 pe-4 rounded-xl border border-kajok-soft bg-white outline-none focus:border-kajok-royal" />
      </div>

      <div className="mt-3 bg-white rounded-2xl border border-kajok-soft shadow-card overflow-x-auto">
        <table className="w-full text-xs min-w-[860px]">
          <thead className="bg-kajok-bg text-kajok-deep">
            <tr>
              {['', lang === 'ar' ? 'المنتج' : 'Product', t('skuLabel'), 'EGP ج.م.', 'SDG ج.س.', '%', t('stockLabel'), lang === 'ar' ? 'المبيعات' : 'Sold', t('updateStatus')].map((h, i) => <th key={i} className="text-start px-3 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-kajok-soft/70">
            {loading && <tr><td colSpan={9} className="p-6"><div className="skeleton h-10 rounded-lg" /></td></tr>}
            {!loading && products.map(p => (
              <tr key={p.id} className="hover:bg-kajok-bg/60">
                <td className="px-3 py-2"><img src={p.image} alt="" className="w-12 h-12 object-contain rounded-lg bg-kajok-bg" onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} /></td>
                <td className="px-3 py-2 max-w-[220px]"><p className="clamp-2 font-bold">{lang === 'ar' ? p.name_ar : p.name_en}</p><p className="text-[9px] text-kajok-muted">{p.brand_name}</p></td>
                <td className="px-3 py-2 font-latin">{p.sku}</td>
                <td className="px-3 py-2 font-bold">{Number(p.price_egp).toLocaleString()}</td>
                <td className="px-3 py-2">{p.price_sdg !== null ? Number(p.price_sdg).toLocaleString() : <span className="text-kajok-muted">{p.price_mode === 'converted' ? 'Auto' : '—'}</span>}</td>
                <td className="px-3 py-2">{p.discount_percent > 0 ? <span className="text-red-600 font-extrabold">{p.discount_percent}%</span> : '—'}</td>
                <td className="px-3 py-2"><span className={p.stock <= 5 ? 'text-red-600 font-extrabold' : ''}>{p.stock}</span></td>
                <td className="px-3 py-2">{p.sold_count}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} aria-label={t('edit')} className="p-2 rounded-lg hover:bg-kajok-soft text-kajok-royal"><Pencil size={15} /></button>
                    <button onClick={() => remove(p)} aria-label={t('delete')} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && <tr><td colSpan={9} className="px-3 py-8 text-center text-kajok-muted">{t('noResults')}</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Edit / create modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 bg-black/55 grid place-items-center p-3 overflow-y-auto" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-lift w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-kajok-deep">{editing === 'new' ? t('addProduct') : t('editProduct')}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label={t('close')}><X size={20} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div><label className="font-bold text-kajok-muted">{t('skuLabel')} *</label><input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={`${inputCls} mt-1 font-latin`} placeholder="KJK-PH-100" /></div>
              <div><label className="font-bold text-kajok-muted">{t('categoryLabel')}</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className={`styled ${inputCls} mt-1`}>
                  <option value="">—</option>{categories.map(c => <option key={c.id} value={c.id}>{lang === 'ar' ? c.name_ar : c.name_en}</option>)}
                </select>
              </div>
              <div><label className="font-bold text-kajok-muted">{t('nameAr')} *</label><input required value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} className={`${inputCls} mt-1`} /></div>
              <div><label className="font-bold text-kajok-muted">{t('nameEn')} *</label><input required value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} className={`${inputCls} mt-1`} /></div>
              <div className="sm:col-span-2"><label className="font-bold text-kajok-muted">{t('description')} (AR)</label><textarea rows={2} value={form.description_ar} onChange={e => setForm({ ...form, description_ar: e.target.value })} className="w-full mt-1 p-3 rounded-lg border border-kajok-soft outline-none focus:border-kajok-royal" /></div>
              <div className="sm:col-span-2"><label className="font-bold text-kajok-muted">{t('description')} (EN)</label><textarea rows={2} value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} className="w-full mt-1 p-3 rounded-lg border border-kajok-soft outline-none focus:border-kajok-royal" /></div>
              <div><label className="font-bold text-kajok-muted">{t('priceEgp')} *</label><input required type="number" min={1} step="0.01" value={form.price_egp} onChange={e => setForm({ ...form, price_egp: e.target.value })} className={`${inputCls} mt-1`} /></div>
              <div><label className="font-bold text-kajok-muted">{t('priceSdg')}</label><input type="number" min={1} step="0.01" value={form.price_sdg} onChange={e => setForm({ ...form, price_sdg: e.target.value })} className={`${inputCls} mt-1`} placeholder={form.price_mode === 'converted' ? 'Auto' : ''} /></div>
              <div><label className="font-bold text-kajok-muted">{t('priceMode')}</label>
                <select value={form.price_mode} onChange={e => setForm({ ...form, price_mode: e.target.value as any })} className={`styled ${inputCls} mt-1`}>
                  <option value="independent">{t('independent')}</option>
                  <option value="converted">{t('converted')}</option>
                </select>
              </div>
              <div><label className="font-bold text-kajok-muted">{t('brandLabel')}</label>
                <select value={form.brand_id} onChange={e => setForm({ ...form, brand_id: e.target.value })} className={`styled ${inputCls} mt-1`}>
                  <option value="">—</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div><label className="font-bold text-kajok-muted">{t('discountPercent')}</label><input type="number" min={0} max={90} value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: Number(e.target.value) })} className={`${inputCls} mt-1`} /></div>
              <div><label className="font-bold text-kajok-muted">{t('stockLabel')}</label><input type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className={`${inputCls} mt-1`} /></div>
              <div className="sm:col-span-2 flex gap-3 items-end">
                <div className="flex-1"><label className="font-bold text-kajok-muted">{t('imagePath')}</label><input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className={`${inputCls} mt-1 font-latin`} /></div>
                <img src={priceImg} alt="" className="w-16 h-16 object-contain rounded-lg border border-kajok-soft bg-kajok-bg" onError={e => { (e.target as HTMLImageElement).src = '/logo.jpg'; }} />
              </div>
              <div className="sm:col-span-2"><label className="font-bold text-kajok-muted">{t('specs')} — {lang === 'ar' ? 'صيغة: مفتاح: قيمة (سطر لكل مواصفة)' : 'format: key: value (one per line)'}</label><textarea rows={3} value={form.specs} onChange={e => setForm({ ...form, specs: e.target.value })} className="w-full mt-1 p-3 rounded-lg border border-kajok-soft outline-none focus:border-kajok-royal font-latin" placeholder={'الشاشة: 6.7 بوصة\nالمعالج: Snapdragon 8'} /></div>
              <div className="sm:col-span-2 flex flex-wrap gap-4">
                {([['featured', t('featured')], ['bestseller', t('bestseller')], ['new_arrival', t('newArrival')]] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 font-bold text-kajok-deep cursor-pointer"><input type="checkbox" className="accent-[#6C3BCE] w-4 h-4" checked={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />{label}</label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={saving} className="mt-4 w-full h-12 rounded-xl bg-kajok-royal text-white font-extrabold hover:bg-kajok-deep disabled:opacity-60 flex items-center justify-center gap-2">{saving && <Loader2 size={18} className="animate-spin" />}{t('save')}</button>
          </form>
        </div>
      )}
    </div>
  );
}
