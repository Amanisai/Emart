import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency, getProductKey } from "../utils/product";
import { createOrder } from "../api/orders";
import { createStripeCheckoutSession } from "../api/payments";

const ADDRESS_KEY = "ecommerce.checkout.address";

export default function CheckoutPaymentPage() {
  const navigate = useNavigate();
  const { cartItems, totals, clearCart } = useCart();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [method, setMethod] = useState("stripe");
  const [isLoading, setIsLoading] = useState(false);

  const address = useMemo(() => {
    try {
      const raw = localStorage.getItem(ADDRESS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  if (!cartItems.length) {
    return (
      <>
        <Navbar />
        <div className="productsWrap">
          <div className="emptyState">
            <h3>Your cart is empty</h3>
          </div>
        </div>
      </>
    );
  }

  if (!address) {
    return (
      <>
        <Navbar />
        <div className="productsWrap">
          <div className="emptyState">
            <h3>Missing address</h3>
            <p>Please add an address first.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="authWrap">
        <div className="authCard">
          <h2>Checkout — Payment</h2>
          <div className="muted">Total: {formatCurrency(totals.subtotal)}</div>

          <div className="payMethods">
            <label className="payMethod">
              <input type="radio" checked={method === "stripe"} onChange={() => setMethod("stripe")} />
              Card (Stripe)
            </label>
            <label className="payMethod">
              <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} />
              Cash on Delivery
            </label>
          </div>

          <button
            className="btnPrimary"
            type="button"
            onClick={async () => {
              try {
                if (!token) {
                  showToast("Please login to continue", "error");
                  navigate("/login");
                  return;
                }

                if (isLoading) return;
                setIsLoading(true);

                const items = cartItems.map((row) => ({ key: getProductKey(row.item), quantity: row.quantity }));

                if (method === "stripe") {
                  const session = await createStripeCheckoutSession(token, { address, items });
                  if (!session?.url) throw new Error("Stripe checkout failed");
                  window.location.assign(session.url);
                  return;
                }

                const result = await createOrder(token, { address, items });
                clearCart();
                showToast("Order placed", "success");
                navigate("/checkout/success", { replace: true, state: { orderId: result.id, mode: "cod" } });
              } catch (e) {
                showToast(e?.message || "Payment failed", "error");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {isLoading ? "Processing…" : method === "stripe" ? "Pay with Stripe" : "Place Order"}
          </button>

          <div className="authHint">Card payments are processed via Stripe test mode. No card details hit our server.</div>
        </div>
      </div>
    </>
  );
}
