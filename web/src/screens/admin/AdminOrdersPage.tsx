import { useEffect, useState } from "react";
import { PageHeader, Spinner } from "../../components/ui";
import { useI18n } from "../../i18n/I18nProvider";
import { api } from "../../lib/api";
import { formatDate, formatMoney } from "../../lib/format";
import type { Order, OrderStatus } from "../../lib/types";
import { StatusBadge } from "../OrdersPage";

const ALLOWED: Record<OrderStatus, OrderStatus[]> = { pending: ['processing','cancelled'], processing: ['shipped','cancelled'], shipped: ['delivered'], delivered: [], cancelled: [] };
const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

export function AdminOrdersPage() {
  const { t, pick, lang } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [msg, setMsg] = useState("");

  const load = (status = filter) => {
    setLoading(true);
    void api<{ items: Order[] }>(`/admin/orders${status ? `?status=${status}` : ""}`)
      .then((r) => setOrders(r.items)).catch(e => setMsg(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: number, status: OrderStatus, sellerId?: number | null) => {
    try {
      await api(`/admin/orders/${id}/status`, { method: "PUT", body: { status, sellerId } });
      setMsg(t("admin.saved"));
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("common.error"));
    }
  };

  return (
    <div>
      <PageHeader title={t("admin.orders")} />
      {msg && <p className="mb-4 rounded-lg bg-surface px-4 py-2.5 text-sm font-medium text-royal">{msg}</p>}

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setFilter("")} className={`badge-kujuk border px-3 py-1.5 ${!filter ? "bg-royal text-white" : "border-line bg-white"}`}>
          {t("common.all")}
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`badge-kujuk border px-3 py-1.5 ${filter === s ? "bg-royal text-white" : "border-line bg-white"}`}
          >
            {t(`orders.statuses.${s}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card-kujuk overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-xs uppercase text-slate-400">
                <th className="px-5 py-3 text-start">{t("admin.orderRef")}</th>
                <th className="px-5 py-3 text-start">{t("admin.customer")}</th>
                <th className="px-5 py-3 text-start">{t("admin.date")}</th>
                <th className="px-5 py-3 text-start">{t("orders.items")}</th>
                <th className="px-5 py-3 text-start">{t("admin.totalCol")}</th>
                <th className="px-5 py-3 text-start">{t("orders.status")}</th>
                <th className="px-5 py-3 text-start">{t("admin.updateStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line/60 align-top">
                  <td className="px-5 py-3 max-w-48 break-all font-semibold text-royal" dir="ltr">{o.reference}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium">{o.customer.name}</p>
                    <p className="text-xs text-slate-400">{o.customer.city}, {o.customer.country}</p>
                    <p className="text-xs text-slate-400" dir="ltr">{o.customer.phone}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(o.createdAt, lang)}</td>
                  <td className="px-5 py-3">
                    <ul className="space-y-1 text-xs text-slate-500">
                      {o.items.map((i, idx) => (
                        <li key={idx}>
                          {pick(i.nameEn, i.nameAr)} × {i.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-5 py-3 font-semibold">{formatMoney(o.total, o.currency ?? "EGP", lang)}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3">
                    <div className="min-w-40 space-y-3">
                      {(o.sellerOrders?.length ? o.sellerOrders : [{ sellerId: undefined, reference: o.reference, status: o.status, total: o.total, commission: 0 }]).map((part, i) => (
                        <div key={part.reference} className="space-y-1 rounded-md border border-line p-2">
                          {o.sellerOrders?.length ? <><p className="text-xs font-bold">{pick(`Shipment ${i + 1}`, `الشحنة ${i + 1}`)}</p><p className="text-xs text-slate-500">{formatMoney(part.total,o.currency,lang)} · {pick('Commission','العمولة')}: {formatMoney(part.commission,o.currency,lang)}</p></> : null}
                          <select value={part.status} disabled={!ALLOWED[part.status].length} onChange={e => void updateStatus(o.id, e.target.value as OrderStatus, part.sellerId)} className="input-kujuk w-full py-1.5" aria-label={`${t('admin.updateStatus')} ${i + 1}`}>
                            {[part.status, ...ALLOWED[part.status]].map(s => <option key={s} value={s}>{t(`orders.statuses.${s}`)}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="p-6 text-center text-sm text-slate-500">{t("common.noResults")}</p>}
        </div>
      )}
    </div>
  );
}
