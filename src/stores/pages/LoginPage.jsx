import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [capsOn, setCapsOn] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const from = location.state?.from && location.state.from !== "/" ? location.state.from : "/home";

  return (
    <>
      <Navbar />
      <div className="authWrap">
        <div className={`authCard ${shakeKey ? 'shake' : ''}`}>
          <h2 className="authTitle">Welcome back</h2>
          <div className="authSub">Login to continue shopping</div>

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
                placeholder="you@example.com"
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
                onKeyUp={(e) => setCapsOn(Boolean(e.getModifierState && e.getModifierState("CapsLock")))}
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
            <div className="authLinks" style={{ justifyContent: "flex-end" }}>
              <Link to="/forgot" className="custom-link authForgotLink">Forgot password?</Link>
            </div>
            {capsOn ? <div className="capsWarn">Caps Lock is ON</div> : null}
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
                  await login({ email, password, role: "user" });
                  showToast("Logged in", "success");
                  navigate(from, { replace: true });
                } catch (e) {
                  const msg = e?.message || "Login failed";
                  setErrorMsg(msg);
                  showToast(msg, "error");
                  setShakeKey((k) => k + 1);
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {isLoading ? <span className="btnSpinner" aria-hidden="true" /> : null}
              {isLoading ? "Logging in…" : "Login"}
            </button>

            <div className="authSecureLine">🔒 Your credentials are securely encrypted</div>

            <div className="authLinksColumn">
              <Link to="/signup" className="custom-link authCreateLink">Create account</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
