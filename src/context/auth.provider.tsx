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
    const userCookie = Cookies.get("auth_user");
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
