import { FormEvent, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Loader2, MailQuestion } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n/I18nContext';
import { ApiError } from '../lib/api';

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full h-12 px-4 rounded-xl border border-kajok-soft bg-white outline-none text-sm focus:border-kajok-royal focus:ring-2 focus:ring-kajok-royal/15';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden shadow-lift border border-kajok-soft my-6">
      <div className="relative hidden md:block bg-kajok-deep">
        <img src="/hero-fashion.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-kajok-deep via-kajok-deep/30 to-transparent" />
        <div className="absolute bottom-8 start-8 text-white max-w-sm">
          <p className="text-3xl font-black leading-snug">Your Order.<br />Your Way.</p>
          <p className="mt-2 text-white/80 text-sm">تسوّق من كجوك في مصر والسودان — الدفع عند الاستلام متاح دائماً</p>
        </div>
      </div>
      <div className="p-6 sm:p-10">
        <img src="/logo.jpg" alt="KAJOK" className="h-16 w-auto object-contain" />
        <h1 className="mt-4 text-2xl font-black text-kajok-deep">{t('login')}</h1>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="care@kajok.com" aria-label="Email" className={inputCls} autoComplete="email" />
          <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" aria-label="Password" className={inputCls} autoComplete="current-password" />
          <button type="submit" disabled={busy} className="w-full h-12 rounded-xl bg-kajok-royal text-white font-extrabold hover:bg-kajok-deep transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {busy ? <Loader2 size={19} className="animate-spin" /> : <LogIn size={18} />}{t('login')}
          </button>
        </form>
        <div className="mt-4 flex items-center justify-between text-xs">
          <Link to="/forgot-password" className="flex items-center gap-1 text-kajok-royal font-bold hover:underline"><MailQuestion size={14} />{lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}</Link>
          <Link to="/register" className="text-kajok-deep font-bold hover:underline">{t('register')}</Link>
        </div>
        <div className="mt-6 text-[11px] text-kajok-muted bg-kajok-bg rounded-xl p-3 leading-5">
          <p className="font-bold">حسابات الديمو / Demo accounts</p>
          <p className="font-latin">customer: user@kajok.com / User@12345</p>
          <p className="font-latin">admin: admin@kajok.com / Admin@12345</p>
        </div>
      </div>
    </div>
  );
}
