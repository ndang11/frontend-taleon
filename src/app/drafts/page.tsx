"use client";

import { useQuery } from "@tanstack/react-query";
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

  if (isLoading) return <div>Loading...</div>;

  const posts = postsResponse?.posts || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Draft Posts</h1>
      {posts.length === 0 ? (
        <p>No draft posts found.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="border p-4 rounded-md">
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-600">
                {post.content.substring(0, 100)}...
              </p>
              <div className="mt-2 space-x-2">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <Link
                  href={`/posts/${post.id}/delete`}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
