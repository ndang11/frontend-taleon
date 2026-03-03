import { Footer } from "@/core/components/molecule/Footer";
import LandingPageHeader from "@/core/components/molecule/landingPage/landingPageHeader";
import { RegisterForm } from "@/core/feature/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <LandingPageHeader />

      <div className="min-h-screen flex items-start justify-center pt-20">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="mb-6">
            <h2 className="text-center text-3xl font-bold text-gray-900 mb-1">
              Join Taleon
            </h2>
            <p className="text-center text-gray-600 text-sm">
              Create your blog account
            </p>
          </div>
          <RegisterForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
