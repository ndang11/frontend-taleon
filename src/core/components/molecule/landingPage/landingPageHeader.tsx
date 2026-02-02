"use client";

import Link from "next/link";
import { useAuth } from "../../../../context/auth.provider";
import Logo from "../../atom/logo";

export default function landingPageHeader() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 w-full bg-white backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/about"
              className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
            >
              About Us
            </Link>
            <Link
              href="/blog"
              className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
            >
              Discover
            </Link>
            <Link
              href="/membership"
              className="text-sm text-gray-600 hover:text-black transition-colors font-medium"
            >
              Premium
            </Link>
          </div>

          {user ? (
            <Link
              href="/me"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              My Dashboard
            </Link>
          ) : (
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
