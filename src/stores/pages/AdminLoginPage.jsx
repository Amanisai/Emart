import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";

import AdminNavbar from "../components/AdminNavbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const from = location.state?.from;

  return (
    <>
      <AdminNavbar />
      <div className="authWrap">
        <div className="authCard">
          <h2 className="authTitle">Admin sign in</h2>
          <div className="authSub">Login to manage products, users, and orders</div>

          <label className="authRow">
            Email
            <div className="authInput">
              <FiMail className="authInputIcon" aria-hidden="true" />
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="admin@yourdomain.com"
                autoComplete="email"
                className={errorMsg ? "inputError" : ""}
              />
            </div>
          </label>

          <label className="authRow">
            Password
            <div className="authInput">
              <FiLock className="authInputIcon" aria-hidden="true" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className={errorMsg ? "inputError" : ""}
              />
              <button
                type="button"
                className="authInputToggle"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                title={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
              </button>
            </div>
          </label>

          {errorMsg ? <div className="authError">{errorMsg}</div> : null}

          <div className="authActions">
            <button
              className="btnPrimary btnAuthPrimary"
              type="button"
              disabled={isLoading}
              onClick={async () => {
                if (isLoading) return;
                setErrorMsg("");
                setIsLoading(true);
                try {
                  await login({ email, password, role: "admin" });
                  showToast("Admin logged in", "success");
                  navigate(from || "/admin/dashboard", { replace: true });
                } catch (e) {
                  const msg = e?.message || "Login failed";
                  setErrorMsg(msg);
                  showToast(msg, "error");
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {isLoading ? <span className="btnSpinner" aria-hidden="true" /> : null}
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
