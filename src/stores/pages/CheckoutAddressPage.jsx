import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useToast } from "../context/ToastContext";

const STORAGE_KEY = "ecommerce.checkout.address";

export default function CheckoutAddressPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [address, setAddress] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { name: "", phone: "", line1: "", city: "", state: "", zip: "" };
    } catch {
      return { name: "", phone: "", line1: "", city: "", state: "", zip: "" };
    }
  });

  return (
    <>
      <Navbar />
      <div className="authWrap">
        <div className="authCard">
          <h2>Checkout — Address</h2>
          <label className="authRow">Name<input value={address.name} onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))} /></label>
          <label className="authRow">Phone<input value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} /></label>
          <label className="authRow">Address<input value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} /></label>
          <label className="authRow">City<input value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} /></label>
          <label className="authRow">State<input value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} /></label>
          <label className="authRow">ZIP<input value={address.zip} onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))} /></label>

          <button
            className="btnPrimary"
            type="button"
            onClick={() => {
              if (!address.name || !address.phone || !address.line1) {
                showToast("Please fill required fields", "error");
                return;
              }
              localStorage.setItem(STORAGE_KEY, JSON.stringify(address));
              navigate("/checkout/payment");
            }}
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </>
  );
}
