import { Request, Response } from "express";
import type { LoginBody, RegisterBody } from "../dtos/auth.dto.js";
import { AuthError, loginUser, registerUser } from "../services/authService.js";
import { isValidEmail, isValidPassword } from "../utils/validation.util.js";

export async function register(
  req: Request<{}, {}, RegisterBody>,
  res: Response,
) {
  try {
    const { username, email, password } = req.body;
    const trimmedUsername = username?.trim();
    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedUsername || !trimmedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required.",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address.",
      });
    }

    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}

export async function login(req: Request<{}, {}, LoginBody>, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const result = await loginUser(req.body);
    return res.json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}
