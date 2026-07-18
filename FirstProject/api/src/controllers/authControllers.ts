import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import adminDb from "../db/adminDB.js";
import { provisionTenantDB } from "../db/tenantDB.js";
import { JWT_SECRET } from "../middleware/auth.js";
import type { User } from "../types/index.js";

interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function register(
  req: Request<{}, {}, RegisterBody>,
  res: Response,
) {
  try {
    let { username, email, password } = req.body;

    //trim white space and lowercase
    username = username?.trim();
    email = email?.trim().toLowerCase();

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    // Check existing user
    const existing = adminDb
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = adminDb
      .prepare(
        `
        INSERT INTO users
        (username, password_hash, email, tenant_db_path)
        VALUES (?, ?, ?, ?)
      `,
      )
      .run(username, passwordHash, email, "");

    const userId = Number(result.lastInsertRowid);

    // Create tenant database
    const tenantDBPath = provisionTenantDB(userId);

    // Save tenant path
    adminDb
      .prepare(
        `
        UPDATE users
        SET tenant_db_path = ?
        WHERE id = ?
      `,
      )
      .run(tenantDBPath, userId);

    // JWT
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: {
        id: userId,
        username,
        email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export async function login(req: Request<{}, {}, LoginBody>, res: Response) {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    //get user details from adminDB
    const user = adminDb
      .prepare(
        `
        SELECT
          id,
          username,
          email,
          password_hash
        FROM users
        WHERE email = ?
      `,
      )
      .get(email) as User | undefined;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    adminDb
      .prepare(
        `
        UPDATE users
        SET last_login_at = datetime('now')
        WHERE id = ?
      `,
      )
      .run(user.id);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}
