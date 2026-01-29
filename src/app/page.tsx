"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FeaturedPosts } from "./components/FeaturedPosts";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { getUser } from "./lib/auth";

export default function Home() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <Hero />
      <FeaturedPosts />
      <Footer />
    </div>
  );
}
