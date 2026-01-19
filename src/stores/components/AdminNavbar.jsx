import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLogOut, FiMoon, FiSun, FiShield } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="adminNavWrap">
      <header className="adminNav">
        <div className="adminNavLeft">
          <div className="adminNavBrand">
            <FiShield aria-hidden="true" />
            <span>Admin Console</span>
          </div>
          <div className="adminNavUser muted">{user?.email || ""}</div>
        </div>

        <div className="adminNavRight">
          <Link to="/home" className="custom-link adminNavAction" aria-label="Back to shop">
            <FiArrowLeft aria-hidden="true" />
            <span>Back to Shop</span>
          </Link>

          <button
            type="button"
            className="adminNavAction"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === "dark" ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          </button>

          <button type="button" className="adminNavAction" onClick={logout} aria-label="Logout">
            <FiLogOut aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </header>
    </div>
  );
}
