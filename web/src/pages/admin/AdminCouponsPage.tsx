import { useEffect, useState } from "react";
import { PageHeader } from "../../components/ui";
import { useI18n } from "../../i18n/I18nProvider";
import { api } from "../../lib/api";
import type { Coupon } from "../../lib/types";

const emptyForm = {
  code: "",
  type: "percent" as "percent" | "fixed",
  value: 10,
  minOrder: 0,
  active: true,
  expiresAt: "",
};

export function AdminCouponsPage() {
  const { t } = useI18n();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const load = () => void api<{ items: Coupon[] }>("/admin/coupons").then((r) => setCoupons(r.items));
  useEffect(load, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const body = {
      code: form.code.toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrder: Number(form.minOrder),
      active: form.active,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    try {
      if (editId) await api(`/admin/coupons/${editId}`, { method: "PUT", body });
      else await api("/admin/coupons", { method: "POST", body });
      setMsg(t("admin.saved"));
      setForm(null);
      setEditId(null);
      load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("common.error"));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader title={t("admin.coupons")} />
        <button type="button" onClick={() => { setForm({ ...emptyForm }); setEditId(null); }} className="btn-primary px-5 py-2.5">
          + {t("common.add")}
        </button>
      </div>

      {msg && <p className="mb-4 rounded-lg bg-surface px-4 py-2.5 text-sm font-medium text-royal">{msg}</p>}

      {form && (
        <form onSubmit={save} className="card-kajok mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <label className="label-kajok">{t("admin.code")}</label>
            <input required value={form.code} onChange={(e) => setForm((f) => f && { ...f, code: e.target.value })} className="input-kajok" dir="ltr" />
          </div>
          <div>
            <label className="label-kajok">{t("admin.type")}</label>
            <select value={form.type} onChange={(e) => setForm((f) => f && { ...f, type: e.target.value as "percent" | "fixed" })} className="input-kajok">
              <option value="percent">{t("admin.percent")}</option>
              <option value="fixed">{t("admin.fixed")}</option>
            </select>
          </div>
          <div>
            <label className="label-kajok">{t("admin.value")}</label>
            <input type="number" min="0" step="0.01" required value={form.value} onChange={(e) => setForm((f) => f && { ...f, value: Number(e.target.value) })} className="input-kajok" />
          </div>
          <div>
            <label className="label-kajok">{t("admin.minOrder")}</label>
            <input type="number" min="0" step="0.01" value={form.minOrder} onChange={(e) => setForm((f) => f && { ...f, minOrder: Number(e.target.value) })} className="input-kajok" />
          </div>
          <div>
            <label className="label-kajok">{t("admin.expiresAt")}</label>
            <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => f && { ...f, expiresAt: e.target.value })} className="input-kajok" />
          </div>
          <label className="flex items-center gap-2 self-end text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => f && { ...f, active: e.target.checked })} />
            {t("admin.active")}
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" className="btn-primary px-6 py-2.5">{t("common.save")}</button>
            <button type="button" onClick={() => { setForm(null); setEditId(null); }} className="btn-secondary px-6 py-2.5">{t("common.cancel")}</button>
          </div>
        </form>
      )}

      <div className="card-kajok overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface/60 text-xs uppercase text-slate-400">
              <th className="px-5 py-3 text-start">{t("admin.code")}</th>
              <th className="px-5 py-3 text-start">{t("admin.value")}</th>
              <th className="px-5 py-3 text-start">{t("admin.minOrder")}</th>
              <th className="px-5 py-3 text-start">{t("admin.active")}</th>
              <th className="px-5 py-3 text-start">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-line/60">
                <td className="px-5 py-3 font-bold text-royal" dir="ltr">{c.code}</td>
                <td className="px-5 py-3">{c.type === "percent" ? `${c.value}%` : `$${c.value}`}</td>
                <td className="px-5 py-3">${c.minOrder.toFixed(2)}</td>
                <td className="px-5 py-3">
                  <span className={`badge-kajok ${c.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {c.active ? t("admin.active") : "—"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(c.id);
                        setForm({
                          code: c.code,
                          type: c.type,
                          value: c.value,
                          minOrder: c.minOrder,
                          active: c.active,
                          expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
                        });
                      }}
                      className="font-semibold text-royal hover:underline"
                    >
                      {t("common.edit")}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm(t("admin.confirmDelete"))) return;
                        await api(`/admin/coupons/${c.id}`, { method: "DELETE" });
                        load();
                      }}
                      className="font-semibold text-red-600 hover:underline"
                    >
                      {t("common.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
