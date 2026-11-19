import { useEffect, useState } from "react";
import { PageHeader, Spinner } from "../../components/ui";
import { useI18n } from "../../i18n/I18nProvider";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { PublicUser } from "../../lib/types";

type CustomerRow = PublicUser & { orderCount: number };

export function AdminCustomersPage() {
  const { t, lang } = useI18n();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api<{ items: CustomerRow[] }>("/admin/customers")
      .then((r) => setCustomers(r.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={t("admin.customers")} />
      {loading ? (
        <Spinner />
      ) : (
        <div className="card-kajok overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-xs uppercase text-slate-400">
                <th className="px-5 py-3 text-start">{t("auth.name")}</th>
                <th className="px-5 py-3 text-start">{t("auth.email")}</th>
                <th className="px-5 py-3 text-start">{t("auth.phone")}</th>
                <th className="px-5 py-3 text-start">{t("admin.orders")}</th>
                <th className="px-5 py-3 text-start">Role</th>
                <th className="px-5 py-3 text-start">{t("admin.date")}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-line/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface font-bold text-royal">
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-semibold">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500" dir="ltr">{c.email}</td>
                  <td className="px-5 py-3 text-slate-500" dir="ltr">{c.phone ?? "—"}</td>
                  <td className="px-5 py-3 font-semibold">{c.orderCount}</td>
                  <td className="px-5 py-3">
                    <span className={`badge-kajok ${c.role === "admin" ? "bg-violet-100 text-violet-800" : "bg-surface text-deep"}`}>{c.role}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(c.createdAt, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
