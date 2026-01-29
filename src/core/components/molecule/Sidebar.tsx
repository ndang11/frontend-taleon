"use client";

import {
  BookmarkIcon,
  Home,
  LogOut,
  Notebook,
  NotebookTabs,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthData } from "@/core/lib/auth";
import DashboardHeader from "./dashboard/header";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Library", href: "/me/list", icon: BookmarkIcon },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Stories", href: "/me/stories", icon: Notebook },
  { name: "Stats", href: "/me/stats", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white">
      <DashboardHeader />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-gray-red hover:text-#201920 "
                    : "text-gray-red  hover:text-#201920"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? "text-#201920 " : "text-#201920 "
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex-shrink-0 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
