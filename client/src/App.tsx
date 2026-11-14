import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import './lib/firebase'; // Initialize Firebase (Auth/Firestore/Storage) once at startup
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import OrderDetail from './pages/OrderDetail';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminCurrency from './pages/admin/AdminCurrency';
import { useI18n } from './i18n/I18nContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function NotFound() {
  const { lang } = useI18n();
  return (
    <div className="text-center py-24">
      <p className="text-7xl font-black text-kajok-accent font-latin">404</p>
      <p className="mt-2 text-kajok-muted">{lang === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}</p>
      <Link to="/" className="mt-6 inline-block h-12 px-8 leading-[3rem] rounded-xl bg-kajok-royal text-white font-bold">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <CurrencyProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    {/* Storefront */}
                    <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
                    <Route path="/search" element={<StorefrontLayout><Search /></StorefrontLayout>} />
                    <Route path="/product/:id" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
                    <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
                    <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
                    <Route path="/login" element={<StorefrontLayout><Login /></StorefrontLayout>} />
                    <Route path="/register" element={<StorefrontLayout><Register /></StorefrontLayout>} />
                    <Route path="/forgot-password" element={<StorefrontLayout><ForgotPassword /></StorefrontLayout>} />
                    <Route path="/account" element={<StorefrontLayout><Account /></StorefrontLayout>} />
                    <Route path="/orders/:id" element={<StorefrontLayout><OrderDetail /></StorefrontLayout>} />
                    <Route path="/wishlist" element={<StorefrontLayout><Wishlist /></StorefrontLayout>} />
                    {/* Admin */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminOverview />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="marketing" element={<AdminMarketing />} />
                      <Route path="currency" element={<AdminCurrency />} />
                    </Route>
                    <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
                  </Routes>
                </BrowserRouter>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </CurrencyProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
