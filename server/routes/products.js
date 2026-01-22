import express from "express";
import { z } from "zod";
import { db, nowIso } from "../db.js";

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

productsRouter.get("/", (req, res) => {
  const type = String(req.query.type || "all");
  const q = String(req.query.q || "").trim().toLowerCase();

  let rows;
  if (type !== "all") {
    rows = db.prepare("SELECT * FROM products WHERE type = ? ORDER BY id DESC").all(type);
  } else {
    rows = db.prepare("SELECT * FROM products ORDER BY id DESC").all();
  }

  let list = rows.map(mapProduct);
  if (q) {
    list = list.filter((p) => {
      const hay = `${p.title || ""} ${p.brand || ""} ${p.model || ""} ${p.type || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  return res.json(list);
});

productsRouter.get("/:key", (req, res) => {
  const key = String(req.params.key);
  const row = db.prepare("SELECT * FROM products WHERE key = ?").get(key);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json(mapProduct(row));
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

productsRouter.post("/", (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const key = `${parsed.data.type}:${parsed.data.id}`;
  const ts = nowIso();
  const cents = Math.round(parsed.data.price * 100);

  try {
    db.prepare(
      `INSERT INTO products (key, type, title, brand, model, description, image, price_cents, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      key,
      parsed.data.type,
      parsed.data.title,
      parsed.data.brand || null,
      parsed.data.model || null,
      parsed.data.description || null,
      parsed.data.image || null,
      cents,
      ts,
      ts
    );
    const row = db.prepare("SELECT * FROM products WHERE key = ?").get(key);
    return res.json(mapProduct(row));
  } catch {
    return res.status(409).json({ error: "Product key already exists" });
  }
});

productsRouter.put("/:key", (req, res) => {
  const key = String(req.params.key);
  const parsed = productSchema.partial({ id: true, type: true }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const existing = db.prepare("SELECT * FROM products WHERE key = ?").get(key);
  if (!existing) return res.status(404).json({ error: "Not found" });

  const next = {
    title: parsed.data.title ?? existing.title,
    brand: parsed.data.brand ?? existing.brand,
    model: parsed.data.model ?? existing.model,
    description: parsed.data.description ?? existing.description,
    image: parsed.data.image ?? existing.image,
    price_cents:
      parsed.data.price !== undefined ? Math.round(Number(parsed.data.price) * 100) : existing.price_cents,
  };

  db.prepare(
    `UPDATE products
     SET title = ?, brand = ?, model = ?, description = ?, image = ?, price_cents = ?, updated_at = ?
     WHERE key = ?`
  ).run(
    next.title,
    next.brand,
    next.model,
    next.description,
    next.image,
    next.price_cents,
    nowIso(),
    key
  );

  const row = db.prepare("SELECT * FROM products WHERE key = ?").get(key);
  return res.json(mapProduct(row));
});

productsRouter.delete("/:key", (req, res) => {
  const key = String(req.params.key);
  db.prepare("DELETE FROM products WHERE key = ?").run(key);
  return res.json({ ok: true });
});
