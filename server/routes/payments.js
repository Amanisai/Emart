import express from "express";
import Stripe from "stripe";
import { z } from "zod";

import { config } from "../config.js";
import { pool, nowIso } from "../db.js";

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

paymentsRouter.post("/stripe/checkout-session", async (req, res, next) => {
  try {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const stripe = getStripe();

    // Compute totals from DB.
    let totalCents = 0;
    const expanded = [];
    
    for (const it of parsed.data.items) {
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

    const orderResult = await pool.query(
      "INSERT INTO orders (total_cents, status, payment_provider, payment_status, payment_ref, address_json, items_json, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [totalCents, "pending_payment", "stripe", "unpaid", null, parsed.data.address ? JSON.stringify(parsed.data.address) : null, JSON.stringify(expanded), nowIso()]
    );

    const orderId = String(orderResult.rows[0].id);

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
      },
    });

    await pool.query("UPDATE orders SET payment_ref = $1 WHERE id = $2", [session.id, orderId]);

    return res.json({ url: session.url, orderId, sessionId: session.id });
  } catch (err) {
    return next(err);
  }
});

paymentsRouter.post("/stripe/verify", async (req, res, next) => {
  try {
    const parsed = z.object({ sessionId: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);
    const orderId = session.metadata?.orderId;

    if (!orderId) return res.status(400).json({ error: "Invalid session metadata" });

    const paid = session.payment_status === "paid";

    if (paid) {
      await pool.query(
        "UPDATE orders SET status = $1, payment_status = $2, payment_provider = $3, payment_ref = $4 WHERE id = $5",
        ["paid", "paid", "stripe", session.id, Number(orderId)]
      );
    }

    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [Number(orderId)]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });

    const row = result.rows[0];
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

export async function stripeWebhookHandler(req, res, next) {
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

      if (orderId) {
        await pool.query(
          "UPDATE orders SET status = $1, payment_status = $2, payment_provider = $3, payment_ref = $4 WHERE id = $5",
          ["paid", "paid", "stripe", session.id, Number(orderId)]
        );
      }
    }

    return res.json({ received: true });
  } catch (err) {
    return next(err);
  }
}
