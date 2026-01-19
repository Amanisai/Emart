import { apiFetch } from "./client";

export function createStripeCheckoutSession(token, { address, items }) {
  return apiFetch("/payments/stripe/checkout-session", {
    method: "POST",
    token,
    body: { address, items },
  });
}

export function verifyStripeSession(token, sessionId) {
  return apiFetch("/payments/stripe/verify", {
    method: "POST",
    token,
    body: { sessionId },
  });
}
