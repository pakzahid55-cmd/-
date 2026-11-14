import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import { useAuth } from "../store/auth";

export function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-kajok flex min-h-[70vh] items-center justify-center py-12">
      <div className="card-kajok w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">{t("auth.registerTitle")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("auth.registerSubtitle")}</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="reg-name" className="label-kajok">{t("auth.name")}</label>
            <input id="reg-name" required minLength={2} autoComplete="name" value={form.name} onChange={set("name")} className="input-kajok" />
          </div>
          <div>
            <label htmlFor="reg-email" className="label-kajok">{t("auth.email")}</label>
            <input id="reg-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} className="input-kajok" dir="ltr" />
          </div>
          <div>
            <label htmlFor="reg-phone" className="label-kajok">
              {t("auth.phone")} <span className="text-slate-400">({t("common.optional")})</span>
            </label>
            <input id="reg-phone" type="tel" value={form.phone} onChange={set("phone")} className="input-kajok" dir="ltr" />
          </div>
          <div>
            <label htmlFor="reg-password" className="label-kajok">{t("auth.password")}</label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              className="input-kajok"
              dir="ltr"
            />
          </div>
          <div>
            <label htmlFor="reg-confirm" className="label-kajok">{t("auth.confirmPassword")}</label>
            <input
              id="reg-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={set("confirm")}
              className="input-kajok"
              dir="ltr"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? t("common.loading") : t("auth.createAccount")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="font-semibold text-royal hover:underline">
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
