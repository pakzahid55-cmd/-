import { Navigate, NavLink, Outlet, Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";
import { isDemo } from "../../lib/mode";
import { useAuth } from "../../store/auth";

export function AdminLayout() {
  const { t } = useI18n();
  const { user, initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-royal" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login?next=/admin" replace />;
  if (user.role !== "admin") {
    return (
      <div className="container-kajok py-20 text-center">
        <h1 className="text-2xl font-bold text-red-600">{t("admin.noAccess")}</h1>
        <p className="mt-3 text-slate-500">{t("admin.loginAsAdmin")}</p>
        <Link to="/" className="btn-primary mt-6 inline-flex px-6 py-3">
          {t("admin.backToStore")}
        </Link>
      </div>
    );
  }

  const links = [
    { to: "/admin", label: t("admin.dashboard"), icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
    { to: "/admin/products", label: t("admin.products"), icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { to: "/admin/catalog", label: `${t("admin.categories")} / ${t("admin.brands")}`, icon: "M4 6h16M4 12h16M4 18h16" },
    { to: "/admin/orders", label: t("admin.orders"), icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { to: "/admin/customers", label: t("admin.customers"), icon: "M17 20h5v-2a4 4 0 00-3-3.9M9 20H4v-2a4 4 0 013-3.9m6-3.1a4 4 0 10-4-4 4 4 0 004 4z" },
    { to: "/admin/coupons", label: t("admin.coupons"), icon: "M7 7h10v4a2 2 0 110 4v4H7v-4a2 2 0 110-4V7z" },
    { to: "/admin/banners", label: t("admin.banners"), icon: "M4 5h16v10H4zM4 19h16" },
  ];

  return (
    <div className="container-kajok flex flex-col gap-8 py-8 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-60">
        <div className="card-kajok overflow-hidden">
          <div className="bg-deep px-5 py-4">
            <p className="text-xs font-semibold text-accent">KAJOK</p>
            <p className="font-bold text-white">{t("nav.admin")}</p>
          </div>
          <nav className="flex flex-row flex-wrap gap-1 p-2 lg:flex-col">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-md px-3.5 py-2.5 text-sm font-medium ${
                    isActive ? "bg-royal text-white" : "text-ink hover:bg-surface"
                  }`
                }
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d={l.icon} />
                </svg>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-line p-3">
            <Link to="/" className="btn-secondary w-full px-3 py-2">
              ← {t("admin.backToStore")}
            </Link>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
