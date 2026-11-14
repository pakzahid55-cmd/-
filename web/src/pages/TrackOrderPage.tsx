import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, Spinner } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import { formatDate } from "../lib/format";
import type { OrderStatus } from "../lib/types";

interface TrackedOrder {
  reference: string;
  status: OrderStatus;
  items: { nameEn: string; nameAr: string; image: string; quantity: number }[];
  total: number;
  createdAt: string;
  updatedAt: string;
  city: string;
  country: string;
}

const STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

export function TrackOrderPage() {
  const { t, pick, lang } = useI18n();
  const [params, setParams] = useSearchParams();
  const [ref, setRef] = useState(params.get("ref") ?? "");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await api<{ order: TrackedOrder }>(`/orders/track/${encodeURIComponent(ref.trim())}`, { auth: false });
      setOrder(res.order);
      const next = new URLSearchParams();
      next.set("ref", res.order.reference);
      setParams(next);
    } catch {
      setError(t("track.notFound"));
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div className="container-kajok py-8">
      <PageHeader title={t("track.title")} subtitle={t("track.subtitle")} />

      <form onSubmit={submit} className="card-kajok mx-auto max-w-xl p-6">
        <div className="flex gap-3">
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder={t("track.placeholder")}
            aria-label={t("track.placeholder")}
            className="input-kajok"
            dir="ltr"
          />
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {t("track.track")}
          </button>
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}
      </form>

      {loading && <Spinner />}

      {order && (
        <div className="card-kajok mx-auto mt-8 max-w-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">{t("orders.orderNumber")}</p>
              <p className="text-xl font-bold text-royal">{order.reference}</p>
            </div>
            <div className="text-end">
              <p className="text-sm text-slate-400">{t("track.placedOn")}</p>
              <p className="font-semibold">{formatDate(order.createdAt, lang)}</p>
            </div>
          </div>

          {order.status === "cancelled" ? (
            <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {t("orders.statuses.cancelled")}
            </p>
          ) : (
            <ol className="mt-8 space-y-0">
              {STEPS.map((step, i) => {
                const done = i <= stepIndex;
                return (
                  <li key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                          done ? "bg-royal text-white" : "bg-surface text-slate-400"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </span>
                      {i < STEPS.length - 1 && <span className={`h-10 w-0.5 ${i < stepIndex ? "bg-royal" : "bg-line"}`} />}
                    </div>
                    <div className="pb-2">
                      <p className={`font-semibold ${done ? "text-ink" : "text-slate-400"}`}>
                        {t(`orders.statuses.${step}`)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-6 border-t border-line pt-5">
            <p className="text-sm text-slate-400">{t("track.deliverTo")}</p>
            <p className="mt-1 font-medium">
              {order.city}, {order.country}
            </p>
            <ul className="mt-4 space-y-2">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <img src={i.image} alt="" className="h-10 w-10 rounded-md object-cover" />
                  <span className="flex-1">{pick(i.nameEn, i.nameAr)}</span>
                  <span className="text-slate-500">× {i.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
