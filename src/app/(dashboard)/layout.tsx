"use client";

import { Search, SquarePen, User } from "lucide-react";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/context/auth.provider";
import { Sidebar } from "@/core/components/molecule/Sidebar";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Minimal Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 py-12 shrink-0">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories..."
                className="w-full pl-24 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Write Button */}
            <Link
              href="/new-story"
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <SquarePen className="w-4 h-4" />
              Write
            </Link>

            {/* User Profile */}
            <Link
              href="/me/profile"
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}
