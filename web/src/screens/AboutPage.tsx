import { PageHeader } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { asset } from "../lib/asset";

export function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="container-kujuk py-8">
      <PageHeader title={t("about.title")} subtitle={t("about.tagline")} />

      <div className="overflow-hidden rounded-lg">
        <img src={asset("/images/hero.jpg")} alt="" className="h-56 w-full object-cover sm:h-80" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="section-title">{t("about.storyTitle")}</h2>
          <p className="mt-4 leading-relaxed text-slate-600">{t("about.story")}</p>
        </section>
        <section>
          <h2 className="section-title">{t("about.missionTitle")}</h2>
          <p className="mt-4 leading-relaxed text-slate-600">{t("about.mission")}</p>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="section-title">{t("about.valuesTitle")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[t("about.value1"), t("about.value2"), t("about.value3"), t("about.value4")].map((v, i) => (
            <div key={i} className="card-kujuk flex items-center gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-lg font-extrabold text-royal">
                {i + 1}
              </span>
              <p className="font-semibold">{v}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
