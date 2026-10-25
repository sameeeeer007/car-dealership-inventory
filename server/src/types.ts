import type { Request } from "express";
export type UserRole = "user" | "admin";
export interface AuthUser { userId: string; role: UserRole }
export interface AuthRequest extends Request { user?: AuthUser }
