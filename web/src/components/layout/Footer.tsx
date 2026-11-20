import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";
import { Logo } from "./Navbar";

export function Footer() {
  const { t, toggleLang } = useI18n();
  return (
    <footer className="mt-16 bg-deep text-white">
      <div className="container-kujuk grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{t("footer.aboutText")}</p>
        </div>

        <nav aria-label="Quick links">
          <h3 className="text-sm font-bold uppercase tracking-wider text-accent">{t("footer.quickLinks")}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><Link to="/products" className="hover:text-white">{t("nav.products")}</Link></li>
            <li><Link to="/categories" className="hover:text-white">{t("nav.categories")}</Link></li>
            <li><Link to="/offers" className="hover:text-white">{t("nav.offers")}</Link></li>
            <li><Link to="/wishlist" className="hover:text-white">{t("nav.wishlist")}</Link></li>
          </ul>
        </nav>

        <nav aria-label="Customer service">
          <h3 className="text-sm font-bold uppercase tracking-wider text-accent">{t("footer.customerService")}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><Link to="/orders/track" className="hover:text-white">{t("nav.trackOrder")}</Link></li>
            <li><Link to="/contact" className="hover:text-white">{t("nav.contact")}</Link></li>
            <li><Link to="/privacy" className="hover:text-white">{t("privacy.title")}</Link></li>
            <li><Link to="/terms" className="hover:text-white">{t("terms.title")}</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-accent">{t("footer.contactUs")}</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><Link to="/seller/apply" className="hover:text-white">{t("nav.sell")}</Link></li>
          </ul>
          <div className="mt-5">
            <p className="text-xs text-white/50">{t("footer.paymentMethods")}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold">{t("footer.cashOnDelivery")}</span>

            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-kujuk flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} KUJUK. {t("footer.rights")}
          </p>
          <button type="button" onClick={toggleLang} className="rounded-md border border-white/20 px-3 py-1.5 font-semibold text-white/80 hover:border-accent hover:text-white">
            {t("nav.language")}
          </button>
        </div>
      </div>
    </footer>
  );
}
