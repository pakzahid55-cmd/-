import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";
import { isDemo } from "../../lib/mode";
import { Logo } from "./Navbar";

export function Footer() {
  const { t, toggleLang } = useI18n();
  return (
    <footer className="mt-16 bg-deep text-white">
      <div className="container-kajok grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">{t("footer.aboutText")}</p>
          <div className="mt-5 flex items-center gap-3">
            {["facebook", "instagram", "x", "youtube"].map((social) => (
              <a
                key={social}
                href="#"
                aria-label={social}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-royal hover:text-white"
              >
                <SocialIcon name={social} />
              </a>
            ))}
          </div>
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
            <li>support@kajok.com</li>
            <li dir="ltr">+20 100 000 0000</li>
            <li>{t("contact.hours")}</li>
          </ul>
          <div className="mt-5">
            <p className="text-xs text-white/50">{t("footer.paymentMethods")}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold">{t("footer.cashOnDelivery")}</span>
              {!isDemo && (
                <>
                  <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold">VISA</span>
                  <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold">Mastercard</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-kajok flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} KAJOK. {t("footer.rights")}
          </p>
          <button type="button" onClick={toggleLang} className="rounded-md border border-white/20 px-3 py-1.5 font-semibold text-white/80 hover:border-accent hover:text-white">
            {t("nav.language")}
          </button>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  if (name === "facebook")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v8h4v-8h3l1-4h-4V9c0-.6.4-1 1-1z" />
      </svg>
    );
  if (name === "instagram")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    );
  if (name === "x")
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 3h3l-6.6 7.6L21.8 21h-6l-4.7-6.1L5.7 21h-3l7.1-8.1L2.5 3h6.2l4.3 5.6L17.5 3zm-1 16h1.7L7.6 4.8H5.8L16.5 19z" />
      </svg>
    );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 8.2s-.2-1.5-.8-2.2c-.8-.9-1.7-.9-2.1-1C16.2 4.7 12 4.7 12 4.7h-.1s-4.2 0-7.1.3c-.4 0-1.3 0-2.1 1-.6.7-.8 2.2-.8 2.2S1.7 10 1.7 11.7v1.6c0 1.7.2 3.5.2 3.5s.2 1.5.8 2.2c.8.9 1.8.8 2.3 1 1.7.2 7 .3 7 .3s4.2 0 7.1-.3c.4 0 1.3-.1 2.1-1 .6-.7.8-2.2.8-2.2s.2-1.8.2-3.5v-1.6c0-1.7-.2-3.4-.2-3.4zM9.8 15.3V9.2l5.5 3.1-5.5 3z" />
    </svg>
  );
}
