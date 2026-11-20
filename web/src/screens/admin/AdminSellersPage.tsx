import { getToken } from "../../lib/api";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { api, API_BASE, ApiError } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { SellerProfile, SellerStatus } from "../../lib/types";

interface SellerRow {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  shopNameEn: string;
  shopNameAr: string;
  legalName: string;
  passportNumberMasked: string;
  passportCountry: string;
  passportExpiry: string;
  status: SellerStatus;
  reviewNote: string | null;
  hasDocument: boolean;
  createdAt: string;
  updatedAt: string;
}

const STATUS_KEY: Record<string, string> = {
  pending: "seller.statusPending",
  under_review: "seller.statusUnderReview",
  approved: "seller.statusApproved",
  rejected: "seller.statusRejected",
  suspended: "seller.statusSuspended",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  suspended: "bg-slate-200 text-slate-700",
};

export function AdminSellersPage() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<SellerRow[]>([]);
  const [detail, setDetail] = useState<SellerProfile | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [docUrl, setDocUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api<{ items: SellerRow[] }>("/admin/sellers");
      setItems(r.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.error"));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = async (id: number) => {
    setError("");
    setDocUrl(null);
    try {
      const r = await api<{ profile: SellerProfile }>("/admin/sellers/" + id);
      setDetail(r.profile);
      setNote(r.profile.reviewNote ?? "");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.error"));
    }
  };

  const loadDocument = async (id: number) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/admin/sellers/${id}/document`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error(t("seller.noDoc"));
      const blob = await res.blob();
      setDocUrl(URL.createObjectURL(blob));
    } catch {
      setDocUrl("demo");
    }
  };

  const setStatus = async (id: number, status: SellerStatus) => {
    setError("");
    try {
      await api(`/admin/sellers/${id}/status`, { method: "PUT", body: { status, reviewNote: note || null } });
      setDetail(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.error"));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("admin.sellers")}</h1>
      <p className="mt-1 text-slate-500">{t("admin.sellersSubtitle")}</p>

      {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="card-kujuk mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-slate-400">
              <th className="px-5 py-3 text-start">{t("seller.shopNameEn")}</th>
              <th className="px-5 py-3 text-start">{t("admin.customer")}</th>
              <th className="px-5 py-3 text-start">{t("seller.passportNumber")}</th>
              <th className="px-5 py-3 text-start">{t("seller.passportCountry")}</th>
              <th className="px-5 py-3 text-start">{t("orders.status")}</th>
              <th className="px-5 py-3 text-start">{t("admin.date")}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-b border-line/60">
                <td className="px-5 py-3 font-medium">{s.shopNameEn}</td>
                <td className="px-5 py-3 text-slate-500">{s.userEmail}</td>
                <td className="px-5 py-3 font-mono text-slate-500">{s.passportNumberMasked}</td>
                <td className="px-5 py-3 text-slate-500">{s.passportCountry}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[s.status] ?? ""}`}>{t(STATUS_KEY[s.status] ?? "seller.statusPending")}</span>
                </td>
                <td className="px-5 py-3 text-slate-500">{formatDate(s.createdAt, lang)}</td>
                <td className="px-5 py-3 text-end">
                  <button type="button" onClick={() => void openDetail(s.id)} className="font-semibold text-royal hover:underline">
                    {t("admin.review")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="px-5 py-8 text-center text-slate-500">{t("admin.noSellers")}</p>}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetail(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">{detail.shopNameEn} — {detail.shopNameAr}</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p><span className="text-slate-400">{t("seller.legalName")}:</span> <span className="font-semibold">{detail.legalName}</span></p>
              <p><span className="text-slate-400">{t("seller.passportNumber")}:</span> <span className="font-mono font-semibold">{detail.passportNumber}</span></p>
              <p><span className="text-slate-400">{t("seller.passportCountry")}:</span> <span className="font-semibold">{detail.passportCountry}</span></p>
              <p><span className="text-slate-400">{t("seller.passportExpiry")}:</span> <span className="font-semibold">{detail.passportExpiry}</span></p>
              {detail.businessInfo && <p className="sm:col-span-2"><span className="text-slate-400">{t("seller.businessInfo")}:</span> {detail.businessInfo}</p>}
            </div>

            <div className="mt-4">
              <p className="text-sm text-slate-400">{t("seller.passportDoc")}</p>
              {detail.passportDocument ? (
                <>
                  <button type="button" onClick={() => void loadDocument(detail.id)} className="mt-1 font-semibold text-royal hover:underline">
                    {t("seller.viewDoc")}
                  </button>
                  {docUrl && docUrl !== "demo" && (
                    <div className="mt-2">
                      {detail.passportDocument.endsWith(".pdf") ? (
                        <embed src={docUrl} type="application/pdf" className="h-64 w-full rounded border" />
                      ) : (
                        <img src={docUrl} alt="passport" className="max-h-64 rounded border" />
                      )}
                    </div>
                  )}
                  {docUrl === "demo" && <p className="mt-1 text-xs text-slate-400">{t("seller.demoDocNote")}</p>}
                </>
              ) : (
                <p className="mt-1 text-sm text-slate-500">{t("seller.noDoc")}</p>
              )}
            </div>

            <div className="mt-5">
              <label className="label-kujuk">{t("seller.reviewNote")}</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} className="input-kujuk" maxLength={500} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => void setStatus(detail.id, "approved")} className="btn-primary px-5 py-2.5">{t("seller.approve")}</button>
              <button type="button" onClick={() => void setStatus(detail.id, "under_review")} className="btn-secondary px-5 py-2.5">{t("seller.markUnderReview")}</button>
              <button type="button" onClick={() => void setStatus(detail.id, "rejected")} className="rounded-lg bg-red-50 px-5 py-2.5 font-semibold text-red-700 hover:bg-red-100">{t("seller.reject")}</button>
              <button type="button" onClick={() => void setStatus(detail.id, "suspended")} className="rounded-lg bg-slate-100 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-200">{t("seller.suspend")}</button>
              <button type="button" onClick={() => setDetail(null)} className="ms-auto px-4 py-2.5 text-slate-500 hover:text-ink">{t("common.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
