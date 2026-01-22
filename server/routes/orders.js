import express from "express";
import { z } from "zod";
import { db, nowIso } from "../db.js";

export const ordersRouter = express.Router();

// Guest user ID for unauthenticated orders
const GUEST_USER_ID = 1;

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

ordersRouter.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();

  const list = rows.map((o) => ({
    id: String(o.id),
    total: toMoney(o.total_cents),
    status: o.status,
    createdAt: o.created_at,
    address: o.address_json ? JSON.parse(o.address_json) : null,
    items: o.items_json ? JSON.parse(o.items_json) : [],
  }));

  return res.json(list);
});

// Admin: list all orders
ordersRouter.get("/admin", (_req, res) => {
  const rows = db
    .prepare(
      "SELECT o.id, o.total_cents, o.status, o.payment_provider, o.payment_status, o.payment_ref, o.created_at, u.id as user_id, u.email as user_email, u.name as user_name FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC"
    )
    .all();

  return res.json(
    rows.map((o) => ({
      id: String(o.id),
      user: { id: String(o.user_id), email: o.user_email, name: o.user_name },
      total: toMoney(o.total_cents),
      status: o.status,
      paymentStatus: o.payment_status || null,
      paymentProvider: o.payment_provider || null,
      paymentRef: o.payment_ref || null,
      createdAt: o.created_at,
    }))
  );
});

ordersRouter.post("/", (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const userId = GUEST_USER_ID;

  // Compute totals from products table for integrity.
  const items = parsed.data.items;
  let totalCents = 0;

  const getProduct = db.prepare("SELECT key, price_cents, title, image, type FROM products WHERE key = ?");

  const expanded = items.map((it) => {
    const product = getProduct.get(it.key);
    if (!product) throw new Error(`Unknown product: ${it.key}`);
    const lineTotal = Number(product.price_cents) * it.quantity;
    totalCents += lineTotal;
    return {
      key: product.key,
      type: product.type,
      title: product.title,
      image: product.image,
      price: toMoney(product.price_cents),
      quantity: it.quantity,
      lineTotal: toMoney(lineTotal),
    };
  });

  const info = db
    .prepare(
      "INSERT INTO orders (user_id, total_cents, status, address_json, items_json, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      userId,
      totalCents,
      "created",
      parsed.data.address ? JSON.stringify(parsed.data.address) : null,
      JSON.stringify(expanded),
      nowIso()
    );

  return res.json({ id: String(info.lastInsertRowid), total: toMoney(totalCents), status: "created" });
});
