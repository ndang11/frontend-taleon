"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createBlog,
  generateSlug,
  register as registerApi,
} from "../lib/api-client";
import { setAuthData } from "../lib/auth";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  blogName: z.string().min(2, "Blog name must be at least 2 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    setIsRegistering(true);
    setError(null);
    try {
      // Register user
      const authData = await registerApi({
        name: data.blogName, // Use blogName as name for now
        email: data.email,
        password: data.password,
      });
      setAuthData(authData);

      // Create blog
      const slug = generateSlug(data.blogName);
      await createBlog(
        {
          name: data.blogName,
          slug,
          userId: authData.user.id,
        },
        authData.token,
      );

      router.push("/dashboard");
    } catch (_err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          className="block w-full rounded-xl border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all duration-200"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Create a strong password"
          {...register("password")}
          className="block w-full rounded-xl border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all duration-200"
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="blogName"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Blog Name
        </label>
        <input
          id="blogName"
          type="text"
          placeholder="My awesome blog"
          {...register("blogName")}
          className="block w-full rounded-xl border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-all duration-200"
        />
        {errors.blogName && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            {errors.blogName.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isRegistering}
        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-white font-semibold hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
      >
        {isRegistering ? "Creating your account..." : "Create Account"}
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
    </form>
  );
}
