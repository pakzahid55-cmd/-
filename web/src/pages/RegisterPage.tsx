import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ConfirmationResult } from "firebase/auth";
import { useI18n } from "../i18n/I18nProvider";
import { confirmPhoneOtp, loginWithGoogle, sendPhoneOtp } from "../lib/firebase-auth";
import { isDemo } from "../lib/mode";
import { useAuth } from "../store/auth";

function friendlyAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/^Firebase:\s*/i, "").replace(/\s*\(auth\/[^)]+\)\.?$/, "");
}

export function RegisterPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { register, loginWithFirebase } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  useEffect(
    () => () => {
      if (window._kajokRecaptcha) {
        window._kajokRecaptcha.clear();
        window._kajokRecaptcha = undefined;
      }
    },
    [],
  );

  const googleSignUp = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const fbUser = await loginWithGoogle();
      const user = await loginWithFirebase(await fbUser.getIdToken());
      navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const conf = await sendPhoneOtp(phone.trim());
      setConfirmation(conf);
      setInfo(t("auth.otpSent"));
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!confirmation) return;
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const fbUser = await confirmPhoneOtp(confirmation, otp);
      const user = await loginWithFirebase(await fbUser.getIdToken());
      navigate(user.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDemo && form.password !== form.confirm) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({
        name: form.name,
        email: form.email,
        password: isDemo ? "" : form.password,
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
        <p className="mt-2 text-sm text-slate-500">
          {isDemo ? "نسخة عرض تجريبية — بدون كلمة مرور، البيانات تُحفظ في متصفحك فقط." : t("auth.registerSubtitle")}
        </p>

        {!isDemo && (
          <div className="mt-6 space-y-3">
            <button type="button" onClick={googleSignUp} disabled={loading} className="btn-secondary w-full py-3">
              {t("auth.signupGoogle")}
            </button>
            <button type="button" onClick={() => setPhoneMode((s) => !s)} disabled={loading} className="btn-secondary w-full py-3">
              {t("auth.signupPhone")}
            </button>
            <div id="kajok-recaptcha" />
            {phoneMode && (
              <div className="space-y-3 rounded-lg border border-line p-4">
                {!confirmation ? (
                  <>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+201xxxxxxxxx"
                      className="input-kajok"
                      dir="ltr"
                      inputMode="tel"
                      autoComplete="tel"
                      aria-label={t("auth.signupPhone")}
                    />
                    <button type="button" onClick={sendOtp} disabled={loading || phone.trim().length < 8} className="btn-primary w-full py-2.5">
                      {t("auth.sendCode")}
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="••••••"
                      className="input-kajok text-center text-lg tracking-[0.4em]"
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={8}
                      aria-label={t("auth.verifyOtp")}
                    />
                    <button type="button" onClick={verifyOtp} disabled={loading || otp.trim().length < 4} className="btn-primary w-full py-2.5">
                      {t("auth.verifyOtp")}
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
              <div className="h-px flex-1 bg-line" />
              <span>{t("auth.orCreateEmail")}</span>
              <div className="h-px flex-1 bg-line" />
            </div>
          </div>
        )}
        {info && <p className="mt-4 rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">{info}</p>}
        <form onSubmit={submit} className="mt-4 space-y-4">
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
          {!isDemo && (
            <>
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
            </>
          )}

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
