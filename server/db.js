import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "ecommerce.db");

export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  description TEXT,
  image TEXT,
  price_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  payment_provider TEXT,
  payment_status TEXT,
  payment_ref TEXT,
  address_json TEXT,
  items_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

// Backfill columns for existing DBs created before payment integration.
try {
  const cols = db.prepare("PRAGMA table_info(orders)").all().map((c) => c.name);
  if (!cols.includes("payment_provider")) db.exec("ALTER TABLE orders ADD COLUMN payment_provider TEXT");
  if (!cols.includes("payment_status")) db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT");
  if (!cols.includes("payment_ref")) db.exec("ALTER TABLE orders ADD COLUMN payment_ref TEXT");
} catch {
  // best-effort migration
}

export function nowIso() {
  return new Date().toISOString();
}
