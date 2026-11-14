import { Link } from 'react-router-dom';
import { PhoneCall, Mail, MapPin, Banknote, Clock } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export default function Footer() {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-kajok-deep text-white/85 mt-14">
      {/* USP strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-[13px]">
          <div className="flex items-center justify-center gap-2"><Banknote size={16} className="text-kajok-accent" /> {t('usp2Title')} — مصر والسودان</div>
          <div className="flex items-center justify-center gap-2"><Clock size={16} className="text-kajok-accent" /> {t('usp1Title')} — {t('usp1Sub')}</div>
          <div className="flex items-center justify-center gap-2"><PhoneCall size={16} className="text-kajok-accent" /> {t('hotline')}</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-[13px]">
        <div className="col-span-2 md:col-span-1">
          <img src="/logo.jpg" alt="KAJOK" className="h-16 w-auto rounded-lg bg-white p-1.5 object-contain" />
          <p className="mt-3 leading-6 text-white/70">{t('footerAboutText')}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15">{t('marketEgypt')}</span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/15">{t('marketSudan')}</span>
          </div>
        </div>

        <nav aria-label={t('customerService')}>
          <h4 className="text-white font-extrabold mb-3 tracking-wide">{t('customerService')}</h4>
          <ul className="space-y-2">
            <li><Link to="/search" className="hover:text-kajok-accent">{t('helpCenter')}</Link></li>
            <li><Link to="/search?on_sale=1" className="hover:text-kajok-accent">{t('shippingInfo')}</Link></li>
            <li><Link to="/account" className="hover:text-kajok-accent">{t('returnsPolicy')}</Link></li>
            <li><Link to="/account" className="hover:text-kajok-accent">{t('faq')}</Link></li>
            <li><a href="tel:19000" className="hover:text-kajok-accent flex items-center gap-1.5"><PhoneCall size={13} />{t('contactUs')} — 19000</a></li>
          </ul>
        </nav>

        <nav aria-label={t('company')}>
          <h4 className="text-white font-extrabold mb-3 tracking-wide">{t('company')}</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-kajok-accent">{t('aboutUs')}</Link></li>
            <li><Link to="/search" className="hover:text-kajok-accent">{t('careers')}</Link></li>
            <li><Link to="/" className="hover:text-kajok-accent">{t('privacyPolicy')}</Link></li>
            <li><Link to="/" className="hover:text-kajok-accent">{t('terms')}</Link></li>
          </ul>
        </nav>

        <div>
          <h4 className="text-white font-extrabold mb-3 tracking-wide">{t('contactUs')}</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-1.5"><MapPin size={13} className="text-kajok-accent shrink-0" />{lang === 'ar' ? 'القاهرة، مصر — الخرطوم، السودان' : 'Cairo, Egypt — Khartoum, Sudan'}</li>
            <li className="flex items-center gap-1.5"><PhoneCall size={13} className="text-kajok-accent shrink-0" />19000</li>
            <li className="flex items-center gap-1.5"><Mail size={13} className="text-kajok-accent shrink-0" />care@kajok.com</li>
          </ul>
          <p className="mt-4 text-[11px] text-white/55 leading-5">{t('paymentNote')}</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between text-[11.5px] text-white/60">
          <span>© {year} KAJOK — Your Order. Your Way. {t('rights')}.</span>
          <span className="hidden sm:block font-latin tracking-widest text-white/40">KAJOK</span>
        </div>
      </div>
    </footer>
  );
}
