import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";
import { FiMail } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <Navbar />
      <div className="authWrap">
        <div className="authCard">
          <h2 className="authTitle">Forgot Password</h2>
          <div className="authSub">We’ll send a reset link to your email</div>
          <label className="authRow">
            Email
            <div className="authInput">
              <FiMail className="authInputIcon" aria-hidden="true" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
          </label>
          <button
            className="btnPrimary btnAuthPrimary"
            type="button"
            disabled={isLoading}
            onClick={() => {
              if (isLoading) return;
              setIsLoading(true);
              window.setTimeout(() => {
                showToast("Reset link sent (demo)", "success");
                setIsLoading(false);
              }, 600);
            }}
          >
            {isLoading ? <span className="btnSpinner" aria-hidden="true" /> : null}
            {isLoading ? "Sending…" : "Send Reset Link"}
          </button>
          <div className="authLinksColumn">
            <Link to="/login" className="custom-link authCreateLink">Back to login</Link>
          </div>
        </div>
      </div>
    </>
  );
}
