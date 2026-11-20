import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui';
import { useI18n } from '../i18n/I18nProvider';

export function ContactPage() {
  const { t, pick } = useI18n();
  const email = process.env.NEXT_PUBLIC_KUJUK_SUPPORT_EMAIL;
  return <div className="container-kujuk py-8">
    <PageHeader title={t('contact.title')} subtitle={pick('Help with your order or selling on KUJUK.', 'مساعدة بخصوص طلبك أو البيع على كجوك.')} />
    <section className="card-kujuk max-w-2xl space-y-5 p-6">
      <div className="flex flex-wrap gap-3"><Link to="/orders/track" className="btn-primary px-4 py-2.5">{t('nav.trackOrder')}</Link>
        <Link to="/seller/apply" className="btn-secondary px-4 py-2.5">{t('nav.sell')}</Link></div>
      {email && <a className="block font-semibold text-royal underline" href={`mailto:${email}`} dir="ltr">{email}</a>}
    </section>
  </div>;
}
