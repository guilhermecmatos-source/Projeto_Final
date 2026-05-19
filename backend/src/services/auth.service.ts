import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../database/connection";
import { User, UserRole } from "../models/types";
import { AuthPayload } from "../middlewares/auth.middleware";

export class AuthService {
  async login(email: string, password: string) {
    const users = await query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (users.length === 0) {
      throw new Error("Invalid credentials");
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new Error("Invalid credentials");
    }

    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "8h",
    });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async register(name: string, email: string, password: string, role: UserRole = "client") {
    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.length > 0) {
      throw new Error("Email already registered");
    }

    const hash = await bcrypt.hash(password, 10);
    const rows = await query<User>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, hash, role]
    );
    return rows[0];
  }

  async createAttendant(name: string, email: string, password: string) {
    return this.register(name, email, password, "attendant");
  }
}

export const authService = new AuthService();
