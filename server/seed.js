import { pool, nowIso } from "./db.js";

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toCents(price) {
  const n = Number(String(price || "0").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function getTitle(item) {
  const company = safeText(item.company || item.brand).trim();
  const model = safeText(item.model || item.title).trim();
  return `${company} ${model}`.trim() || safeText(item.product || "Product");
}

function deriveBrand(item) {
  return safeText(item.company || item.brand || "").trim() || null;
}

async function seedProductsFromFrontendData() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT COUNT(*) as c FROM products");
    const count = parseInt(result.rows[0].c, 10);
    if (count > 0) return;

    // Import frontend data directly (these files are plain JS arrays).
    const [{ mobileData }, { computerData }, { watchData }, { menData }, { womanData }, { furnitureData }, { kitchenData }, { fridgeData }, { acData }, { booksData }, { speakerData }, { tvData }] =
      await Promise.all([
        import("../src/stores/data/mobiles.js"),
        import("../src/stores/data/computers.js"),
        import("../src/stores/data/watch.js"),
        import("../src/stores/data/men.js"),
        import("../src/stores/data/woman.js"),
        import("../src/stores/data/furniture.js"),
        import("../src/stores/data/kitchen.js"),
        import("../src/stores/data/fridge.js"),
        import("../src/stores/data/ac.js"),
        import("../src/stores/data/books.js"),
        import("../src/stores/data/speaker.js"),
        import("../src/stores/data/tv.js"),
      ]);

    const sources = [
      { type: "mobiles", items: mobileData },
      { type: "computers", items: computerData },
      { type: "watch", items: watchData },
      { type: "men", items: menData },
      { type: "woman", items: womanData },
      { type: "furniture", items: furnitureData },
      { type: "kitchen", items: kitchenData },
      { type: "fridge", items: fridgeData },
      { type: "ac", items: acData },
      { type: "books", items: booksData },
      { type: "speakers", items: speakerData },
      { type: "tv", items: tvData },
    ];

    for (const source of sources) {
      const list = Array.isArray(source.items) ? source.items : [];
      for (let idx = 0; idx < list.length; idx++) {
        const item = list[idx];
        const rawId = item?.id ? String(item.id) : String(idx + 1);
        const key = `${source.type}:${rawId}`;

        const image =
          typeof item?.image === "string" && item.image && !item.image.startsWith("/")
            ? `/${item.image}`
            : item?.image || null;

        const title = getTitle(item);
        const brand = deriveBrand(item);
        const model = safeText(item?.model || item?.title || "").trim() || null;
        const description = safeText(item?.description || "").trim() || null;
        const priceCents = toCents(item?.price);
        const ts = nowIso();

        await client.query(
          `INSERT INTO products (key, type, title, brand, model, description, image, price_cents, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (key) DO NOTHING`,
          [key, source.type, title, brand, model, description, image, priceCents, ts, ts]
        );
      }
    }
    console.log("Products seeded successfully");
  } finally {
    client.release();
  }
}

export async function seedIfNeeded() {
  await seedProductsFromFrontendData();
}
