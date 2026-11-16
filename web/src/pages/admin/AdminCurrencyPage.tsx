import { useCallback, useEffect, useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { api, ApiError } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { useCurrency } from "../../store/currency";

interface RateRow {
  id: number;
  base: string;
  quote: string;
  rate: number;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

export function AdminCurrencyPage() {
  const { t, lang } = useI18n();
  const refreshGlobal = useCurrency((s) => s.refresh);
  const [current, setCurrent] = useState<{ rate: number | null; updatedAt: string | null }>({ rate: null, updatedAt: null });
  const [history, setHistory] = useState<RateRow[]>([]);
  const [rate, setRate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const load = useCallback(async () => {
    const [cur, hist] = await Promise.all([
      api<{ rate: number | null; updatedAt: string | null }>("/currency", { auth: false }),
      api<{ items: RateRow[] }>("/currency/history"),
    ]);
    setCurrent(cur);
    setHistory(hist.items);
  }, []);

  useEffect(() => {
    void load().catch(() => setError(t("common.error")));
  }, [load, t]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setInfo("");
    try {
      await api("/currency", { method: "POST", body: { rate: Number(rate), note: note || null } });
      setInfo(t("admin.rateSaved"));
      setRate("");
      setNote("");
      await load();
      await refreshGlobal();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("admin.exchangeRate")}</h1>
      <p className="mt-1 text-slate-500">{t("admin.rateSource")}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-kajok p-6">
          <h2 className="text-lg font-bold">{t("admin.rateCurrent")}</h2>
          {current.rate !== null ? (
            <div className="mt-4">
              <p className="text-3xl font-bold text-royal">1 {t("currency.egp")} = {current.rate} {t("currency.sdg")}</p>
              <p className="mt-2 text-sm text-slate-500">
                {t("admin.rateUpdatedAt")}: {current.updatedAt ? formatDate(current.updatedAt, lang) : "—"}
              </p>
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("admin.rateNotSet")}</p>
          )}

          <form onSubmit={save} className="mt-6 space-y-4">
            <div>
              <label htmlFor="rate-value" className="label-kajok">{t("admin.rateLabel")}</label>
              <input
                id="rate-value"
                type="number"
                step="any"
                min="0.0001"
                required
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="input-kajok"
                dir="ltr"
                placeholder="e.g. 2500"
              />
            </div>
            <div>
              <label htmlFor="rate-note" className="label-kajok">{t("admin.rateNote")}</label>
              <input id="rate-note" value={note} onChange={(e) => setNote(e.target.value)} className="input-kajok" maxLength={200} />
            </div>
            {info && <p className="rounded-lg bg-green-50 px-3.5 py-2.5 text-sm text-green-700">{info}</p>}
            {error && <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={saving || !(Number(rate) > 0)} className="btn-primary px-6 py-2.5">
              {saving ? t("common.loading") : t("admin.rateSave")}
            </button>
          </form>
        </div>

        <div className="card-kajok p-6">
          <h2 className="text-lg font-bold">{t("admin.rateHistory")}</h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">{t("admin.rateNotSet")}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-start text-xs text-slate-400">
                    <th className="py-2 text-start">{t("common.date")}</th>
                    <th className="py-2 text-start">{t("admin.rateLabel")}</th>
                    <th className="py-2 text-start">{t("admin.rateNote")}</th>
                    <th className="py-2 text-start">{t("admin.rateBy")}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r.id} className="border-b border-line/60">
                      <td className="py-2.5 text-slate-500">{formatDate(r.createdAt, lang)}</td>
                      <td className="py-2.5 font-semibold">{r.rate}</td>
                      <td className="py-2.5 text-slate-500">{r.note ?? "—"}</td>
                      <td className="py-2.5 text-slate-500">{r.createdBy ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
