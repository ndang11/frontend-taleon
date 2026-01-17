"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchPosts, type Post } from "../../lib/api-client";
import { getToken } from "../../lib/auth";

export default function DashboardContent() {
  const token = getToken();

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", 1, ""],
    queryFn: () => fetchPosts({ page: 1, limit: 10, status: "" }, token || ""),
    enabled: !!token,
  });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-600">Error loading posts</div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Recent Stories</h1>
      {data?.posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No stories yet.{" "}
          <Link href="/editor" className="text-black underline">
            Start writing
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-4">
          {data?.posts.map((post: Post) => (
            <div
              key={post.id}
              className="bg-white p-6 rounded-lg shadow border"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {post.content.slice(0, 150)}...
                  </p>
                  <p className="text-sm text-gray-500">
                    Last edited {new Date(post.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    post.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {post.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
