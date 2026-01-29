import { Footer } from "@/core/components/molecule/Footer";
import LandingPageHeader from "@/core/components/molecule/landingPage/landingPageHeader";
import { LoginForm } from "@/core/feature/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <LandingPageHeader />
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-1xl border border-white/20">
          <div className="mb-8">
            <h2 className="text-center text-4xl font-bold text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-center text-gray-600">Sign in to your account</p>
          </div>
          <LoginForm />
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
