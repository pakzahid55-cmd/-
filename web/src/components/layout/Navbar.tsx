import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";
import { useAuth } from "../../store/auth";
import { cartTotals, useCart } from "../../store/cart";
import { useWishlist } from "../../store/wishlist";
import { SearchBar } from "../SearchBar";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="KAJOK كجوك">
      <svg width="42" height="38" viewBox="0 0 70 64" aria-hidden="true">
        <defs>
          <linearGradient id="kajokK" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={light ? "#C4B5FD" : "#A78BFA"} />
            <stop offset="1" stopColor={light ? "#7C4DDB" : "#32145F"} />
          </linearGradient>
          <linearGradient id="kajokO" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={light ? "#A78BFA" : "#7C4DDB"} />
            <stop offset="1" stopColor={light ? "#6C3BCE" : "#4B2591"} />
          </linearGradient>
        </defs>
        <path d="M57 5 Q54 24 24 55 Q35 32 57 5 Z" fill="url(#kajokK)" />
        <path d="M35 25 Q45 47 67 57 Q57 35 35 25 Z" fill="url(#kajokK)" />
        <circle cx="21" cy="32" r="13.5" fill="none" stroke="url(#kajokO)" strokeWidth="7" />
        <circle cx="21" cy="32" r="9.5" fill={light ? "#2A1052" : "#F8F6FC"} />
        <text
          x="21"
          y="38.5"
          textAnchor="middle"
          fontFamily="Tajawal, sans-serif"
          fontWeight="700"
          fontSize="15"
          fill={light ? "#F8F6FC" : "#32145F"}
        >
          ج
        </text>
      </svg>
      <div className="leading-tight">
        <span className={`block text-lg font-extrabold tracking-wide ${light ? "text-white" : "text-deep"}`}>KAJOK</span>
        <span className={`block text-[15px] font-extrabold ${light ? "text-accent" : "text-royal"}`}>كجوك</span>
      </div>
    </Link>
  );
}

export function Navbar() {
  const { t, toggleLang, lang } = useI18n();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const wishlistItems = useWishlist((s) => s.items);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = cartTotals(items);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-royal" : "text-ink hover:text-royal"}`;

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/products", label: t("nav.products") },
    { to: "/categories", label: t("nav.categories") },
    { to: "/offers", label: t("nav.offers") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      {/* Top strip */}
      <div className="bg-deep text-white">
        <div className="container-kajok flex h-8 items-center justify-between text-xs">
          <p className="hidden sm:block">{t("product.freeShipping")}</p>
          <div className="flex items-center gap-4">
            <Link to="/orders/track" className="hover:text-accent">
              {t("nav.trackOrder")}
            </Link>
            <button type="button" onClick={toggleLang} className="font-semibold hover:text-accent" aria-label={t("nav.language")}>
              {t("nav.language")}
            </button>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-kajok flex items-center gap-4 py-3">
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={t("nav.menu")}
            aria-expanded={mobileOpen}
            className="rounded-lg border border-line p-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        <Logo />

        <div className="hidden flex-1 lg:block">
          <SearchBar />
        </div>

        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <Link
            to={user ? "/account" : "/login"}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium hover:bg-surface"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
            </svg>
            <span className="hidden md:block">{user ? t("nav.greeting", { name: user.name.split(" ")[0] }) : t("nav.login")}</span>
          </Link>

          <Link to="/wishlist" className="relative rounded-lg p-2 hover:bg-surface" aria-label={t("nav.wishlist")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
            </svg>
            {wishlistItems.length > 0 && (
              <span className="absolute -top-0.5 end-[-2px] flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative rounded-lg p-2 hover:bg-surface" aria-label={t("nav.cart")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6L5 3H2" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 end-[-2px] flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-royal px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          {user?.role === "admin" && (
            <Link to="/admin" className="btn-secondary hidden px-3 py-2 xl:flex">
              {t("nav.admin")}
            </Link>
          )}
          {user && (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="hidden px-2.5 py-2 text-sm font-medium text-slate-500 hover:text-royal md:block"
            >
              {t("nav.logout")}
            </button>
          )}
        </div>
      </div>

      {/* Mobile search */}
      <div className="container-kajok pb-3 lg:hidden">
        <SearchBar onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Desktop links */}
      <nav className="hidden border-t border-line lg:block" aria-label="Main">
        <div className="container-kajok flex items-center gap-7 py-2.5">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navLinkClass} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/orders" className={navLinkClass}>
              {t("nav.orders")}
            </NavLink>
          )}
          <div className="ms-auto flex items-center gap-2 text-xs text-slate-400">
            <span className="badge-kajok bg-surface text-deep">{lang === "ar" ? "عربي" : "EN"}</span>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-line bg-white lg:hidden" aria-label="Mobile">
          <div className="container-kajok flex flex-col py-2">
            {[...links, ...(user ? [{ to: "/orders", label: t("nav.orders") }, { to: "/account", label: t("nav.account") }] : [])].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className="border-b border-line/60 py-2.5 text-sm font-medium text-ink"
              >
                {l.label}
              </NavLink>
            ))}
            {user?.role === "admin" && (
              <NavLink to="/admin" onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-semibold text-royal">
                {t("nav.admin")}
              </NavLink>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate("/");
                }}
                className="py-2.5 text-start text-sm font-medium text-red-600"
              >
                {t("nav.logout")}
              </button>
            ) : (
              <div className="flex gap-3 py-3">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                  {t("nav.login")}
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
