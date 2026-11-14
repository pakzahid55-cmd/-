import { useState } from "react";
import { PageHeader } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";

export function ContactPage() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <div className="container-kajok py-8">
      <PageHeader title={t("contact.title")} subtitle={t("contact.subtitle")} />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card-kajok p-6">
          {sent ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 12l5 5L20 6" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-semibold">{t("contact.sent")}</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="c-name" className="label-kajok">{t("contact.name")}</label>
                <input id="c-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-kajok" />
              </div>
              <div>
                <label htmlFor="c-email" className="label-kajok">{t("contact.email")}</label>
                <input id="c-email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-kajok" dir="ltr" />
              </div>
              <div>
                <label htmlFor="c-message" className="label-kajok">{t("contact.message")}</label>
                <textarea id="c-message" required rows={6} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="input-kajok resize-none" />
              </div>
              <button type="submit" className="btn-primary px-8 py-3">{t("contact.send")}</button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card-kajok p-5">
            <h3 className="text-sm font-bold text-slate-400">{t("contact.phoneLabel")}</h3>
            <p className="mt-2 font-semibold" dir="ltr">+20 100 000 0000</p>
          </div>
          <div className="card-kajok p-5">
            <h3 className="text-sm font-bold text-slate-400">{t("contact.emailLabel")}</h3>
            <p className="mt-2 font-semibold" dir="ltr">support@kajok.com</p>
          </div>
          <div className="card-kajok p-5">
            <h3 className="text-sm font-bold text-slate-400">{t("contact.hoursLabel")}</h3>
            <p className="mt-2 text-sm">{t("contact.hours")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
