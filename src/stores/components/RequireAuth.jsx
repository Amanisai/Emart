import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children, role }) {
  const { isAuthed, user, role: currentRole } = useAuth();
  const location = useLocation();

  const loginPath = role === "admin" ? "/admin/login" : "/login";

  if (!isAuthed) return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  if (role && currentRole !== role) return <Navigate to="/" replace />;
  if (!user) return <Navigate to={loginPath} replace />;

  return children;
}
