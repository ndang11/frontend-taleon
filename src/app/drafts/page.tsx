"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Edit,
  FileText,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { fetchPosts } from "../lib/api-client";
import { getToken } from "../lib/auth";

export default function DraftsPage() {
  const token = getToken();

  const { data: postsResponse, isLoading } = useQuery({
    queryKey: ["posts", { status: "draft" }],
    queryFn: () => fetchPosts({ status: "draft" }, token || ""),
    enabled: !!token,
  });

  const posts = postsResponse?.posts || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 inline-block"
          >
            ← Back to Dashboard
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Draft Posts
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Continue working on your unfinished stories
                </p>
              </div>
              <Link
                href="/posts/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                New Post
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Drafts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.reduce(
                    (acc, post) =>
                      acc +
                      post.content.split(" ").filter((word) => word.length > 0)
                        .length,
                    0,
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Words Written
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {posts.length > 0
                    ? Math.round(
                        posts.reduce(
                          (acc, post) =>
                            acc +
                            post.content
                              .split(" ")
                              .filter((word) => word.length > 0).length,
                          0,
                        ) / posts.length,
                      )
                    : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Words/Draft
                </div>
              </div>
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Drafts Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start writing your next masterpiece.
            </p>
            <Link
              href="/posts/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block"
            >
              Create Your First Draft
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded">
                    Draft
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.content.substring(0, 120)}...
                </p>

                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                  <span>
                    {
                      post.content.split(" ").filter((word) => word.length > 0)
                        .length
                    }{" "}
                    words
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm text-center hover:bg-blue-700"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/posts/${post.id}/delete`}
                    className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded text-sm text-center hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    Delete
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
