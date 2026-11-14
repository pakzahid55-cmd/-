import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export default function Section({ title, link, children }: { title: string; link?: string; children: React.ReactNode }) {
  const { t } = useI18n();
  const { lang } = useI18n();
  const Arrow = lang === 'ar' ? ChevronLeft : ChevronRight;
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 mt-7">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-xl font-extrabold text-kajok-deep flex items-center gap-2">
          <span className="w-1.5 h-5 sm:h-6 rounded-full bg-kajok-royal inline-block" />
          {title}
        </h2>
        {link && (
          <a href={link} className="text-xs sm:text-sm font-bold text-kajok-royal hover:text-kajok-deep flex items-center gap-0.5 transition-colors">
            {t('viewAll')}<Arrow size={16} />
          </a>
        )}
      </div>
      {children}
    </section>
  );
}
