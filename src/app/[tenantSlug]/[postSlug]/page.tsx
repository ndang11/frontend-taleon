"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { CommentSection } from "../../components/CommentSection";
import { LikeButton } from "../../components/LikeButton";
import { usePostBySlug } from "../../features/posts/hooks";

export default function PostPage() {
  const params = useParams();
  const postSlug = params.postSlug as string;
  const _tenantSlug = params.tenantSlug as string;

  const { data: post, isLoading, error } = usePostBySlug(postSlug);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center py-12">Loading post...</div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center py-12 text-red-600">
          Post not found or failed to load.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <article>
        {/* Post Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 uppercase tracking-wide">
              {post.category}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                post.status === "published"
                  ? "bg-green-100 text-green-800"
                  : post.status === "draft"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {post.status}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Published on {new Date(post.createdAt).toLocaleDateString()}
            </div>
            <LikeButton postId={post.id} />
          </div>
        </header>

        {/* Post Image */}
        {post.image && (
          <div className="mb-8">
            <Image
              src={post.image}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Comments Section */}
        <CommentSection postId={post.id} />
      </article>
    </main>
  );
}
