"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { fetchPublicPosts, type PublicPost } from "../lib/api-client";

function PostCard({ post }: { post: PublicPost }) {
  const excerpt = post.excerpt || `${post.content.substring(0, 150)}...`;

  return (
    <article className="bg-gray-100 rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
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
        <h3 className="text-xl font-semibold text-black mb-2">
          <Link
            href={`/${post.blogSlug}/${post.slug}`}
            className="hover:text-blue-600"
          >
            {post.title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-4">{excerpt}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">
            Featured Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
              <div
                key={key}
                className="bg-gray-100 rounded-lg h-64 shadow-md"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            Failed to load posts. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-black mb-8 text-center">
          Featured Posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data?.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {data && data.posts.length === 0 && (
          <p className="text-center text-gray-600 mt-8">
            No posts available yet. Be the first to create one!
          </p>
        )}
      </div>
    </section>
  );
}
