"use client";

import {
  ArrowLeft,
  BarChart3,
  Check,
  DollarSign,
  Lock,
  RefreshCw,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.provider";

export default function PremiumPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleStartTrial = () => {
    if (user) {
      router.push("/register");
    } else {
      router.push("/register");
    }
  };

  const handleComparePlans = () => {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Taleon Premium</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-6">
            <Star size={18} className="fill-current" />
            <span className="text-sm font-medium">
              Unlock the Full Experience
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Elevate Your Storytelling
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Get exclusive features, enhanced analytics, and priority support to
            grow your audience and monetize your content.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartTrial}
              className="w-full sm:w-auto cursor-pointer px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
            >
              Start Free Trial
            </button>
            <button
              onClick={handleComparePlans}
              className="w-full sm:w-auto px-8 py-4 border cursor-pointer border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors"
            >
              Compare Plans
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            Premium Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3
                  className="w-6 h-6 text-blue-600"
                  aria-label="Analytics icon"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Advanced Analytics
              </h4>
              <p className="text-gray-600">
                Detailed insights into your readership, engagement metrics, and
                content performance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign
                  className="w-6 h-6 text-green-600"
                  aria-label="Monetization icon"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Monetization
              </h4>
              <p className="text-gray-600">
                Earn revenue from your content through subscriptions, tips, and
                paid stories.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles
                  className="w-6 h-6 text-purple-600"
                  aria-label="Custom design icon"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Custom Design
              </h4>
              <p className="text-gray-600">
                Customize your story appearance with custom themes, fonts, and
                layouts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap
                  className="w-6 h-6 text-orange-600"
                  aria-label="Priority support icon"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Priority Support
              </h4>
              <p className="text-gray-600">
                Get faster responses from our support team and access to premium
                help resources.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Lock
                  className="w-6 h-6 text-red-600"
                  aria-label="Ad-free icon"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Ad-Free Experience
              </h4>
              <p className="text-gray-600">
                Enjoy an ad-free reading experience and keep 100% of your
                earnings.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <RefreshCw
                  className="w-6 h-6 text-teal-600"
                  aria-label="Cross-platform icon"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Cross-Platform
              </h4>
              <p className="text-gray-600">
                Access your content anywhere with our mobile apps and offline
                reading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            Simple, Transparent Pricing
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Free</h4>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-green-500" />
                  <span className="text-gray-600">
                    Publish unlimited stories
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-green-500" />
                  <span className="text-gray-600">Basic analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-green-500" />
                  <span className="text-gray-600">Join community</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-green-500" />
                  <span className="text-gray-600">Standard support</span>
                </li>
              </ul>
              <Link
                href={user ? "/me" : "/register"}
                className="block w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors text-center"
              >
                {user ? "Current Plan" : "Get Started"}
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-gray-900 rounded-2xl p-8 text-white relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                POPULAR
              </div>
              <h4 className="text-xl font-semibold mb-2">Premium</h4>
              <div className="mb-6">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-green-400" />
                  <span className="text-gray-200">Everything in Free</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-green-400" />
                  <span className="text-gray-200">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-green-400" />
                  <span className="text-gray-200">Monetization tools</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-green-400" />
                  <span className="text-gray-200">Ad-free experience</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-green-400" />
                  <span className="text-gray-200">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check size={18} className="text-green-400" />
                  <span className="text-gray-200">Custom themes</span>
                </li>
              </ul>
              <button
                onClick={handleStartTrial}
                className="w-full py-3 bg-yellow-400 cursor-pointer text-gray-900 font-semibold rounded-full hover:bg-yellow-300 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h4>
              <p className="text-gray-600">
                Yes, you can cancel your Premium subscription at any time.
                You'll continue to have access until the end of your billing
                period.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h4>
              <p className="text-gray-600">
                Yes, new Premium subscribers get a 14-day free trial. No credit
                card required to start.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Can I switch between plans?
              </h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect on your next billing cycle.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                How do I monetize my content?
              </h4>
              <p className="text-gray-600">
                Premium writers can earn through subscriptions, paid stories,
                and reader tips. Set your pricing and start earning in minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Take Your Storytelling to the Next Level?
          </h3>
          <p className="text-gray-300 mb-8">
            Join thousands of writers who have unlocked their full potential
            with Taleon Premium.
          </p>
          <button
            onClick={handleStartTrial}
            className="px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-full hover:bg-yellow-300 transition-colors"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Taleon. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/about" className="text-gray-500 hover:text-gray-900">
              About
            </Link>
            <Link href="/premium" className="text-gray-500 hover:text-gray-900">
              Premium
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-gray-900">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-900">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
