import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader, Spinner } from "../components/ui";
import { useI18n } from "../i18n/I18nProvider";
import { api } from "../lib/api";
import { firebaseEnabled } from "../lib/firebase";
import type { Address, PublicUser } from "../lib/types";
import { useAuth } from "../store/auth";

const emptyAddress = {
  label: "Home",
  fullName: "",
  phone: "",
  country: "",
  city: "",
  address: "",
  instructions: "",
  isDefault: false,
};

export function AccountPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [addrForm, setAddrForm] = useState<typeof emptyAddress | null>(null);
  const [addrEditId, setAddrEditId] = useState<number | null>(null);
  const [addrMsg, setAddrMsg] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login?next=/account");
      return;
    }
    setProfile({ name: user.name, phone: user.phone ?? "" });
    void api<{ items: Address[] }>("/auth/addresses")
      .then((r) => setAddresses(r.items))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;
  if (loading) return <Spinner className="py-24" />;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user: updated } = await api<{ user: PublicUser }>("/auth/profile", {
        method: "PUT",
        body: { name: profile.name, phone: profile.phone || null },
      });
      setUser(updated);
      setProfileMsg(t("account.profileSaved"));
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    try {
      await api("/auth/password", { method: "PUT", body: pw });
      setPw({ currentPassword: "", newPassword: "" });
      setPwMsg(t("account.passwordChanged"));
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm) return;
    const body = {
      ...addrForm,
      instructions: addrForm.instructions || null,
    };
    try {
      if (addrEditId) {
        await api(`/auth/addresses/${addrEditId}`, { method: "PUT", body });
      } else {
        await api("/auth/addresses", { method: "POST", body });
      }
      const { items } = await api<{ items: Address[] }>("/auth/addresses");
      setAddresses(items);
      setAddrForm(null);
      setAddrEditId(null);
      setAddrMsg(t("account.addressSaved"));
    } catch (err) {
      setAddrMsg(err instanceof Error ? err.message : t("common.error"));
    }
  };

  const deleteAddress = async (id: number) => {
    if (!confirm(t("account.deleteAddressConfirm"))) return;
    await api(`/auth/addresses/${id}`, { method: "DELETE" });
    setAddresses((a) => a.filter((x) => x.id !== id));
    setAddrMsg(t("account.addressDeleted"));
  };

  return (
    <div className="container-kujuk py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title={t("account.title")} subtitle={user.email} />
        <div className="flex gap-3">
          <Link to="/orders" className="btn-secondary px-5 py-2.5">{t("nav.orders")}</Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="btn-danger px-5 py-2.5"
          >
            {t("nav.logout")}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Profile */}
        <section className="card-kujuk p-6">
          <h2 className="text-lg font-bold">{t("account.profile")}</h2>
          <form onSubmit={saveProfile} className="mt-5 space-y-4">
            <div>
              <label htmlFor="acc-name" className="label-kujuk">{t("auth.name")}</label>
              <input id="acc-name" required minLength={2} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="input-kujuk" />
            </div>
            <div>
              <label htmlFor="acc-phone" className="label-kujuk">{t("auth.phone")}</label>
              <input id="acc-phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="input-kujuk" dir="ltr" />
            </div>
            <div>
              <label className="label-kujuk">{t("auth.email")}</label>
              <input value={user.email} disabled className="input-kujuk bg-surface text-slate-500" dir="ltr" />
            </div>
            {profileMsg && <p className="text-sm font-medium text-green-700">{profileMsg}</p>}
            <button type="submit" className="btn-primary px-6 py-2.5">{t("common.save")}</button>
          </form>
        </section>

        {/* Security */}
        {!firebaseEnabled && (
        <section className="card-kujuk p-6">
          <h2 className="text-lg font-bold">{t("account.security")}</h2>
          <form onSubmit={changePassword} className="mt-5 space-y-4">
            <div>
              <label htmlFor="acc-current" className="label-kujuk">{t("account.currentPassword")}</label>
              <input id="acc-current" type="password" required value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} className="input-kujuk" dir="ltr" />
            </div>
            <div>
              <label htmlFor="acc-new" className="label-kujuk">{t("account.newPassword")}</label>
              <input id="acc-new" type="password" required minLength={8} value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} className="input-kujuk" dir="ltr" />
            </div>
            {pwMsg && <p className={`text-sm font-medium ${pwMsg === t("account.passwordChanged") ? "text-green-700" : "text-red-600"}`}>{pwMsg}</p>}
            <button type="submit" className="btn-primary px-6 py-2.5">{t("account.changePassword")}</button>
          </form>
        </section>
        )}

        {/* Addresses */}
        <section className="card-kujuk p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t("account.savedAddresses")}</h2>
            <button
              type="button"
              onClick={() => {
                setAddrForm({ ...emptyAddress, fullName: user.name, phone: user.phone ?? "" });
                setAddrEditId(null);
              }}
              className="btn-primary px-4 py-2"
            >
              + {t("account.addAddress")}
            </button>
          </div>

          {addrMsg && <p className="mt-3 text-sm font-medium text-green-700">{addrMsg}</p>}

          {addrForm && (
            <form onSubmit={saveAddress} className="mt-5 grid gap-4 rounded-lg border border-line bg-surface/50 p-5 sm:grid-cols-2">
              <div>
                <label className="label-kujuk">{t("account.label")}</label>
                <input required value={addrForm.label} onChange={(e) => setAddrForm((f) => f && { ...f, label: e.target.value })} className="input-kujuk" />
              </div>
              <div>
                <label className="label-kujuk">{t("checkout.fullName")}</label>
                <input required value={addrForm.fullName} onChange={(e) => setAddrForm((f) => f && { ...f, fullName: e.target.value })} className="input-kujuk" />
              </div>
              <div>
                <label className="label-kujuk">{t("checkout.phone")}</label>
                <input required value={addrForm.phone} onChange={(e) => setAddrForm((f) => f && { ...f, phone: e.target.value })} className="input-kujuk" dir="ltr" />
              </div>
              <div>
                <label className="label-kujuk">{t("checkout.country")}</label>
                <input required value={addrForm.country} onChange={(e) => setAddrForm((f) => f && { ...f, country: e.target.value })} className="input-kujuk" />
              </div>
              <div>
                <label className="label-kujuk">{t("checkout.city")}</label>
                <input required value={addrForm.city} onChange={(e) => setAddrForm((f) => f && { ...f, city: e.target.value })} className="input-kujuk" />
              </div>
              <div>
                <label className="label-kujuk">{t("checkout.address")}</label>
                <input required value={addrForm.address} onChange={(e) => setAddrForm((f) => f && { ...f, address: e.target.value })} className="input-kujuk" />
              </div>
              <div className="sm:col-span-2">
                <label className="label-kujuk">{t("checkout.instructions")}</label>
                <input value={addrForm.instructions} onChange={(e) => setAddrForm((f) => f && { ...f, instructions: e.target.value })} className="input-kujuk" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm((f) => f && { ...f, isDefault: e.target.checked })} />
                {t("account.makeDefault")}
              </label>
              <div className="flex gap-3 sm:col-span-2">
                <button type="submit" className="btn-primary px-6 py-2.5">{t("common.save")}</button>
                <button type="button" onClick={() => { setAddrForm(null); setAddrEditId(null); }} className="btn-secondary px-6 py-2.5">
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((a) => (
              <article key={a.id} className="rounded-lg border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{a.label}</p>
                  {a.isDefault && <span className="badge-kujuk bg-surface text-deep">{t("account.isDefault")}</span>}
                </div>
                <p className="mt-2 text-sm text-slate-600">{a.fullName} · {a.phone}</p>
                <p className="mt-1 text-sm text-slate-500">{a.address}, {a.city}, {a.country}</p>
                {a.instructions && <p className="mt-1 text-xs text-slate-400">{a.instructions}</p>}
                <div className="mt-3 flex gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setAddrForm({
                        label: a.label,
                        fullName: a.fullName,
                        phone: a.phone,
                        country: a.country,
                        city: a.city,
                        address: a.address,
                        instructions: a.instructions ?? "",
                        isDefault: a.isDefault,
                      });
                      setAddrEditId(a.id);
                    }}
                    className="font-semibold text-royal hover:underline"
                  >
                    {t("common.edit")}
                  </button>
                  <button type="button" onClick={() => deleteAddress(a.id)} className="font-semibold text-red-600 hover:underline">
                    {t("common.delete")}
                  </button>
                </div>
              </article>
            ))}
            {addresses.length === 0 && !addrForm && <p className="text-sm text-slate-500">—</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
