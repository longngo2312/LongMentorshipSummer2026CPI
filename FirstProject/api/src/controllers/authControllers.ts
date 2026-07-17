import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import adminDb from "../db/adminDb.js";
import { provisionTenantDB } from "../db/tenantDB.js";
import { JWT_SECRET } from "../middleware/auth.js";

//register function
export async function register(req: Request, res: Response) {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({
      sucess: false,
      message: "Missing credentials",
    });
  }

  const existing = await adminDb
    .prepare(`SELECT id FROM users WHERE email=?`)
    .get(email);

  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const password_hashed = await bcrypt.hash(password, 10);

  const result = await adminDb
    .prepare(
      `INSERT INTO users (username, password_hash, email, tenant_db_path) VALUES (?, ?, ?, ?)`,
    )
    .run(username, password_hashed, email, "");

  const userId = Number(result.lastInsertRowid);
  const tenantDBPath = provisionTenantDB(userId);
  //insert database path in admin database
  await adminDb
    .prepare(`UPDATE users SEt tenant_db_path = ? WHERE id = ?`)
    .run(tenantDBPath, userId);
  const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ token, user: { id: userId, username, email } });
}

export async function login(req: Request, res: Response) {}
