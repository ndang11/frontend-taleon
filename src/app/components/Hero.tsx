"use client";

import { Sparkles, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <>
      {/* Navigation Bar - White & Black */}
      <nav className="fixed top-0 w-full bg-white backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-8xl mx-auto px-24 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-3xl font-bold text-black">Taleon</span>
            </Link>

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

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - White Background */}
      <section className="pt-32 pb-20 bg-white">
        <div className="max-w-8xl mx-auto px-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-6">
                <TrendingUp className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">
                  Trusted by 25,000+ creators
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
                Amplify Your Voice, Share Your Vision
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The modern platform for storytellers, thought leaders, and
                creators. Write, publish, and grow your influence with tools
                built for success.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-center transition-all duration-200"
                >
                  Get Started
                </Link>
                <Link
                  href="/blog"
                  className="border-2 border-gray-300 text-black px-8 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 transition-all duration-200"
                >
                  Discover More
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gray-200 rounded-3xl opacity-30 blur-3xl"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <Image
                    src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop"
                    alt="Person writing on laptop"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="py-20 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-5xl font-bold text-black dark:text-white mb-2">
                25,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Content Creators
              </div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-black dark:text-white mb-2">
                100,000+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Articles Published
              </div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-black dark:text-white mb-2">
                5M+
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                Readers Worldwide
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </>
  );
}

export default Hero;
