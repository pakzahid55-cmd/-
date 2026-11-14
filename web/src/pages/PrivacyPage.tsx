import { PageHeader } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";

export function PrivacyPage() {
  const { t } = useI18n();
  return (
    <div className="container-kajok max-w-3xl py-8">
      <PageHeader title={t("privacy.title")} subtitle={t("privacy.updated")} />
      <div className="card-kajok space-y-5 p-8 text-sm leading-relaxed text-slate-600 sm:text-base">
        <p>{t("privacy.p1")}</p>
        <p>{t("privacy.p2")}</p>
        <p>{t("privacy.p3")}</p>
        <p>{t("privacy.p4")}</p>
      </div>
    </div>
  );
}
