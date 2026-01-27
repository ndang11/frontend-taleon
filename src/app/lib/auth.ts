import Cookies from "js-cookie";
import type { AuthResponse } from "./api-client";

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

export interface User {
  id: string;
  email: string;
  name: string;
}

export function setAuthData(data: AuthResponse) {
  if (!data || !data.token || !data.user) {
    console.error("Invalid auth data provided to setAuthData");
    return;
  }

  try {
    Cookies.set(TOKEN_KEY, data.token, { expires: 7 });
    Cookies.set(USER_KEY, JSON.stringify(data.user), { expires: 7 });
  } catch (error) {
    console.error("Failed to set auth data in cookies:", error);
  }
}

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

export function getUser(): User | null {
  try {
    const userCookie = Cookies.get(USER_KEY);

    // Check if cookie exists and is not the string "undefined"
    if (!userCookie || userCookie === "undefined" || userCookie.trim() === "") {
      return null;
    }

    // Safely parse JSON
    const user = JSON.parse(userCookie);

    // Validate the user object has required properties
    if (
      user &&
      typeof user === "object" &&
      typeof user.id === "string" &&
      typeof user.email === "string" &&
      typeof user.name === "string"
    ) {
      return user as User;
    }

    // If validation fails, log in development and return null
    if (process.env.NODE_ENV === "development") {
      console.warn("Invalid user data in cookie:", user);
    }

    return null;
  } catch (error) {
    // Log parsing errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to parse user cookie:", error);
    }
    return null;
  }
}

export function clearAuthData() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
