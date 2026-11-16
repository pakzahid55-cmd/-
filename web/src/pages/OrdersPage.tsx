import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState, PageHeader, Spinner } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import { formatDate, formatMoney } from "../lib/format";
import type { Order, OrderStatus } from "../lib/types";
import { useAuth } from "../store/auth";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useI18n();
  return <span className={`badge-kajok ${statusColors[status]}`}>{t(`orders.statuses.${status}`)}</span>;
}

export function OrdersPage() {
  const { t, pick, lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login?next=/orders");
      return;
    }
    void api<{ items: Order[] }>("/orders")
      .then((r) => setOrders(r.items))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <Spinner className="py-24" />;

  return (
    <div className="container-kajok py-8">
      <PageHeader title={t("orders.title")} />
      {orders.length === 0 ? (
        <EmptyState
          title={t("orders.noOrders")}
          text={t("orders.noOrdersText")}
          action={
            <Link to="/products" className="btn-primary px-6 py-3">
              {t("cart.continueShopping")}
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <article key={o.id} className="card-kajok overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="flex w-full flex-wrap items-center gap-4 p-5 text-start hover:bg-surface/50"
              >
                <div className="min-w-[140px]">
                  <p className="text-xs text-slate-400">{t("orders.orderNumber")}</p>
                  <p className="font-bold text-royal">{o.reference}</p>
                </div>
                <div className="min-w-[110px]">
                  <p className="text-xs text-slate-400">{t("orders.date")}</p>
                  <p className="text-sm font-medium">{formatDate(o.createdAt, lang)}</p>
                </div>
                <div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="ms-auto flex items-center gap-4">
                  <div className="text-end">
                    <p className="text-xs text-slate-400">{t("orders.total")}</p>
                    <p className="font-bold">{formatMoney(o.total, o.currency ?? "EGP", lang)}</p>
                    {(o.currency ?? "EGP") === "SDG" && (
                      <p className="text-[11px] text-slate-400">{t("currency.rateApplied", { rate: o.exchangeRate })}</p>
                    )}
                  </div>
                  <span className={`transition-transform ${expanded === o.id ? "rotate-180" : ""}`}>⌄</span>
                </div>
              </button>

              {expanded === o.id && (
                <div className="border-t border-line bg-surface/40 p-5">
                  <ul className="space-y-3">
                    {o.items.map((i) => (
                      <li key={i.productId} className="flex items-center gap-3">
                        <img src={i.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                        <Link to={`/product/${i.slug}`} className="flex-1 text-sm font-medium hover:text-royal">
                          {pick(i.nameEn, i.nameAr)}
                        </Link>
                        <span className="text-sm text-slate-500">× {i.quantity}</span>
                        <span className="text-sm font-semibold">{formatMoney(i.price * i.quantity, o.currency ?? "EGP", lang)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
                    <p className="text-slate-500">
                      {t("track.deliverTo")}: {o.customer.city}, {o.customer.country}
                    </p>
                    <Link to={`/orders/track?ref=${o.reference}`} className="font-semibold text-royal hover:underline">
                      {t("checkout.trackIt")} →
                    </Link>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
