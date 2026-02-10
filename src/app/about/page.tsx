import { ArrowLeft, Lightbulb, Shield, Target, Users } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us - Taleon",
  description:
    "Learn about Taleon - a platform for readers and writers to connect.",
};

export default function AboutPage() {
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
          <h1 className="text-xl font-bold text-gray-900">About Taleon</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Where Stories Come to Life
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Taleon is a modern publishing platform that connects writers with
            readers. We believe in the power of storytelling to inspire,
            educate, and entertain.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Our Mission
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target
                  className="w-6 h-6 text-blue-600"
                  aria-label="Edit icon"
                  role="img"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Empower Writers
              </h4>
              <p className="text-gray-600">
                We provide tools for writers to create, publish, and share their
                stories with the world.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users
                  className="w-6 h-6 text-green-600"
                  aria-label="Book icon"
                  role="img"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Inspire Readers
              </h4>
              <p className="text-gray-600">
                Curated content from talented writers across diverse topics and
                genres.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users
                  className="w-6 h-6 text-purple-600"
                  aria-label="Users icon"
                  role="img"
                />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Build Community
              </h4>
              <p className="text-gray-600">
                Connect writers and readers through meaningful interactions and
                feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Our Values
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Quality Content
                </h4>
                <p className="text-gray-600">
                  We promote thoughtful, well-crafted stories that provide value
                  to readers.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Respect & Inclusivity
                </h4>
                <p className="text-gray-600">
                  We foster a welcoming environment for writers and readers of
                  all backgrounds.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Creative Freedom
                </h4>
                <p className="text-gray-600">
                  We support writers' creative expression while maintaining
                  community standards.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Privacy & Security
                </h4>
                <p className="text-gray-600">
                  We protect user data and ensure a safe platform for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Meet Our Team
          </h3>
          <p className="text-gray-600 mb-8">
            A passionate team dedicated to making Taleon the best platform for
            storytelling.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                N
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                Ndang Royalty
              </h4>
              <p className="text-gray-500 text-sm mb-3">Team Lead</p>
              <p className="text-gray-600 text-sm">
                Visionary leader passionate about democratizing publishing.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                E
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                Ewi Kisito
              </h4>
              <p className="text-gray-500 text-sm mb-3">Frontend Engineer</p>
              <p className="text-gray-600 text-sm">
                Skilled developer building beautiful user interfaces and
                experiences.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                B
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                Bimela Tony
              </h4>
              <p className="text-gray-500 text-sm mb-3">Backend Engineer</p>
              <p className="text-gray-600 text-sm">
                Expert in building robust and scalable backend systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h3>
          <p className="text-gray-600 mb-8">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <div className="bg-gray-50 rounded-xl p-8">
            <p className="text-gray-700 mb-2">
              <strong>Email:</strong> hello@taleon.app
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Twitter:</strong> @taleonapp
            </p>
            <p className="text-gray-700">
              <strong>Location:</strong> Yaounde, Cameroon
            </p>
          </div>
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
