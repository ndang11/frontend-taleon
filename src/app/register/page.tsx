import { RegisterForm } from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Join Taleon.
          </h2>
        </div>
        <RegisterForm />
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-black hover:text-gray-800"
            >
              Sign in.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
