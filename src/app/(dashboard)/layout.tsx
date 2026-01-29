"use client";

import { SquarePen, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/context/auth.provider";
import { Sidebar } from "@/core/components/molecule/Sidebar";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div>
            {user && (
              <h1 className="text-md font-medium text-gray-700">
                <span className="text-black font-bold">{user.name}</span>
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/new-story"
              className="flex items-center text-gray-600 hover:text-black transition-colors text-sm"
            >
              <SquarePen className="w-4 h-4 mr-2" />
              Write
            </Link>
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0] || "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">{children}</div>
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
