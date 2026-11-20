import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { ConfirmationResult } from "@firebase/auth";
import { useI18n } from "../i18n/I18nProvider";
import { confirmPhoneOtp, loginWithGoogle, sendPasswordReset, sendPhoneOtp } from "../lib/firebase-auth";
import { firebaseEnabled, googleEnabled, phoneEnabled } from "../lib/firebase";
import { useAuth } from "../store/auth";

function friendlyAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.replace(/^Firebase:\s*/i, "").replace(/\s*\(auth\/[^)]+\)\.?$/, "");
}

export function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, loginWithFirebase } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  useEffect(
    () => () => {
      if (window._kujukRecaptcha) {
        window._kujukRecaptcha.clear();
        window._kujukRecaptcha = undefined;
      }
    },
    [],
  );

  const goNext = (role: string) => {
    const next = params.get("next") ?? (role === "admin" ? "/admin" : "/");
    navigate(next, { replace: true });
  };

  const googleLogin = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const fbUser = await loginWithGoogle();
      const user = await loginWithFirebase(await fbUser.getIdToken());
      goNext(user.role);
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
      goNext(user.role);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const doReset = async () => {
    if (!email.trim()) {
      setError(t("auth.emailRequired"));
      return;
    }
    setLoading(true);
    setError("");
    setInfo("");
    try {
      await sendPasswordReset(email.trim());
      setInfo(t("auth.resetSent"));
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      goNext(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-kujuk flex min-h-[70vh] items-center justify-center py-12">
      <div className="card-kujuk w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">{t("auth.loginTitle")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("auth.loginSubtitle")}</p>

        {firebaseEnabled && (googleEnabled || phoneEnabled) && <div className="mt-6 space-y-3">
            {googleEnabled && <button type="button" onClick={googleLogin} disabled={loading} className="btn-secondary w-full py-3">
              {t("auth.continueGoogle")}
            </button>}
            {phoneEnabled && <button type="button" onClick={() => setPhoneMode((s) => !s)} disabled={loading} className="btn-secondary w-full py-3">
              {t("auth.continuePhone")}
            </button>}
            <div id="kujuk-recaptcha" />
            {phoneMode && (
              <div className="space-y-3 rounded-lg border border-line p-4">
                {!confirmation ? (
                  <>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+201xxxxxxxxx"
                      className="input-kujuk"
                      dir="ltr"
                      inputMode="tel"
                      autoComplete="tel"
                      aria-label={t("auth.continuePhone")}
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
                      className="input-kujuk text-center text-lg tracking-[0.4em]"
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
              <span>{t("auth.orEmail")}</span>
              <div className="h-px flex-1 bg-line" />
            </div>
          </div>}
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="login-email" className="label-kujuk">{t("auth.email")}</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-kujuk"
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="label-kujuk">{t("auth.password")}</label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-kujuk"
                dir="ltr"
              />
            </div>

            {firebaseEnabled && <button type="button" onClick={doReset} className="text-sm font-medium text-royal hover:underline">
              {t("auth.forgotPassword")}
            </button>}

            {info && <p className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">{info}</p>}
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
      </div>
    </div>
  );
}
