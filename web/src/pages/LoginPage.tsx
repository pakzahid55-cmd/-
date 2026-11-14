import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import { useAuth } from "../store/auth";

export function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      const next = params.get("next") ?? (user.role === "admin" ? "/admin" : "/");
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-kajok flex min-h-[70vh] items-center justify-center py-12">
      <div className="card-kajok w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">{t("auth.loginTitle")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("auth.loginSubtitle")}</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="label-kajok">{t("auth.email")}</label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-kajok"
              dir="ltr"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="label-kajok">{t("auth.password")}</label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-kajok"
              dir="ltr"
            />
          </div>

          <button type="button" onClick={() => setShowForgot((s) => !s)} className="text-sm font-medium text-royal hover:underline">
            {t("auth.forgotPassword")}
          </button>
          {showForgot && <p className="rounded-lg bg-surface px-3.5 py-2.5 text-xs text-slate-500">{t("auth.forgotPasswordText")}</p>}

          {error && <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? t("common.loading") : t("auth.signIn")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="font-semibold text-royal hover:underline">
            {t("auth.createAccount")}
          </Link>
        </p>

        <div className="mt-6 rounded-lg border border-dashed border-line p-3.5 text-xs text-slate-400">
          <p className="font-semibold text-slate-500">Demo accounts:</p>
          <p>Customer — sara@example.com / Customer123!</p>
          <p>Admin — admin@kajok.com / Admin123!</p>
        </div>
      </div>
    </div>
  );
}
