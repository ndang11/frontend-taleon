// biome-ignore assist/source/organizeImports: Imports are intentionally ordered
import { Bell, Menu, Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { NotificationDropdown } from "@/core/components/molecule/dashboard/NotificationDropdown";
import { useAuth } from "@/context/auth.provider";
import Logo from "@/core/components/atom/logo";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-200 bg-white">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <Logo />
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-48"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <NotificationDropdown />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
          >
            {user?.avatar ? (
              <div className="w-8 h-8 rounded-full overflow-hidden relative">
                <Image
                  src={user.avatar}
                  alt={user.name || "User"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Link
                href="/me/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowUserMenu(false)}
              >
                Profile
              </Link>
              <Link
                href="/me"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowUserMenu(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/me/stories"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowUserMenu(false)}
              >
                My Stories
              </Link>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
