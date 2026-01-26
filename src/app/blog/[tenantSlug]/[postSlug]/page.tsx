"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchPublicPosts } from "../../../lib/api-client";

export default function PublicPostPage() {
  const { tenantSlug, postSlug } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["publicPost", tenantSlug, postSlug],
    queryFn: () =>
      fetchPublicPosts({ tenantSlug: tenantSlug as string }).then((res) =>
        res.posts.find((p) => p.slug === postSlug),
      ),
    enabled: !!tenantSlug && !!postSlug,
  });

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (error || !data)
    return <div className="text-center py-8">Post not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-serif font-bold mb-4">{data.title}</h1>
      <div className="text-sm text-gray-500 mb-8">
        By {data.authorName} • {new Date(data.createdAt).toLocaleDateString()}
      </div>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );
}
