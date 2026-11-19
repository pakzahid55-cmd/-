import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Spinner } from "../../components/ui";
import { useI18n } from "../../i18n/I18nProvider";
import { api } from "../../lib/api";
import { formatDate, formatMoney, formatPrice } from "../../lib/format";
import type { AdminStats } from "../../lib/types";
import { StatusBadge } from "../OrdersPage";

export function AdminDashboardPage() {
  const { t, lang } = useI18n();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void api<AdminStats>("/admin/stats").then(setStats).catch((e) => setError(e instanceof Error ? e.message : t("common.error")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return <Spinner className="py-24" />;

  const maxRevenue = Math.max(...stats.salesByDay.map((d) => d.revenue), 1);

  const cards = [
    { label: t("admin.totalRevenue"), value: formatPrice(stats.totalRevenue, lang), accent: "text-royal" },
    { label: t("admin.totalOrders"), value: stats.totalOrders, accent: "text-deep" },
    { label: t("admin.totalCustomers"), value: stats.totalCustomers, accent: "text-deep" },
    { label: t("admin.totalProducts"), value: stats.totalProducts, accent: "text-deep" },
    { label: t("admin.pendingOrders"), value: stats.pendingOrders, accent: "text-amber-600" },
    { label: t("admin.lowStock"), value: stats.lowStock, accent: "text-red-600" },
  ];

  return (
    <div>
      <PageHeader title={t("admin.dashboard")} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card-kajok p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{c.label}</p>
            <p className={`mt-2 text-2xl font-extrabold ${c.accent}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Sales chart */}
      <div className="card-kajok mt-6 p-6">
        <h2 className="text-lg font-bold">{t("admin.salesChart")}</h2>
        <div className="mt-6 flex h-48 items-end gap-1.5">
          {stats.salesByDay.map((d) => (
            <div key={d.date} className="group flex flex-1 flex-col items-center gap-1.5" title={`${d.date}: ${formatPrice(d.revenue, lang)} (${d.orders})`}>
              <div
                className="w-full rounded-t bg-royal/80 transition-colors group-hover:bg-royal"
                style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%` }}
              />
              <span className="text-[9px] text-slate-400">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card-kajok mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-bold">{t("admin.recentOrders")}</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-royal hover:underline">
            {t("common.viewAll")} →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-start text-xs uppercase text-slate-400">
                <th className="px-6 py-3 text-start">{t("admin.orderRef")}</th>
                <th className="px-6 py-3 text-start">{t("admin.customer")}</th>
                <th className="px-6 py-3 text-start">{t("admin.date")}</th>
                <th className="px-6 py-3 text-start">{t("orders.status")}</th>
                <th className="px-6 py-3 text-start">{t("admin.totalCol")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-line/60">
                  <td className="px-6 py-3 font-semibold text-royal">{o.reference}</td>
                  <td className="px-6 py-3">{o.customer.name}</td>
                  <td className="px-6 py-3 text-slate-500">{formatDate(o.createdAt, lang)}</td>
                  <td className="px-6 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-6 py-3 font-semibold">{formatMoney(o.total, o.currency ?? "EGP", lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
