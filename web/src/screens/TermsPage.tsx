import { PageHeader } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";

export function TermsPage() {
  const { t } = useI18n();
  return (
    <div className="container-kujuk max-w-3xl py-8">
      <PageHeader title={t("terms.title")} subtitle={t("terms.updated")} />
      <div className="card-kujuk space-y-5 p-8 text-sm leading-relaxed text-slate-600 sm:text-base">
        <p>{t("terms.p1")}</p>
        <p>{t("terms.p2")}</p>
        <p>{t("terms.p3")}</p>
        <p>{t("terms.p4")}</p>
      </div>
    </div>
  );
}
