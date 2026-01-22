import express from "express";
import { z } from "zod";
import { pool, nowIso } from "../db.js";

export const productsRouter = express.Router();

function toMoney(priceCents) {
  return (Number(priceCents || 0) / 100).toFixed(2);
}

function mapProduct(row) {
  return {
    key: row.key,
    type: row.type,
    id: row.key.split(":")[1] || String(row.id),
    title: row.title,
    brand: row.brand,
    model: row.model,
    description: row.description,
    image: row.image,
    price: toMoney(row.price_cents),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

productsRouter.get("/", async (req, res) => {
  try {
    const type = String(req.query.type || "all");
    const q = String(req.query.q || "").trim().toLowerCase();

    let result;
    if (type !== "all") {
      result = await pool.query("SELECT * FROM products WHERE type = $1 ORDER BY id DESC", [type]);
    } else {
      result = await pool.query("SELECT * FROM products ORDER BY id DESC");
    }

    let list = result.rows.map(mapProduct);
    if (q) {
      list = list.filter((p) => {
        const hay = `${p.title || ""} ${p.brand || ""} ${p.model || ""} ${p.type || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
});

productsRouter.get("/:key", async (req, res) => {
  try {
    const key = String(req.params.key);
    const result = await pool.query("SELECT * FROM products WHERE key = $1", [key]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    return res.json(mapProduct(result.rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
});

const productSchema = z.object({
  type: z.string().min(1).max(40),
  id: z.string().min(1).max(40),
  title: z.string().min(1).max(160),
  brand: z.string().max(80).optional().nullable(),
  model: z.string().max(120).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  image: z.string().max(500).optional().nullable(),
  price: z.number().nonnegative(),
});

productsRouter.post("/", async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const key = `${parsed.data.type}:${parsed.data.id}`;
  const ts = nowIso();
  const cents = Math.round(parsed.data.price * 100);

  try {
    await pool.query(
      `INSERT INTO products (key, type, title, brand, model, description, image, price_cents, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [key, parsed.data.type, parsed.data.title, parsed.data.brand || null, parsed.data.model || null, parsed.data.description || null, parsed.data.image || null, cents, ts, ts]
    );
    const result = await pool.query("SELECT * FROM products WHERE key = $1", [key]);
    return res.json(mapProduct(result.rows[0]));
  } catch {
    return res.status(409).json({ error: "Product key already exists" });
  }
});

productsRouter.put("/:key", async (req, res) => {
  try {
    const key = String(req.params.key);
    const parsed = productSchema.partial({ id: true, type: true }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const existing = await pool.query("SELECT * FROM products WHERE key = $1", [key]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Not found" });

    const row = existing.rows[0];
    const next = {
      title: parsed.data.title ?? row.title,
      brand: parsed.data.brand ?? row.brand,
      model: parsed.data.model ?? row.model,
      description: parsed.data.description ?? row.description,
      image: parsed.data.image ?? row.image,
      price_cents: parsed.data.price !== undefined ? Math.round(Number(parsed.data.price) * 100) : row.price_cents,
    };

    await pool.query(
      `UPDATE products SET title = $1, brand = $2, model = $3, description = $4, image = $5, price_cents = $6, updated_at = $7 WHERE key = $8`,
      [next.title, next.brand, next.model, next.description, next.image, next.price_cents, nowIso(), key]
    );

    const result = await pool.query("SELECT * FROM products WHERE key = $1", [key]);
    return res.json(mapProduct(result.rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
});

productsRouter.delete("/:key", async (req, res) => {
  try {
    const key = String(req.params.key);
    await pool.query("DELETE FROM products WHERE key = $1", [key]);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
});
