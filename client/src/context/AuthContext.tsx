import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { api, setSession } from "../api/client";
import type { User } from "../types";

interface AuthValue { user: User | null; token: string | null; login(email: string, password: string): Promise<void>; register(email: string, password: string): Promise<void>; logout(): void }
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("dealership_token"));
  const [user, setUser] = useState<User | null>(() => {
    try { const raw = localStorage.getItem("dealership_user"); return raw ? JSON.parse(raw) as User : null; } catch { return null; }
  });
  async function accept(path: "/auth/login" | "/auth/register", email: string, password: string) {
    const response = await api.post<{token: string; user: User}>(path, { email, password });
    setToken(response.data.token); setUser(response.data.user); setSession(response.data.token);
    localStorage.setItem("dealership_user", JSON.stringify(response.data.user));
  }
  const value = useMemo<AuthValue>(() => ({
    user, token,
    login: (email, password) => accept("/auth/login", email, password),
    register: (email, password) => accept("/auth/register", email, password),
    logout: () => { setToken(null); setUser(null); setSession(null); localStorage.removeItem("dealership_user"); }
  }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; }
