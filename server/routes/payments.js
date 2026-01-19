import express from "express";
import Stripe from "stripe";
import { z } from "zod";

import { config } from "../config.js";
import { db, nowIso } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const paymentsRouter = express.Router();

function toMoney(priceCents) {
  return (Number(priceCents || 0) / 100).toFixed(2);
}

function getStripe() {
  if (!config.stripeSecretKey) {
    throw new Error("Stripe is not configured (missing STRIPE_SECRET_KEY)");
  }
  return new Stripe(config.stripeSecretKey, {
    apiVersion: "2024-06-20",
  });
}

const checkoutSchema = z.object({
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

paymentsRouter.post("/stripe/checkout-session", requireAuth, async (req, res, next) => {
  try {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const stripe = getStripe();
    const userId = Number(req.user.sub);

    const getProduct = db.prepare("SELECT key, price_cents, title, image, type FROM products WHERE key = ?");

    // Compute totals from DB.
    let totalCents = 0;
    const expanded = parsed.data.items.map((it) => {
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
        "INSERT INTO orders (user_id, total_cents, status, payment_provider, payment_status, payment_ref, address_json, items_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        userId,
        totalCents,
        "pending_payment",
        "stripe",
        "unpaid",
        null,
        parsed.data.address ? JSON.stringify(parsed.data.address) : null,
        JSON.stringify(expanded),
        nowIso()
      );

    const orderId = String(info.lastInsertRowid);

    const origin = req.get("origin") || config.corsOrigin;
    const successUrl = `${origin}/checkout/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/checkout/payment?canceled=1`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: expanded.map((it) => ({
        quantity: it.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(it.price) * 100),
          product_data: {
            name: it.title,
            images: it.image ? [it.image] : [],
          },
        },
      })),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId,
        userId: String(userId),
      },
    });

    db.prepare("UPDATE orders SET payment_ref = ? WHERE id = ? AND user_id = ?").run(session.id, orderId, userId);

    return res.json({ url: session.url, orderId, sessionId: session.id });
  } catch (err) {
    return next(err);
  }
});

paymentsRouter.post("/stripe/verify", requireAuth, async (req, res, next) => {
  try {
    const parsed = z.object({ sessionId: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const stripe = getStripe();
    const userId = Number(req.user.sub);

    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
    const orderId = session.metadata?.orderId;
    const sessionUserId = session.metadata?.userId;

    if (!orderId || !sessionUserId) return res.status(400).json({ error: "Invalid session metadata" });
    if (Number(sessionUserId) !== userId) return res.status(403).json({ error: "Forbidden" });

    const paid = session.payment_status === "paid";

    if (paid) {
      db.prepare(
        "UPDATE orders SET status = ?, payment_status = ?, payment_provider = ?, payment_ref = ? WHERE id = ? AND user_id = ?"
      ).run("paid", "paid", "stripe", session.id, Number(orderId), userId);
    }

    const row = db.prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?").get(Number(orderId), userId);
    if (!row) return res.status(404).json({ error: "Order not found" });

    return res.json({
      id: String(row.id),
      status: row.status,
      total: toMoney(row.total_cents),
      paymentStatus: row.payment_status || null,
      paymentProvider: row.payment_provider || null,
      paymentRef: row.payment_ref || null,
    });
  } catch (err) {
    return next(err);
  }
});

export function stripeWebhookHandler(req, res, next) {
  try {
    if (!config.stripeWebhookSecret) {
      return res.status(500).json({ error: "Stripe webhook is not configured (missing STRIPE_WEBHOOK_SECRET)" });
    }

    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];
    if (!sig) return res.status(400).send("Missing stripe-signature");

    const event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (orderId && userId) {
        db.prepare(
          "UPDATE orders SET status = ?, payment_status = ?, payment_provider = ?, payment_ref = ? WHERE id = ? AND user_id = ?"
        ).run("paid", "paid", "stripe", session.id, Number(orderId), Number(userId));
      }
    }

    return res.json({ received: true });
  } catch (err) {
    return next(err);
  }
}
