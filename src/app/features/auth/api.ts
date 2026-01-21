import { api } from "@/app/lib/api-client";
import type { AuthResponse, LoginInput, RegisterInput } from "./types";

export const login = (input: LoginInput) =>
  api<AuthResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

export const register = (input: RegisterInput) =>
  api<AuthResponse>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

export const logout = () => api("/auth/logout", { method: "POST" });

export const getCurrentUser = () => api<AuthResponse>("/auth/me");
