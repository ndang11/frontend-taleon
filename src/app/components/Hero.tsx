"use client";

import { BarChart3, BookOpen, Edit, Palette, Quote, Users } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
          Unleash Your Voice: Write, Share, and Connect on Taleon
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          The ultimate multi-tenant blogging platform where serious writers
          thrive, communities grow, and ideas spread like wildfire.
        </p>
        <div className="max-w-md mx-auto">
          <Link
            href="/register"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold inline-block shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Your Writing Journey Today
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center group">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Seamless Multi-Tenant Blogging
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Create and manage multiple blogs under one account, perfect for
            writers with diverse interests or professional portfolios.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center group">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
            <Edit className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Rich Text Editor
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Craft stunning posts with our intuitive editor featuring markdown
            support, image uploads, and real-time previews.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center group">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Community Engagement
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Build a loyal audience with comments, likes, and social sharing
            features that keep readers coming back.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center group">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
            <Palette className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Customizable Themes
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Personalize your blog's look with a variety of themes and layouts to
            match your unique style.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center group md:col-span-2 lg:col-span-1">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:rotate-12 transition-transform duration-300">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Analytics Dashboard
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Track your blog's performance with detailed analytics on views,
            engagement, and growth metrics.
          </p>
        </div>
      </div>

      {/* About */}
      <div className="mt-24 max-w-4xl mx-auto text-center bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          About Taleon
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Taleon is more than just a blogging platform—it's a vibrant ecosystem
          designed for passionate writers who want to make an impact. Whether
          you're a seasoned author, a niche expert, or just starting your
          writing journey, Taleon provides the tools and community to help your
          voice be heard. Join thousands of writers who have transformed their
          ideas into influential content.
        </p>
      </div>

      {/* Testimonials */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative">
          <Quote className="h-8 w-8 text-blue-500 absolute top-4 left-4 opacity-20" />
          <p className="text-gray-600 dark:text-gray-300 mb-6 italic leading-relaxed pt-8">
            "Taleon has revolutionized how I share my stories. The multi-tenant
            feature lets me maintain separate blogs for my fiction and
            non-fiction work effortlessly."
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            - Sarah Johnson, Novelist
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative">
          <Quote className="h-8 w-8 text-green-500 absolute top-4 left-4 opacity-20" />
          <p className="text-gray-600 dark:text-gray-300 mb-6 italic leading-relaxed pt-8">
            "The community on Taleon is incredible. I've gained so many readers
            and made connections I never thought possible."
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            - Mark Chen, Tech Blogger
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative">
          <Quote className="h-8 w-8 text-purple-500 absolute top-4 left-4 opacity-20" />
          <p className="text-gray-600 dark:text-gray-300 mb-6 italic leading-relaxed pt-8">
            "The analytics help me understand what resonates with my audience,
            allowing me to create better content every time."
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            - Emily Rodriguez, Lifestyle Writer
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 text-center">
        <Link
          href="/register"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-semibold inline-block text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
        >
          Join the Taleon Community
        </Link>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          Free to start. No credit card required.
        </p>
      </div>
    </section>
  );
}
