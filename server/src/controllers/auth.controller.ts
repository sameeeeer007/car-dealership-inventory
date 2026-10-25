import type { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/user.model.js";
import { hashPassword, signToken, verifyPassword } from "../services/auth.service.js";
const loginSchema = z.object({
  email: z.string().email().max(254).transform(v => v.toLowerCase().trim()),
  password: z.string().min(1).max(128)
});
const registerSchema = z.object({
  email: z.string().email().max(254).transform(v => v.toLowerCase().trim()),
  password: z.string().min(8).max(128),
  role: z.enum(["user", "admin"]).optional()
});

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid registration data", errors: parsed.error.flatten() });
  const { email, password } = parsed.data;
  // Public registration always creates a regular user; admin provisioning must be performed out-of-band.
  if (await User.exists({ email })) return res.status(409).json({ message: "Email is already registered" });
  const user = await User.create({ email, passwordHash: await hashPassword(password), role: "user" });
  const token = signToken({ userId: user.id, role: user.role });
  return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
}
export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid login data" });
  const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  return res.status(200).json({
    token: signToken({ userId: user.id, role: user.role }),
    user: { id: user.id, email: user.email, role: user.role }
  });
}
