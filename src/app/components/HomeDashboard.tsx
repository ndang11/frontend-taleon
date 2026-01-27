"use client";

import { useQuery } from "@tanstack/react-query";
import { PenSquare, TrendingUp, User } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { fetchPosts, type Post } from "../lib/api-client";
import { getToken, getUser } from "../lib/auth";
import { MediumPostCard } from "./MediumPostCard";

export default function HomeDashboard() {
  const token = getToken();
  const currentUser = getUser();

  const {
    data: postsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["published-posts", 1, 20],
    queryFn: () =>
      fetchPosts({ page: 1, limit: 20, status: "published" }, token || ""),
    enabled: !!token,
  });

  // Ultra-safe array handling
  const posts = useMemo(() => {
    if (!postsResponse?.posts) return [];
    return Array.isArray(postsResponse.posts) ? postsResponse.posts : [];
  }, [postsResponse]);

  // Separate user's posts for highlighting
  const { userPosts, otherPosts } = useMemo(() => {
    if (!currentUser?.id) {
      return { userPosts: [], otherPosts: posts };
    }

    const userPosts = posts.filter(
      (post) =>
        post?.userId &&
        (typeof post.userId === "string"
          ? post.userId === currentUser.id
          : typeof post.userId === "object" &&
              post.userId &&
              "_id" in post.userId
            ? (post.userId as any)._id === currentUser.id
            : false),
    );

    const otherPosts = posts.filter(
      (post) =>
        !post?.userId ||
        (typeof post.userId === "string"
          ? post.userId !== currentUser.id
          : typeof post.userId === "object" &&
              post.userId &&
              "_id" in post.userId
            ? (post.userId as any)._id !== currentUser.id
            : true),
    );

    return { userPosts, otherPosts };
  }, [posts, currentUser?.id]);

  // Combine posts: user's posts first, then others
  const sortedPosts = useMemo(() => {
    return [...userPosts, ...otherPosts];
  }, [userPosts, otherPosts]);

  // Get display name for header
  const getDisplayName = (user: any) => {
    if (user?.name) return user.name;
    if (user?.email) {
      const emailName = user.email.split("@")[0];
      return emailName
        .split(".")
        .map(
          (part: string) =>
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join(" ");
    }
    return "Reader";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover stories from our community
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/editor"></Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? "..." : posts.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Stories published
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? "..." : userPosts.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Your stories
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? "..." : otherPosts.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Community stories
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="space-y-6">
              {["skeleton-1", "skeleton-2", "skeleton-3"].map((key) => (
                <div
                  key={key}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Failed to load stories
              </h3>
              <p className="text-red-600 dark:text-red-300">
                There was an error loading the latest stories. Please try again
                later.
              </p>
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="text-center py-12">
              <PenSquare className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No stories yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be the first to share your story with the community!
              </p>
              <Link
                href="/editor"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <PenSquare className="h-5 w-5" />
                <span>Write your first story</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8">
              {sortedPosts.map((post) => {
                if (!post) return null;

                const isOwnPost = Boolean(
                  currentUser?.id &&
                    (typeof post.userId === "string"
                      ? post.userId === currentUser.id
                      : typeof post.userId === "object" &&
                          post.userId &&
                          "_id" in post.userId
                        ? (post.userId as any)._id === currentUser.id
                        : false),
                );

                return (
                  <MediumPostCard
                    key={post.id || Math.random()}
                    post={post}
                    isOwnPost={isOwnPost}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Load More (placeholder for pagination) */}
        {sortedPosts.length > 0 && !isLoading && (
          <div className="text-center mt-12">
            <button
              type="button"
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg transition-colors"
              disabled
            >
              Load more stories (Coming soon)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
