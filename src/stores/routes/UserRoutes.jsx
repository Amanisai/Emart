import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const MobilePage = lazy(() => import("../pages/MobilePage"));
const CompPage = lazy(() => import("../pages/CompPage"));
const WatchPage = lazy(() => import("../pages/WatchPage"));
const MenPage = lazy(() => import("../pages/MenPage"));
const WomanPage = lazy(() => import("../pages/WomanPage"));
const FurniturePage = lazy(() => import("../pages/FurniturePage"));
const AcPage = lazy(() => import("../pages/AcPage"));
const KitchenPage = lazy(() => import("../pages/KitchenPage"));
const FridgePage = lazy(() => import("../pages/FridgePage"));
const UserCart = lazy(() => import("../UserCart"));

const ProductsPage = lazy(() => import("../pages/ProductsPage"));
const WishlistPage = lazy(() => import("../pages/WishlistPage"));
const ProductDetailsPage = lazy(() => import("../pages/ProductDetailsPage"));
const CategoryPage = lazy(() => import("../pages/CategoryPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const SignupPage = lazy(() => import("../pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const CheckoutAddressPage = lazy(() => import("../pages/CheckoutAddressPage"));
const CheckoutPaymentPage = lazy(() => import("../pages/CheckoutPaymentPage"));
const CheckoutSuccessPage = lazy(() => import("../pages/CheckoutSuccessPage"));
const RequireAuth = lazy(() => import("../components/RequireAuth"));

const MobileSingle = lazy(() => import("../singles/MobileSingle"));
const AcSingle = lazy(() => import("../singles/AcSingle"));
const ComputerSingle = lazy(() => import("../singles/ComputerSingle"));
const FurnitureSingle = lazy(() => import("../singles/FurnitureSingle"));
const KitchenSingle = lazy(() => import("../singles/KitchenSingle"));
const MenSingle = lazy(() => import("../singles/MenSingle"));
const WatchSingle = lazy(() => import("../singles/WatchSingle"));
const WomanSingle = lazy(() => import("../singles/WomanSingle"));
const FridgeSingle = lazy(() => import("../singles/FridgeSingle"));

export default function UserRoutes() {
  const protect = (node) => <RequireAuth>{node}</RequireAuth>;

  return (
    <Suspense fallback={<div className="pageLoading">Loading...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />

        <Route path="/home" element={protect(<LandingPage />)} />
        <Route path="/products" element={protect(<ProductsPage />)} />
        <Route path="/category/:type" element={protect(<CategoryPage />)} />
        <Route path="/wishlist" element={protect(<WishlistPage />)} />
        <Route path="/product/:type/:id" element={protect(<ProductDetailsPage />)} />

        <Route
          path="/profile"
          element={
            protect(<ProfilePage />)
          }
        />

        <Route
          path="/checkout/address"
          element={
            protect(<CheckoutAddressPage />)
          }
        />
        <Route
          path="/checkout/payment"
          element={
            protect(<CheckoutPaymentPage />)
          }
        />
        <Route
          path="/checkout/success"
          element={
            protect(<CheckoutSuccessPage />)
          }
        />

        <Route path="/kitchen" element={protect(<KitchenPage />)} />
        <Route path="/mobiles" element={protect(<MobilePage />)} />
        <Route path="/computers" element={protect(<CompPage />)} />
        <Route path="/watch" element={protect(<WatchPage />)} />
        <Route path="/fridge" element={protect(<FridgePage />)} />
        <Route path="/men" element={protect(<MenPage />)} />
        <Route path="/woman" element={protect(<WomanPage />)} />
        <Route path="/furniture" element={protect(<FurniturePage />)} />
        <Route path="/ac" element={protect(<AcPage />)} />

        <Route path="/mobiles/:id" element={protect(<MobileSingle />)} />
        <Route path="/cart" element={protect(<UserCart />)} />
        <Route path="/ac/:id" element={protect(<AcSingle />)} />
        <Route path="/computers/:id" element={protect(<ComputerSingle />)} />
        <Route path="/furniture/:id" element={protect(<FurnitureSingle />)} />
        <Route path="/kitchen/:id" element={protect(<KitchenSingle />)} />
        <Route path="/men/:id" element={protect(<MenSingle />)} />
        <Route path="/watch/:id" element={protect(<WatchSingle />)} />
        <Route path="/woman/:id" element={protect(<WomanSingle />)} />
        <Route path="/fridge/:id" element={protect(<FridgeSingle />)} />

        <Route path="*" element={protect(<div className="pageLoading">404 - Not Found</div>)} />
      </Routes>
    </Suspense>
  );
}
