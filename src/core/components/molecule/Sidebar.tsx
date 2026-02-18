"use client";

import { Home, LogOut, Notebook, TrendingUp, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.provider";
import { clearAuthData } from "@/core/lib/auth";

const navigation = [
  { name: "Home", href: "/me", icon: Home },
  { name: "Profile", href: "/me/profile", icon: User },
  { name: "Stories", href: "/me/stories", icon: Notebook },
  { name: "Stats", href: "/me/stats", icon: TrendingUp },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Taleon</span>
        </Link>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-100">
        <Link
          href="/me/profile"
          onClick={handleNavClick}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "User"}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? "text-gray-900" : "text-gray-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
}
