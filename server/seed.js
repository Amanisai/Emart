import bcrypt from "bcryptjs";
import { db, nowIso } from "./db.js";

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

async function ensureAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminEmail || !adminPassword) {
    // eslint-disable-next-line no-console
    console.warn(
      "Admin user not seeded: set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create an initial admin account."
    );
    return;
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (existing) return;

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  db.prepare(
    "INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(adminEmail, "Admin", passwordHash, "admin", nowIso());
}

async function seedProductsFromFrontendData() {
  const count = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
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

  const insert = db.prepare(
    `INSERT INTO products
      (key, type, title, brand, model, description, image, price_cents, created_at, updated_at)
     VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const trx = db.transaction(() => {
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

        insert.run(key, source.type, title, brand, model, description, image, priceCents, ts, ts);
      }
    }
  });

  trx();
}

export async function seedIfNeeded() {
  await ensureAdminUser();
  await seedProductsFromFrontendData();
}
