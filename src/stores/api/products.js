import { apiFetch } from "./client";

function mapProduct(p) {
  return {
    ...p,
    __sourceType: p.type,
    __sourceLabel: p.type,
    // compatibility fields for existing UI helpers
    company: p.brand || p.company,
  };
}

export async function fetchAllProducts({ type = "all", q = "" } = {}) {
  const params = new URLSearchParams();
  if (type && type !== "all") params.set("type", type);
  if (q) params.set("q", q);
  const query = params.toString();
  const list = await apiFetch(`/products${query ? `?${query}` : ""}`);
  return Array.isArray(list) ? list.map(mapProduct) : [];
}

export async function fetchProductByKey(key) {
  const p = await apiFetch(`/products/${encodeURIComponent(key)}`);
  return mapProduct(p);
}

export async function createProduct(token, data) {
  const p = await apiFetch(`/products`, { method: "POST", token, body: data });
  return mapProduct(p);
}

export async function updateProduct(token, key, data) {
  const p = await apiFetch(`/products/${encodeURIComponent(key)}`, { method: "PUT", token, body: data });
  return mapProduct(p);
}

export async function deleteProduct(token, key) {
  return apiFetch(`/products/${encodeURIComponent(key)}`, { method: "DELETE", token });
}
