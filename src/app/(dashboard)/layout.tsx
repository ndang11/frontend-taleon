"use client";

import { Menu, Search, SquarePen, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/auth.provider";
import { NotificationDropdown } from "@/core/components/molecule/dashboard/NotificationDropdown";
import { Sidebar } from "@/core/components/molecule/Sidebar";
import type { Post } from "@/core/lib/api-client";
import { useMyPosts, usePublishedPosts } from "@/hook/useStories";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Desktop Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
            onClick={closeMobileMenu}
          />
          {/* Mobile sidebar with slide-in animation */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden transform transition-transform duration-300 ease-in-out">
            <Sidebar onClose={closeMobileMenu} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Minimal Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 py-6 shrink-0">
          {/* Mobile Hamburger Menu - only visible on mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories..."
                className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />

              {/* Search Results Dropdown */}
              {showResults && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                  {filteredStories.length > 0 ? (
                    filteredStories.slice(0, 10).map((story: any) => (
                      <button
                        key={story._id}
                        type="button"
                        onClick={() => handleStoryClick(story)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {story.title || "Untitled"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          by {getAuthorName(story)}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No stories found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Write Button */}
            <Link
              href="/new-story"
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              <SquarePen className="w-4 h-4" />
              <span className="hidden sm:inline">Write</span>
            </Link>

            {/* User Profile */}
            <Link
              href="/me/profile"
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
              title="Profile"
            >
              {user?.avatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden relative">
                  <Image
                    src={user.avatar}
                    alt={user.name || "User"}
                    fill
                    className="object-cover"
                    sizes="32px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </div>
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
  return <DashboardContent>{children}</DashboardContent>;
}
