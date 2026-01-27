"use client";

import { useQuery } from "@tanstack/react-query";
import { Edit, Plus, Trash2, User } from "lucide-react";
import Link from "next/link";
import { deletePost, fetchMyPosts, type Post } from "../../lib/api-client";
import { getToken, getUser } from "../../lib/auth";

export default function DashboardContent() {
  const token = getToken();
  const user = getUser();

  const {
    data: posts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-posts"],
    queryFn: () => fetchMyPosts(token || ""),
    enabled: !!token,
  });

  const safePosts = Array.isArray(posts) ? posts : [];
  const publishedPosts = safePosts.filter((p) => p?.status === "published");
  const draftPosts = safePosts.filter((p) => p?.status === "draft");
  const recentPosts = safePosts.slice(0, 5);

  // Extract display name from email
  const getDisplayName = (user: any) => {
    if (user?.name) return user.name;
    if (user?.email) {
      // Extract name from email: john.doe@example.com -> John Doe
      const emailName = user.email.split("@")[0];
      return emailName
        .split(".")
        .map(
          (part: string) =>
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
        )
        .join(" ");
    }
    return "User";
  };

  const handleDeletePost = async (postId: string) => {
    if (!token) return;
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(postId, token);
        refetch();
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* User Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getDisplayName(user)}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.email || "Loading..."}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Here's an overview of your blog posts
              </p>
            </div>
          </div>
        </div>

        {/* Post Counts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Published Posts
            </h2>
            <p className="text-3xl font-bold text-green-600">
              {isLoading ? "..." : publishedPosts.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Draft Posts
            </h2>
            <p className="text-3xl font-bold text-yellow-600">
              {isLoading ? "..." : draftPosts.length}
            </p>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Posts
            </h2>
            <Link
              href="/editor"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Post</span>
            </Link>
          </div>

          {isLoading ? (
            <p className="text-gray-500">Loading posts...</p>
          ) : error ? (
            <p className="text-red-500">Error loading posts</p>
          ) : recentPosts.length === 0 ? (
            <p className="text-gray-500">
              No posts yet. Create your first post!
            </p>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post?.id || Math.random()}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {post?.title || "Untitled Post"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {post?.status || "unknown"} • Updated:{" "}
                      {post?.updatedAt
                        ? new Date(post.updatedAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/editor/${post?.id || ""}`}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 disabled:opacity-50"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => post?.id && handleDeletePost(post.id)}
                      disabled={!post?.id}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
