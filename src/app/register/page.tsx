import { Sparkles } from "lucide-react";
import Link from "next/link";
import { RegisterForm } from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-black">Taleon</span>
            </Link>
          </div>
          <div className="mb-8">
            <h2 className="text-center text-3xl font-bold text-black mb-2">
              Join Taleon
            </h2>
            <p className="text-center text-gray-600">
              Create your blog account
            </p>
          </div>
          <RegisterForm />
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
