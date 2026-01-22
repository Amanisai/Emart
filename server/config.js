import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5176),
  databaseUrl: process.env.DATABASE_URL || "postgresql://localhost:5432/emart",
  corsOrigin: String(process.env.CORS_ORIGIN || "http://localhost:5173"),
  stripeSecretKey: String(process.env.STRIPE_SECRET_KEY || ""),
  stripeWebhookSecret: String(process.env.STRIPE_WEBHOOK_SECRET || ""),
};
