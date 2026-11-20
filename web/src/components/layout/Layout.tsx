import { hostedPreview } from "../../lib/preview";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";
import { firebaseEnabled } from "../../lib/firebase";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout() {
  const { pick } = useI18n();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      {!firebaseEnabled && <div className="bg-[#F0EAFB] px-4 py-1.5 text-center text-[11px] font-semibold text-deep">{hostedPreview ? pick('Public preview · No real payment or shipping · Use made-up details', 'نسخة اختبار عامة · لا دفع أو شحن حقيقي · استخدم بيانات وهمية فقط') : pick('Local sandbox · Sample catalog and test orders', 'بيئة اختبار محلية · منتجات وطلبات تجريبية')}</div>}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
