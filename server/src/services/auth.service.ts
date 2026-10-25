import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { UserRole } from "../types.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be configured in production");
}
const secret = JWT_SECRET ?? "local-development-secret-change-me";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
export function signToken(payload: { userId: string; role: UserRole }): string {
  return jwt.sign(payload, secret, { expiresIn: "2h", issuer: "dealership-api" });
}
export function verifyToken(token: string): { userId: string; role: UserRole } {
  const payload = jwt.verify(token, secret, { issuer: "dealership-api" }) as jwt.JwtPayload;
  if (typeof payload.userId !== "string" || !["user", "admin"].includes(payload.role as string)) {
    throw new Error("Invalid token payload");
  }
  return { userId: payload.userId, role: payload.role as UserRole };
}
