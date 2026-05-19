import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendError } from "../utils/errors";

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return sendError(res, 400, "Email and password are required");
      const result = await authService.login(email, password);
      return res.json(result);
    } catch {
      return sendError(res, 401, "Invalid credentials");
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) return sendError(res, 400, "All fields are required");
      const user = await authService.register(name, email, password);
      return res.status(201).json(user);
    } catch (err) {
      return sendError(res, 400, err instanceof Error ? err.message : "Registration failed");
    }
  }

  async createAttendant(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const user = await authService.createAttendant(name, email, password);
      return res.status(201).json(user);
    } catch (err) {
      return sendError(res, 400, err instanceof Error ? err.message : "Failed to create attendant");
    }
  }

  logout(_req: Request, res: Response) {
    return res.json({ message: "Logged out successfully" });
  }

  me(req: Request, res: Response) {
    return res.json({ user: req.user });
  }
}

export const authController = new AuthController();
