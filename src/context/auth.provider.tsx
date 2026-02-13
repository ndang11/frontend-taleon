"use client";

import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@/core/lib/auth";

const AuthContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}>({
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("access_token");
    const userCookie = Cookies.get("auth_user");

    if (token && userCookie && userCookie !== "undefined") {
      try {
        const parsedUser = JSON.parse(userCookie);
        const userId = parsedUser._id || parsedUser.id;

        if (userId) {
          const API_BASE_URL =
            process.env.NEXT_PUBLIC_API_URL ||
            "https://taleon-7rwt.onrender.com/api";
          const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const freshUser = await response.json();
            Cookies.set("auth_user", JSON.stringify(freshUser), { expires: 7 });
            setUser(freshUser);
            return;
          }
        }
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    }

    // Fallback to cookie data
    if (userCookie && userCookie !== "undefined") {
      try {
        const userData = JSON.parse(userCookie);
        setUser(userData);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const userCookie = Cookies.get("auth_user");
    try {
      setUser(userCookie ? JSON.parse(userCookie) : null);
    } catch {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
