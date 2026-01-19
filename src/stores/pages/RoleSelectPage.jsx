import React from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiShield, FiUser } from "react-icons/fi";

export default function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="authWrap roleSelectWrap">
      <div className="authCard roleSelectCard">
        <h2 className="authTitle roleTitle">Continue as</h2>
        <div className="authSub roleSub">Choose how you want to sign in</div>

        <div className="authActions roleActions">
          <button
            type="button"
            className="btnPrimary btnAuthPrimary roleSelectBtn roleSelectPrimary"
            onClick={() => navigate("/login")}
          >
            <FiUser aria-hidden="true" /> Continue as Client
          </button>

          <button
            type="button"
            className="btnGhost btnAuthPrimary roleSelectBtn roleSelectSecondary"
            onClick={() => navigate("/admin/login")}
          >
            <FiShield aria-hidden="true" /> Continue as Admin
          </button>
        </div>

        <div className="roleTrust">
          <FiLock aria-hidden="true" /> Secure role-based access
        </div>

        <div className="authHint roleHint">Admin access is restricted and requires authentication.</div>
      </div>
    </div>
  );
}
