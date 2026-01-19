import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <Navbar />
      <div className="authWrap">
        <div className="authCard">
          <h2>Signup</h2>
          <label className="authRow">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>
          <label className="authRow">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <label className="authRow">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
          </label>
          <button
            className="btnPrimary"
            type="button"
            onClick={async () => {
              try {
                await signup({ name, email, password });
                showToast("Account created", "success");
                navigate("/profile");
              } catch (e) {
                showToast(e?.message || "Signup failed", "error");
              }
            }}
          >
            Create Account
          </button>
          <div className="authLinks">
            <Link to="/login" className="custom-link">Already have an account?</Link>
          </div>
        </div>
      </div>
    </>
  );
}
