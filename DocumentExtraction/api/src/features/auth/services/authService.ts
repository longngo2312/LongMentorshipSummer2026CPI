import jwt from "jsonwebtoken";
import adminDb from "../../../db/adminDB.js";
import { provisionTenantDB } from "../../../db/tenantDb.js";
import { JWT_SECRET } from "../../../middleware/auth.js";
import type { AuthResponse, LoginBody, RegisterBody } from "../dtos/auth.dto.js";
import type { User } from "../models/user.model.js";
import { AUTH_SQL } from "../sqls/auth.sql.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";

export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function registerUser(body: RegisterBody): Promise<AuthResponse> {
  let {username, email, password} = body 
  username = username?.trim()
  email = email.trim().toLowerCase()
  

  const existing = adminDb.prepare(AUTH_SQL.findUserIdByEmail).get(email);
  if (existing) {
    throw new AuthError(409, "Email already registered.");
  }

  const passwordHash = await hashPassword(password);

  const result = adminDb
    .prepare(AUTH_SQL.insertUser)
    .run(username, passwordHash, email, "");
  const userId = Number(result.lastInsertRowid);

  const tenantDBPath = provisionTenantDB(userId);
  adminDb.prepare(AUTH_SQL.updateTenantDbPath).run(tenantDBPath, userId);

  const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" });

  return {
    success: true,
    message: "User registered successfully.",
    token,
    user: { id: userId, username, email },
  };
}

export async function loginUser(body: LoginBody): Promise<AuthResponse> {
  const email = body.email?.trim().toLowerCase();
  const { password } = body;

  const user = adminDb
    .prepare(AUTH_SQL.findUserForLogin)
    .get(email) as User | undefined;

  if (!user) {
    throw new AuthError(401, "User not found");
  }

  const validPassword = await comparePassword(password, user.password_hash);
  if (!validPassword) {
    throw new AuthError(401, "Invalid password.");
  }

  adminDb.prepare(AUTH_SQL.updateLastLogin).run(user.id);

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    success: true,
    message: "Login successful.",
    token,
    user: { id: user.id, username: user.username, email: user.email },
  };
}