import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n/I18nContext';
import { ApiError } from '../lib/api';

export default function Register() {
  const { register } = useAuth();
  const { currency, country } = useCurrency();
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register({ ...form, language: lang, country, currency });
      navigate('/', { replace: true });
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full h-12 px-4 rounded-xl border border-kajok-soft bg-white outline-none text-sm focus:border-kajok-royal focus:ring-2 focus:ring-kajok-royal/15';

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-kajok-soft shadow-lift p-6 sm:p-8">
        <img src="/logo.jpg" alt="KAJOK" className="h-14 w-auto object-contain" />
        <h1 className="mt-3 text-2xl font-black text-kajok-deep">{t('register')}</h1>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input required minLength={2} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder={t('fullName')} aria-label={t('fullName')} className={inputCls} autoComplete="name" />
          <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="care@kajok.com" aria-label="Email" className={inputCls} autoComplete="email" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} inputMode="tel" placeholder={t('phone')} aria-label={t('phone')} className={inputCls} autoComplete="tel" />
          <input required type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••  (8+ أحرف)" aria-label="Password" className={inputCls} autoComplete="new-password" />
          <button type="submit" disabled={busy} className="w-full h-12 rounded-xl bg-kajok-royal text-white font-extrabold hover:bg-kajok-deep transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {busy ? <Loader2 size={19} className="animate-spin" /> : <UserPlus size={18} />}{t('register')}
          </button>
        </form>
        <p className="mt-4 text-xs text-center text-kajok-muted">{lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'} <Link to="/login" className="text-kajok-royal font-bold hover:underline">{t('login')}</Link></p>
      </div>
    </div>
  );
}
