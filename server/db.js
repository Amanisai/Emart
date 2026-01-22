import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseUrl?.includes("localhost") ? false : { rejectUnauthorized: false },
});

// Initialize database tables
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        description TEXT,
        image TEXT,
        price_cents INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        total_cents INTEGER NOT NULL,
        status TEXT NOT NULL,
        payment_provider TEXT,
        payment_status TEXT,
        payment_ref TEXT,
        address_json TEXT,
        items_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Database tables initialized");
  } finally {
    client.release();
  }
}

export function nowIso() {
  return new Date().toISOString();
}
