import express from "express";
import { z } from "zod";
import { pool, nowIso } from "../db.js";

export const ordersRouter = express.Router();

function toMoney(priceCents) {
  return (Number(priceCents || 0) / 100).toFixed(2);
}

const createOrderSchema = z.object({
  address: z.any().optional(),
  items: z
    .array(
      z.object({
        key: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

ordersRouter.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY id DESC");

    const list = result.rows.map((o) => ({
      id: String(o.id),
      total: toMoney(o.total_cents),
      status: o.status,
      createdAt: o.created_at,
      address: o.address_json ? JSON.parse(o.address_json) : null,
      items: o.items_json ? JSON.parse(o.items_json) : [],
    }));

    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
});

// Admin: list all orders
ordersRouter.get("/admin", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, total_cents, status, payment_provider, payment_status, payment_ref, created_at FROM orders ORDER BY id DESC"
    );

    return res.json(
      result.rows.map((o) => ({
        id: String(o.id),
        total: toMoney(o.total_cents),
        status: o.status,
        paymentStatus: o.payment_status || null,
        paymentProvider: o.payment_provider || null,
        paymentRef: o.payment_ref || null,
        createdAt: o.created_at,
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
});

ordersRouter.post("/", async (req, res) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    // Compute totals from products table for integrity.
    const items = parsed.data.items;
    let totalCents = 0;

    const expanded = [];
    for (const it of items) {
      const result = await pool.query("SELECT key, price_cents, title, image, type FROM products WHERE key = $1", [it.key]);
      if (result.rows.length === 0) {
        return res.status(400).json({ error: `Unknown product: ${it.key}` });
      }
      const product = result.rows[0];
      const lineTotal = Number(product.price_cents) * it.quantity;
      totalCents += lineTotal;
      expanded.push({
        key: product.key,
        type: product.type,
        title: product.title,
        image: product.image,
        price: toMoney(product.price_cents),
        quantity: it.quantity,
        lineTotal: toMoney(lineTotal),
      });
    }

    const result = await pool.query(
      "INSERT INTO orders (total_cents, status, address_json, items_json, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [totalCents, "created", parsed.data.address ? JSON.stringify(parsed.data.address) : null, JSON.stringify(expanded), nowIso()]
    );

    return res.json({ id: String(result.rows[0].id), total: toMoney(totalCents), status: "created" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Database error" });
  }
});
