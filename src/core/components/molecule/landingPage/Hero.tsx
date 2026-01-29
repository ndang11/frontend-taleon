"use client";

import { TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="pt-32 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
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
              creators. Write, publish, and grow your influence with tools built
              for success.
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
                See Examples
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
  );
}

export default Hero;
