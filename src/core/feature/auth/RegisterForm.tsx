"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { register as registerApi } from "../../lib/api-client";
import { setAuthData } from "../../lib/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  blogName: z.string().min(3, "Blog name must be at least 3 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsRegistering(true);
    setError(null);
    try {
      const response = await registerApi(data);

      // Save token to cookies (handled in your auth helper)
      setAuthData(response);

      // Redirect to the dashboard
      router.push("/me");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-semibold mb-1">Full Name</label>
        <div className="relative">
          <input
            {...register("name")}
            className="w-full rounded-xl pl-12 pr-4 py-3 border focus:ring-2"
            placeholder="John Doe"
          />
          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-semibold mb-1">Email</label>
        <div className="relative">
          <input
            {...register("email")}
            type="email"
            className="w-full rounded-xl pl-12 pr-4 py-3 border focus:ring-2"
            placeholder="email@example.com"
          />
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-semibold mb-1">Password</label>
        <div className="relative">
          <input
            {...register("password")}
            type="password"
            className="w-full rounded-xl pl-12 pr-4 py-3 border focus:ring-2"
            placeholder="••••••••"
          />
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Blog Name Field */}
      <div>
        <label className="block text-sm font-semibold mb-1">Blog Name</label>
        <div className="relative">
          <input
            {...register("blogName")}
            className="w-full rounded-xl pl-12 pr-4 py-3 border focus:ring-2"
            placeholder="Tech Chronicles"
          />
          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        {errors.blogName && (
          <p className="text-xs text-red-500 mt-1">{errors.blogName.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isRegistering}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 px-5 py-2"
      >
        {isRegistering ? "Creating Account..." : "Get Started"}
      </button>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </form>
  );
}
