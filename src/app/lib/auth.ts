import Cookies from "js-cookie";
import type { AuthResponse } from "./api-client";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function setAuthData(data: AuthResponse) {
  Cookies.set(TOKEN_KEY, data.token, { expires: 7 });
  Cookies.set(USER_KEY, JSON.stringify(data.user), { expires: 7 });
}

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

export function getUser() {
  const user = Cookies.get(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function clearAuthData() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
