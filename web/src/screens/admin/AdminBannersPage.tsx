import { useEffect, useState } from "react";
import { ImagePicker, VideoPicker } from "../../components/Media";
import { PageHeader } from "../../components/ui";
import { useI18n } from "../../i18n/I18nProvider";
import { api } from "../../lib/api";
import type { Banner } from "../../lib/types";

const emptyForm = {
  titleEn: "",
  titleAr: "",
  subtitleEn: "",
  subtitleAr: "",
  image: "",
  video: "",
  link: "/",
  active: true,
  sort: 0,
};

export function AdminBannersPage() {
  const { t } = useI18n();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState<typeof emptyForm | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const load = () => void api<{ items: Banner[] }>("/admin/banners").then((r) => setBanners(r.items));
  useEffect(load, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      if (editId) await api(`/admin/banners/${editId}`, { method: "PUT", body: form });
      else await api("/admin/banners", { method: "POST", body: form });
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
        <PageHeader title={t("admin.banners")} />
        <button type="button" onClick={() => { setForm({ ...emptyForm }); setEditId(null); }} className="btn-primary px-5 py-2.5">
          + {t("common.add")}
        </button>
      </div>

      {msg && <p className="mb-4 rounded-lg bg-surface px-4 py-2.5 text-sm font-medium text-royal">{msg}</p>}

      {form && (
        <form onSubmit={save} className="card-kujuk mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <label className="label-kujuk">{t("admin.titleEn")}</label>
            <input required value={form.titleEn} onChange={(e) => setForm((f) => f && { ...f, titleEn: e.target.value })} className="input-kujuk" />
          </div>
          <div>
            <label className="label-kujuk">{t("admin.titleAr")}</label>
            <input required dir="rtl" value={form.titleAr} onChange={(e) => setForm((f) => f && { ...f, titleAr: e.target.value })} className="input-kujuk" />
          </div>
          <div>
            <label className="label-kujuk">{t("admin.subtitleEn")}</label>
            <input value={form.subtitleEn} onChange={(e) => setForm((f) => f && { ...f, subtitleEn: e.target.value })} className="input-kujuk" />
          </div>
          <div>
            <label className="label-kujuk">{t("admin.subtitleAr")}</label>
            <input dir="rtl" value={form.subtitleAr} onChange={(e) => setForm((f) => f && { ...f, subtitleAr: e.target.value })} className="input-kujuk" />
          </div>
          <div>
            <label className="label-kujuk">{t("admin.imageField")}</label>
            <ImagePicker
              images={form.image ? [form.image] : []}
              single
              onChange={(imgs) => setForm((f) => f && { ...f, image: imgs[0] ?? "" })}
            />

            <label className="label-kujuk">{t("admin.videoField")}</label>
            <VideoPicker
              video={form.video || null}
              onChange={(v) => setForm((f) => f && { ...f, video: v ?? "" })}
            />
          </div>
          <div>
            <label className="label-kujuk">{t("admin.link")}</label>
            <input value={form.link} onChange={(e) => setForm((f) => f && { ...f, link: e.target.value })} className="input-kujuk" dir="ltr" />
          </div>
          <div>
            <label className="label-kujuk">{t("admin.sort")}</label>
            <input type="number" value={form.sort} onChange={(e) => setForm((f) => f && { ...f, sort: Number(e.target.value) })} className="input-kujuk w-28" />
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

      <div className="space-y-4">
        {banners.map((b) => (
          <article key={b.id} className="card-kujuk flex flex-col gap-4 p-5 sm:flex-row">
            <img src={b.image} alt="" className="h-28 w-full rounded-lg object-cover sm:w-48" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{b.titleEn}</h3>
                {b.active && <span className="badge-kujuk bg-green-100 text-green-700">{t("admin.active")}</span>}
              </div>
              <p className="mt-1 text-sm text-slate-500">{b.subtitleEn}</p>
              <p className="mt-1 text-xs text-slate-400">{b.link} · {t("admin.sort")} {b.sort}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setEditId(b.id);
                  setForm({
                    titleEn: b.titleEn,
                    titleAr: b.titleAr,
                    subtitleEn: b.subtitleEn,
                    subtitleAr: b.subtitleAr,
                    image: b.image,
                    video: b.video ?? "",
                    link: b.link,
                    active: b.active,
                    sort: b.sort,
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
                  await api(`/admin/banners/${b.id}`, { method: "DELETE" });
                  load();
                }}
                className="font-semibold text-red-600 hover:underline"
              >
                {t("common.delete")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
