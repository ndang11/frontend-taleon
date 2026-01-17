"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { fetchPublicPosts, type PublicPost } from "../lib/api-client";

function PostCard({ post }: { post: PublicPost }) {
  const excerpt = post.excerpt || `${post.content.substring(0, 150)}...`;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {post.imageUrl && (
        <div className="relative h-48">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          <Link
            href={`/${post.blogSlug}/${post.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            {post.title}
          </Link>
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{excerpt}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{post.authorName}</span>
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString()}
          </time>
        </div>
      </div>
    </article>
  );
}

export function FeaturedPosts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-posts"],
    queryFn: () => fetchPublicPosts({ limit: 12 }),
  });

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Featured Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton elements are static and order doesn't change
                key={`skeleton-${i}`}
                className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Failed to load posts. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Featured Posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data?.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {data && data.posts.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-300 mt-8">
            No posts available yet. Be the first to create one!
          </p>
        )}
      </div>
    </section>
  );
}
