import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Spinner } from "./components/ui";
import { useAuth } from "./store/auth";

// Customer pages
const HomePage = lazy(() => import("./screens/HomePage").then((m) => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import("./screens/ProductsPage").then((m) => ({ default: m.ProductsPage })));
const CategoriesPage = lazy(() => import("./screens/CategoriesPage").then((m) => ({ default: m.CategoriesPage })));
const ProductDetailPage = lazy(() => import("./screens/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })));
const SearchPage = lazy(() => import("./screens/SearchPage").then((m) => ({ default: m.SearchPage })));
const CartPage = lazy(() => import("./screens/CartPage").then((m) => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import("./screens/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const LoginPage = lazy(() => import("./screens/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./screens/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const AccountPage = lazy(() => import("./screens/AccountPage").then((m) => ({ default: m.AccountPage })));
const OrdersPage = lazy(() => import("./screens/OrdersPage").then((m) => ({ default: m.OrdersPage })));
const TrackOrderPage = lazy(() => import("./screens/TrackOrderPage").then((m) => ({ default: m.TrackOrderPage })));
const WishlistPage = lazy(() => import("./screens/WishlistPage").then((m) => ({ default: m.WishlistPage })));
const OffersPage = lazy(() => import("./screens/OffersPage").then((m) => ({ default: m.OffersPage })));
const ContactPage = lazy(() => import("./screens/ContactPage").then((m) => ({ default: m.ContactPage })));
const AboutPage = lazy(() => import("./screens/AboutPage").then((m) => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import("./screens/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./screens/TermsPage").then((m) => ({ default: m.TermsPage })));

// Admin pages
const AdminLayout = lazy(() => import("./screens/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminDashboardPage = lazy(() => import("./screens/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })));
const AdminProductsPage = lazy(() => import("./screens/admin/AdminProductsPage").then((m) => ({ default: m.AdminProductsPage })));
const AdminCatalogPage = lazy(() => import("./screens/admin/AdminCatalogPage").then((m) => ({ default: m.AdminCatalogPage })));
const AdminOrdersPage = lazy(() => import("./screens/admin/AdminOrdersPage").then((m) => ({ default: m.AdminOrdersPage })));
const AdminCustomersPage = lazy(() => import("./screens/admin/AdminCustomersPage").then((m) => ({ default: m.AdminCustomersPage })));
const AdminCouponsPage = lazy(() => import("./screens/admin/AdminCouponsPage").then((m) => ({ default: m.AdminCouponsPage })));
const AdminBannersPage = lazy(() => import("./screens/admin/AdminBannersPage").then((m) => ({ default: m.AdminBannersPage })));
const AdminCurrencyPage = lazy(() => import("./screens/admin/AdminCurrencyPage").then((m) => ({ default: m.AdminCurrencyPage })));
const AdminSellersPage = lazy(() => import("./screens/admin/AdminSellersPage").then((m) => ({ default: m.AdminSellersPage })));
const ShopPage = lazy(() => import("./screens/ShopPage").then(m => ({ default: m.ShopPage })));
const NotificationsPage = lazy(() => import("./screens/NotificationsPage").then((m) => ({ default: m.NotificationsPage })));
const SellerApplyPage = lazy(() => import("./screens/SellerApplyPage").then((m) => ({ default: m.SellerApplyPage })));
const SellerCenterPage = lazy(() => import("./screens/SellerCenterPage").then((m) => ({ default: m.SellerCenterPage })));

function NotFoundPage() {
  return (
    <div className="container-kujuk py-24 text-center">
      <p className="text-6xl font-extrabold text-accent">404</p>
      <p className="mt-4 text-lg font-semibold">Page not found</p>
      <a href="/" className="btn-primary mt-6 inline-flex px-6 py-3">
        KUJUK
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
          <Route path="shop/:id" element={<ShopPage />} />
          <Route path="product/:slug" element={<ProductDetailPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
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
