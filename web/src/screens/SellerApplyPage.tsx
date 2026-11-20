import { hostedPreview } from "../lib/preview";
import { getToken } from "../lib/api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import { useAuth } from "../store/auth";
import { api, API_BASE, ApiError } from "../lib/api";
import type { SellerProfile } from "../lib/types";

const STATUS_KEY: Record<string, string> = {
  pending: "seller.statusPending",
  under_review: "seller.statusUnderReview",
  approved: "seller.statusApproved",
  rejected: "seller.statusRejected",
  suspended: "seller.statusSuspended",
};

export function SellerApplyPage() {
  const { t, pick } = useI18n();
  const { user, initialized } = useAuth();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [docName, setDocName] = useState("");
  const [form, setForm] = useState({
    shopNameEn: "",
    shopNameAr: "",
    legalName: "",
    passportNumber: "",
    passportCountry: "",
    passportExpiry: "",
    businessInfo: "",
  });

  useEffect(() => {
    if (!user || hostedPreview) return;
    api<{ profile: SellerProfile | null }>("/seller/profile")
      .then((r) => {
        setProfile(r.profile);
        if (r.profile) {
          setForm({
            shopNameEn: r.profile.shopNameEn,
            shopNameAr: r.profile.shopNameAr,
            legalName: r.profile.legalName,
            passportNumber: r.profile.passportNumber,
            passportCountry: r.profile.passportCountry,
            passportExpiry: r.profile.passportExpiry,
            businessInfo: r.profile.businessInfo ?? "",
          });
        }
      })
      .catch((e) => setError(e instanceof ApiError && e.status === 401 ? t("auth.signIn") : t("common.error")))
      .finally(() => setLoading(false));
  }, [t, user]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const uploadDoc = async (file: File) => {
    setSaving(true);
    setError("");
    setInfo("");
    try {
        const fd = new FormData();
        fd.append("file", file);
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/seller/document`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? t("common.error"));
      setDocName(file.name);
      setInfo(t("seller.docUploaded"));
      const r = await api<{ profile: SellerProfile | null }>("/seller/profile");
      setProfile(r.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setInfo("");
    try {
      const r = await api<{ profile: SellerProfile }>("/seller/apply", { method: "POST", body: form });
      setProfile(r.profile);
      setInfo(t("seller.applySent"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (hostedPreview) return <div className="container-kujuk py-12"><h1 className="text-xl font-bold">{pick('Seller signup is disabled in this public preview', 'تسجيل البائعين غير متاح في نسخة الاختبار العامة')}</h1><Link to="/products" className="btn-primary mt-4 px-4 py-2">{t('nav.products')}</Link></div>;
  if (initialized && !user) return <div className="container-kujuk py-12"><div className="card-kujuk max-w-2xl p-8"><h1 className="text-2xl font-extrabold">{pick("Sell on KUJUK", "ابدأ البيع على كجوك")}</h1><p className="mt-3 text-sm text-slate-500">{pick("Sign in or create an account, then apply to open your store. The KUJUK team reviews every application before products go live.", "سجّل الدخول أو أنشئ حسابًا، ثم قدّم طلب فتح متجر. يراجع فريق كجوك كل طلب قبل نشر المنتجات.")}</p><div className="mt-5 flex flex-wrap gap-3"><Link className="btn-primary px-5 py-2.5" to="/login?next=/seller/apply">{t('auth.signIn')}</Link><Link className="btn-secondary px-5 py-2.5" to="/register?next=/seller/apply">{t('auth.createAccount')}</Link></div></div></div>;
  if (loading) return <div className="container-kujuk py-16 text-center text-slate-500">{t("common.loading")}</div>;

  return (
    <div className="container-kujuk max-w-3xl py-10">
      <h1 className="text-3xl font-bold">{t("seller.applyTitle")}</h1>
      <p className="mt-2 text-slate-500">{t("seller.applySubtitle")}</p>

      {profile && (
        <div className={`mt-6 rounded-lg px-5 py-4 text-sm ${profile.status === "approved" ? "bg-green-50 text-green-800" : profile.status === "rejected" || profile.status === "suspended" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"}`}>
          <p className="font-semibold">{t("seller.currentStatus")}: {t(STATUS_KEY[profile.status] ?? "seller.statusPending")}</p>
          {profile.reviewNote && <p className="mt-1">{t("seller.reviewNote")}: {profile.reviewNote}</p>}
          {profile.status === "approved" && (
            <Link to="/seller" className="mt-2 inline-block font-semibold text-royal hover:underline">{t("seller.goCenter")} →</Link>
          )}
        </div>
      )}

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="sa-shop-en" className="label-kujuk">{t("seller.shopNameEn")}</label>
            <input id="sa-shop-en" required value={form.shopNameEn} onChange={set("shopNameEn")} className="input-kujuk" dir="ltr" />
          </div>
          <div>
            <label htmlFor="sa-shop-ar" className="label-kujuk">{t("seller.shopNameAr")}</label>
            <input id="sa-shop-ar" required value={form.shopNameAr} onChange={set("shopNameAr")} className="input-kujuk" dir="rtl" />
          </div>
        </div>
        <div>
          <label htmlFor="sa-legal" className="label-kujuk">{t("seller.legalName")}</label>
          <input id="sa-legal" required value={form.legalName} onChange={set("legalName")} className="input-kujuk" dir="ltr" />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="sa-passport" className="label-kujuk">{t("seller.passportNumber")}</label>
            <input id="sa-passport" required value={form.passportNumber} onChange={set("passportNumber")} className="input-kujuk" dir="ltr" />
          </div>
          <div>
            <label htmlFor="sa-country" className="label-kujuk">{t("seller.passportCountry")}</label>
            <input id="sa-country" required value={form.passportCountry} onChange={set("passportCountry")} className="input-kujuk" dir="ltr" />
          </div>
          <div>
            <label htmlFor="sa-expiry" className="label-kujuk">{t("seller.passportExpiry")}</label>
            <input id="sa-expiry" required type="date" value={form.passportExpiry} onChange={set("passportExpiry")} className="input-kujuk" dir="ltr" />
          </div>
        </div>
        <div>
          <label htmlFor="sa-business" className="label-kujuk">{t("seller.businessInfo")}</label>
          <textarea id="sa-business" rows={3} value={form.businessInfo} onChange={set("businessInfo")} className="input-kujuk resize-none" maxLength={1000} />
        </div>

        <div>
          <p className="label-kujuk">{t("seller.passportDoc")}</p>
          <div className="flex items-center gap-3">
            <label className="btn-secondary cursor-pointer px-4 py-2">
              {t("seller.uploadDoc")}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadDoc(f);
                }}
              />
            </label>
            <span className="text-sm text-slate-500">{docName || profile?.passportDocument || t("seller.noDoc")}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{t("seller.docPrivacy")}</p>
        </div>

        {info && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{info}</p>}
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary px-8 py-3">
          {saving ? t("common.loading") : profile ? t("seller.resubmit") : t("seller.submit")}
        </button>
      </form>
    </div>
  );
}
