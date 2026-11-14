import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Megaphone, Coins, ArrowRight, ArrowLeft, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';

export default function AdminLayout() {
  const { user, isAdmin, loading, logout } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const Arrow = lang === 'ar' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/', { replace: true });
  }, [loading, user, isAdmin, navigate]);

  if (loading || !user || !isAdmin) return <div className="min-h-screen grid place-items-center bg-kajok-bg"><div className="skeleton w-40 h-40 rounded-2xl" /></div>;

  const nav = [
    { to: '/admin', icon: LayoutDashboard, label: t('overview'), end: true },
    { to: '/admin/products', icon: Package, label: t('products') },
    { to: '/admin/orders', icon: ShoppingBag, label: t('orders') },
    { to: '/admin/customers', icon: Users, label: t('customers') },
    { to: '/admin/marketing', icon: Megaphone, label: t('marketing') },
    { to: '/admin/currency', icon: Coins, label: t('currencySettings') },
  ];

  return (
    <div className="min-h-screen bg-kajok-bg flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-kajok-deep text-white sticky top-0 h-screen">
        <div className="p-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2"><img src="/logo.jpg" alt="KAJOK" className="h-12 w-auto rounded-md object-contain bg-white p-0.5" /></Link>
          <p className="mt-2 text-[11px] font-bold text-kajok-accent uppercase tracking-widest">{t('adminPanel')}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label, end }: any) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-3 px-4 h-11 rounded-xl text-sm font-bold transition-colors ${isActive ? 'bg-kajok-royal text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 h-11 rounded-xl text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white"><Arrow size={18} />{lang === 'ar' ? 'العودة للمتجر' : 'Back to store'}</Link>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 h-11 rounded-xl text-sm font-bold text-red-300 hover:bg-white/10"><LogOut size={18} />{t('logout')}</button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden sticky top-0 z-30 bg-kajok-deep text-white h-14 flex items-center gap-3 px-3">
          <button onClick={() => setOpen(v => !v)} aria-label="Menu" className="p-2">{open ? <X size={22} /> : <Menu size={22} />}</button>
          <span className="font-black tracking-wide">KAJOK · {t('adminPanel')}</span>
          <Link to="/" className="ms-auto text-xs font-bold text-kajok-accent">{lang === 'ar' ? 'المتجر' : 'Store'} →</Link>
        </div>
        {open && (
          <div className="lg:hidden bg-kajok-deep text-white border-t border-white/10 sticky top-14 z-30">
            {nav.map(({ to, icon: Icon, label, end }: any) => (
              <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-5 h-12 text-sm font-bold ${isActive ? 'bg-kajok-royal' : 'text-white/80'}`}>
                <Icon size={18} />{label}
              </NavLink>
            ))}
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
