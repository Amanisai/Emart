export function getProductKey(product) {
  const explicit = product?.key;
  if (typeof explicit === "string" && explicit.includes(":")) return explicit;

  const type = product?.__sourceType || product?.type || product?.product || product?.category || "item";
  const id = product?.id ?? product?.model ?? "unknown";
  return `${String(type)}:${String(id)}`;
}

export function getProductBrand(product) {
  return product?.company || product?.brand || product?.author || "";
}

export function getProductTitle(product) {
  const brand = getProductBrand(product);
  const model = product?.model || product?.title || product?.name || "";
  return [brand, model].filter(Boolean).join(" ").trim() || product?.product || "Product";
}

export function parsePrice(value) {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(n) ? n : 0;
}

function hashToUnit(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash / 0xffffffff;
}

export function deriveProductMeta(product) {
  const key = getProductKey(product);
  const u = hashToUnit(key);

  const rating = Math.max(1, Math.min(5, Math.round((3.5 + u * 1.5) * 10) / 10));
  const inStock = u > 0.12; // deterministic, mostly in-stock
  const discountPercent = u > 0.65 ? 15 : u > 0.45 ? 10 : u > 0.25 ? 5 : 0;

  return { rating, inStock, discountPercent };
}

export function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}
