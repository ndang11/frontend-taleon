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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm text-gray-700 font-medium"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...register("email")}
          className="mt-1 block w-full rounded-md border text-gray-500 border-gray-300 px-3 py-2"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...register("password")}
          className="mt-1 block w-full rounded-md border text-gray-500 border-gray-300 px-3 py-2"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="blogName"
          className="block text-sm font-medium text-gray-700"
        >
          What should we call your blog?
        </label>
        <input
          id="blogName"
          type="text"
          placeholder="My awesome blog"
          {...register("blogName")}
          className="mt-1 block w-full rounded-md border border-gray-300 text-gray-500 px-3 py-2"
        />
        {errors.blogName && (
          <p className="mt-1 text-sm text-red-600">{errors.blogName.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isRegistering}
        className="w-full rounded-md  bg-blue-600 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isRegistering ? "Creating..." : "Join Taleon"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
