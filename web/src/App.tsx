import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Spinner } from "./components/ui";
import { useAuth } from "./store/auth";

// Customer pages
const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import("./pages/ProductsPage").then((m) => ({ default: m.ProductsPage })));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage").then((m) => ({ default: m.CategoriesPage })));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
const SearchPage = lazy(() => import("./pages/SearchPage").then((m) => ({ default: m.SearchPage })));
const CartPage = lazy(() => import("./pages/CartPage").then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const AccountPage = lazy(() => import("./pages/AccountPage").then((m) => ({ default: m.AccountPage })));
const OrdersPage = lazy(() => import("./pages/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const TrackOrderPage = lazy(() => import("./pages/TrackOrderPage").then((m) => ({ default: m.TrackOrderPage })));
const WishlistPage = lazy(() => import("./pages/WishlistPage").then((m) => ({ default: m.WishlistPage })));
const OffersPage = lazy(() => import("./pages/OffersPage").then((m) => ({ default: m.OffersPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/TermsPage").then((m) => ({ default: m.TermsPage })));

// Admin pages
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage").then((m) => ({ default: m.AdminProductsPage })));
const AdminCatalogPage = lazy(() => import("./pages/admin/AdminCatalogPage").then((m) => ({ default: m.AdminCatalogPage })));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage").then((m) => ({ default: m.AdminOrdersPage })));
const AdminCustomersPage = lazy(() => import("./pages/admin/AdminCustomersPage").then((m) => ({ default: m.AdminCustomersPage })));
const AdminCouponsPage = lazy(() => import("./pages/admin/AdminCouponsPage").then((m) => ({ default: m.AdminCouponsPage })));
const AdminBannersPage = lazy(() => import("./pages/admin/AdminBannersPage").then((m) => ({ default: m.AdminBannersPage })));
const AdminCurrencyPage = lazy(() => import("./pages/admin/AdminCurrencyPage").then((m) => ({ default: m.AdminCurrencyPage })));
const AdminSellersPage = lazy(() => import("./pages/admin/AdminSellersPage").then((m) => ({ default: m.AdminSellersPage })));
const SellerApplyPage = lazy(() => import("./pages/SellerApplyPage").then((m) => ({ default: m.SellerApplyPage })));
const SellerCenterPage = lazy(() => import("./pages/SellerCenterPage").then((m) => ({ default: m.SellerCenterPage })));

function NotFoundPage() {
  return (
    <div className="container-kajok py-24 text-center">
      <p className="text-6xl font-extrabold text-accent">404</p>
      <p className="mt-4 text-lg font-semibold">Page not found</p>
      <a href="/" className="btn-primary mt-6 inline-flex px-6 py-3">
        KAJOK
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="product/:slug" element={<ProductDetailPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/track" element={<TrackOrderPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="seller/apply" element={<SellerApplyPage />} />
          <Route path="seller" element={<SellerCenterPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="catalog" element={<AdminCatalogPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="banners" element={<AdminBannersPage />} />
            <Route path="currency" element={<AdminCurrencyPage />} />
            <Route path="sellers" element={<AdminSellersPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

/** Guard helper kept for future protected routes (auth state lives in the store). */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth();
  if (!initialized) return <Spinner className="py-24" />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
