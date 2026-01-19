import { apiFetch } from "./client";

export async function createOrder(token, { address, items }) {
  return apiFetch("/orders", { method: "POST", token, body: { address, items } });
}

export async function listOrders(token) {
  return apiFetch("/orders", { token });
}

export async function adminListOrders(token) {
  return apiFetch("/orders/admin", { token });
}
