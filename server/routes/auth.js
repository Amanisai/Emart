import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db, nowIso } from "../db.js";
import { config } from "../config.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const authRouter = express.Router();

const signupSchema = z.object({
  name: z.string().min(1).max(80).optional().default("User"),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function issueTokenForUser(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: "7d" });
}

function loginWithExpectedRole(req, res, expectedRole) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const email = parsed.data.email.toLowerCase().trim();
  const user = db
    .prepare("SELECT id, email, name, password_hash, role FROM users WHERE email = ?")
    .get(email);

  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const ok = bcrypt.compareSync(parsed.data.password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  if (expectedRole && user.role !== expectedRole) {
    return res.status(403).json({ error: "You are not allowed to login as this role" });
  }

  const token = issueTokenForUser(user);
  return res.json({
    token,
    user: { id: String(user.id), email: user.email, name: user.name, role: user.role },
  });
}

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const email = parsed.data.email.toLowerCase().trim();
  const name = parsed.data.name;
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    const info = db
      .prepare("INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)")
      .run(email, name, passwordHash, "user", nowIso());

    return res.json({ id: info.lastInsertRowid, email, name, role: "user" });
  } catch {
    return res.status(409).json({ error: "Email already exists" });
  }
});

authRouter.post("/login", (req, res) => {
  // Client/user login only
  return loginWithExpectedRole(req, res, "user");
});

authRouter.post("/admin-login", (req, res) => {
  // Admin login only
  return loginWithExpectedRole(req, res, "admin");
});

authRouter.get("/me", requireAuth, (req, res) => {
  const userId = Number(req.user.sub);
  const user = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ id: String(user.id), email: user.email, name: user.name, role: user.role });
});

// Admin: list users + update roles

authRouter.get("/users", requireAuth, requireRole("admin"), (_req, res) => {
  const users = db.prepare("SELECT id, email, name, role, created_at FROM users ORDER BY id DESC").all();
  return res.json(
    users.map((u) => ({ id: String(u.id), email: u.email, name: u.name, role: u.role, createdAt: u.created_at }))
  );
});

authRouter.patch("/users/:id/role", requireAuth, requireRole("admin"), (req, res) => {
  const role = req.body?.role === "admin" ? "admin" : "user";
  const userId = Number(req.params.id);
  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, userId);
  const user = db.prepare("SELECT id, email, name, role FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ id: String(user.id), email: user.email, name: user.name, role: user.role });
});
