import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { isDemo } from "../../lib/mode";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      {isDemo && (
        <div className="bg-accent px-4 py-2 text-center text-xs font-semibold text-deep">
          🎯 نسخة عرض تجريبية للتصميم — البيانات تُحفظ في متصفحك فقط، بدون خادم أو مدفوعات حقيقية
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
