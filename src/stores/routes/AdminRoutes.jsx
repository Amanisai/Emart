import React, { Suspense, lazy } from "react";
import { Navigate, Routes, Route } from "react-router-dom";

const RequireAuth = lazy(() => import("../components/RequireAuth"));
const AdminPage = lazy(() => import("../pages/AdminPage"));
const AdminOrdersPage = lazy(() => import("../pages/AdminOrdersPage"));
const AdminLoginPage = lazy(() => import("../pages/AdminLoginPage"));

export default function AdminRoutes() {
  return (
    <Suspense fallback={<div className="pageLoading">Loading...</div>}>
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="/dashboard" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
        <Route path="/products" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
        <Route path="/users" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth role="admin"><AdminOrdersPage /></RequireAuth>} />

        <Route path="*" element={<div className="pageLoading">404 - Not Found</div>} />
      </Routes>
    </Suspense>
  );
}
