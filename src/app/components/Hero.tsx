"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 dark:text-white mb-6">
          Publish your passion, on Taleon App
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          The multi-tenant platform for serious writers.
        </p>
        <div className="max-w-md mx-auto mb-8">
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Email"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            <Link
              href="/register"
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Writing
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}
