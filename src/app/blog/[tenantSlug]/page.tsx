"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { fetchPublicPosts, type PublicPost } from "../../lib/api-client";

interface TenantBlogPageProps {
  params: {
    tenantSlug: string;
  };
}

export default function TenantBlogPage({ params }: TenantBlogPageProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-posts", params.tenantSlug],
    queryFn: () => fetchPublicPosts({ tenantSlug: params.tenantSlug }),
  });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8">Error loading posts</div>;

  const posts = data?.posts || [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">{params.tenantSlug}</h1>
      {posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No posts yet.</div>
      ) : (
        <div className="space-y-8">
          {posts.map((post: PublicPost) => (
            <article key={post.id} className="border-b pb-8">
              <h2 className="text-2xl font-bold mb-2">
                <Link
                  href={`/blog/${params.tenantSlug}/${post.slug}`}
                  className="hover:text-gray-600"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 mb-4">
                {post.excerpt || post.content.slice(0, 200)}...
              </p>
              <div className="text-sm text-gray-500">
                By {post.authorName} •{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
