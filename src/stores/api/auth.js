import { apiFetch } from "./client";

export function authApi() {
  return {
    signup: (data) => apiFetch("/auth/signup", { method: "POST", body: data }),
    login: (data) => apiFetch("/auth/login", { method: "POST", body: data }),
    adminLogin: (data) => apiFetch("/auth/admin-login", { method: "POST", body: data }),
    me: (token) => apiFetch("/auth/me", { token }),
    listUsers: (token) => apiFetch("/auth/users", { token }),
    setUserRole: (token, userId, role) =>
      apiFetch(`/auth/users/${userId}/role`, { method: "PATCH", token, body: { role } }),
  };
}
