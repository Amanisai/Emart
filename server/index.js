import express from "express";
import cors from "cors";

import { config } from "./config.js";
import { seedIfNeeded } from "./seed.js";
import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { paymentsRouter, stripeWebhookHandler } from "./routes/payments.js";

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      try {
        const url = new URL(origin);
        const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
        const isDevPort = /^517\d$/.test(url.port);
        if (isLocalhost && isDevPort) return cb(null, true);
        // Allow Netlify domains
        if (url.hostname.endsWith(".netlify.app")) return cb(null, true);
      } catch {
        // ignore
      }

      if (origin === config.corsOrigin) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Stripe webhooks require raw body for signature verification.
app.post("/api/payments/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);

app.use((err, _req, res) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

async function main() {
  await seedIfNeeded();

  return new Promise((resolve) => {
    const server = app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on http://localhost:${config.port}`);
    });

    process.on("SIGINT", () => {
      server.close(() => {
        resolve();
        process.exit(0);
      });
    });
    process.on("SIGTERM", () => {
      server.close(() => {
        resolve();
        process.exit(0);
      });
    });
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
