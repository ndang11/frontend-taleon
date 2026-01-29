"use client";

import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext<{ user: any | null }>({ user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userCookie = Cookies.get("auth_user");
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
