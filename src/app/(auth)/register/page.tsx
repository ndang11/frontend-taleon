import { Footer } from "@/core/components/molecule/Footer";
import LandingPageHeader from "@/core/components/molecule/landingPage/landingPageHeader";
import { RegisterForm } from "@/core/feature/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <LandingPageHeader />

      <div className="min-h-screen flex items-center justify-center ">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-1xl shadow-1xl border border-white/20">
          <div className="mb-8">
            <h2 className="text-center text-4xl font-bold text-gray-900 mb-2">
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
