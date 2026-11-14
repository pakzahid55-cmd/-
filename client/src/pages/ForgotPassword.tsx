import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { MailQuestion, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useI18n } from '../i18n/I18nContext';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: email.trim() }) });
      setSent(true);
    } catch {
      toast('error', 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {sent ? (
        <>
          <CheckCircle2 size={60} className="mx-auto text-emerald-500" strokeWidth={1.5} />
          <h1 className="mt-4 text-2xl font-black text-kajok-deep">{lang === 'ar' ? 'تحقق من بريدك' : 'Check your inbox'}</h1>
          <p className="mt-2 text-sm text-kajok-muted">{lang === 'ar' ? 'إذا كان البريد مسجلاً لدينا فقد تم إنشاء رمز استعادة. في بيئة التطوير يظهر الرمز في سجل الخادم.' : 'If this email is registered, a reset token was generated. In development it is printed to the server log.'}</p>
          <Link to="/login" className="mt-6 inline-block h-12 px-8 leading-[3rem] rounded-xl bg-kajok-royal text-white font-bold">{t('login')}</Link>
        </>
      ) : (
        <>
          <MailQuestion size={60} className="mx-auto text-kajok-royal" strokeWidth={1.5} />
          <h1 className="mt-4 text-2xl font-black text-kajok-deep">{lang === 'ar' ? 'استعادة كلمة المرور' : 'Reset your password'}</h1>
          <form onSubmit={submit} className="mt-6 flex gap-2">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="care@kajok.com" aria-label="Email" autoFocus className="flex-1 h-12 px-4 rounded-xl border border-kajok-soft outline-none focus:border-kajok-royal" />
            <button type="submit" disabled={busy} className="h-12 px-5 rounded-xl bg-kajok-royal text-white font-bold disabled:opacity-60">{busy ? <Loader2 size={18} className="animate-spin" /> : (lang === 'ar' ? 'إرسال' : 'Send')}</button>
          </form>
          <Link to="/login" className="mt-4 inline-block text-xs font-bold text-kajok-royal hover:underline">{lang === 'ar' ? 'عودة لتسجيل الدخول' : 'Back to sign in'}</Link>
        </>
      )}
    </div>
  );
}
