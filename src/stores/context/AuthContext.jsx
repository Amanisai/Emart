import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

const STORAGE_KEY = "ecommerce.auth";

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const api = authApi();

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ user: null, token: null });

  useEffect(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY), null);
    if (saved?.session?.token) {
      setSession({ user: saved.session.user || null, token: saved.session.token });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ session }));
  }, [session]);

  useEffect(() => {
    let alive = true;
    if (!session.token) return;
    api.me(session.token)
      .then((user) => {
        if (!alive) return;
        setSession((prev) => ({ ...prev, user }));
      })
      .catch(() => {
        if (!alive) return;
        setSession({ user: null, token: null });
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  const value = useMemo(() => {
    const login = async ({ email, password, role }) => {
      const result = role === "admin"
        ? await api.adminLogin({ email, password })
        : await api.login({ email, password });
      setSession({ user: result.user, token: result.token });
      return result.user;
    };

    const signup = async ({ name, email, password }) => {
      await api.signup({ name, email, password });
      return login({ email, password });
    };

    const logout = () => setSession({ user: null, token: null });

    const verifyEmail = () => {
      // Backend implementation can add email verification later.
    };

    const listUsers = async () => {
      if (!session.token) throw new Error("Not authenticated");
      return api.listUsers(session.token);
    };

    const setUserRole = async (userId, role) => {
      if (!session.token) throw new Error("Not authenticated");
      const updated = await api.setUserRole(session.token, userId, role);
      if (session.user?.id === updated.id) setSession((prev) => ({ ...prev, user: updated }));
      return updated;
    };

    return {
      user: session.user,
      token: session.token,
      isAuthed: Boolean(session.user && session.token),
      role: session.user?.role || "guest",
      signup,
      login,
      logout,
      verifyEmail,
      listUsers,
      setUserRole,
    };
  }, [session.token, session.user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
