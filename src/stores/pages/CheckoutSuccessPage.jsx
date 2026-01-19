import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { verifyStripeSession } from "../api/payments";

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const orderIdFromState = location.state?.orderId;
  const mode = location.state?.mode;

  const { token } = useAuth();
  const { clearCart } = useCart();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const sessionId = useMemo(() => searchParams.get("session_id"), [searchParams]);
  const [status, setStatus] = useState(sessionId ? "verifying" : mode === "cod" ? "cod" : "success");
  const [orderId, setOrderId] = useState(orderIdFromState);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!sessionId) return;
      if (!token) {
        setStatus("need_login");
        return;
      }

      try {
        setStatus("verifying");
        const result = await verifyStripeSession(token, sessionId);
        if (cancelled) return;

        if (result?.orderId) setOrderId(result.orderId);
        if (result?.paid) {
          setStatus("paid");
          clearCart();
        } else {
          setStatus("unpaid");
        }
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        showToast(e?.message || "Could not verify payment", "error");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [sessionId, token, clearCart, showToast]);

  return (
    <>
      <Navbar />
      <div className="productsWrap">
        <div className="emptyState">
          <div className="emptyAnim" />
          <h2>
            {status === "verifying"
              ? "Verifying payment…"
              : status === "paid"
                ? "Payment successful"
                : status === "cod"
                  ? "Order placed"
                  : status === "need_login"
                    ? "Login required"
                    : status === "unpaid"
                      ? "Payment not completed"
                      : status === "error"
                        ? "Verification failed"
                        : "Payment successful"}
          </h2>
          {orderId ? <p className="muted">Order: {orderId}</p> : null}
          <p className="muted" style={{ maxWidth: 520, margin: "0 auto" }}>
            {status === "verifying"
              ? "Please wait while we confirm your payment with Stripe."
              : status === "paid"
                ? "Your payment is confirmed and your order is paid."
                : status === "cod"
                  ? "Your order was placed with Cash on Delivery."
                  : status === "need_login"
                    ? "Please login to verify your Stripe payment."
                    : status === "unpaid"
                      ? "We couldn't confirm a successful payment for this session."
                      : status === "error"
                        ? "We couldn't verify payment right now. Please try again."
                        : "Thank you for your purchase."}
          </p>
          <div className="heroCtas" style={{ justifyContent: "center" }}>
            <Link to="/products" className="custom-link">
              <button type="button" className="btnPrimary">Continue Shopping</button>
            </Link>
            <Link to="/profile" className="custom-link">
              <button type="button" className="btnGhost">Go to Profile</button>
            </Link>
            {status === "need_login" ? (
              <Link to="/login" className="custom-link">
                <button type="button" className="btnGhost">Login</button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
