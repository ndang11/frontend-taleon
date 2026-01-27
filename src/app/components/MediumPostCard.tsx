"use client";

import { Clock, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Post } from "../lib/api-client";
import { getUser } from "../lib/auth";

interface MediumPostCardProps {
  post: Post;
  isOwnPost?: boolean;
}

export function MediumPostCard({
  post,
  isOwnPost = false,
}: MediumPostCardProps) {
  const currentUser = getUser();

  // Calculate reading time (rough estimate: 200 words per minute)
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  // Extract excerpt from content
  const getExcerpt = (content: string, maxLength: number = 150) => {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, "");
    if (plainText.length <= maxLength) return plainText;
    return `${plainText.substring(0, maxLength).trim()}...`;
  };

  // Get display name from post's user data or fallback
  const getAuthorName = () => {
    if (
      post.userId &&
      typeof post.userId === "object" &&
      "name" in post.userId
    ) {
      return (post.userId as any).name;
    }
    return "Anonymous";
  };

  const readingTime = getReadingTime(post?.content || "");
  const excerpt = getExcerpt(post?.content || "");

  return (
    <article
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 ${isOwnPost ? "ring-2 ring-blue-500 ring-opacity-50" : ""}`}
    >
      {/* Featured Image */}
      {post?.image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.image}
            alt={post?.title || "Post image"}
            fill
            className="object-cover hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isOwnPost && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Your post
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Category/Tag */}
        {post?.category && (
          <div className="mb-3">
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-3 py-1 rounded-full">
              {post.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
          <Link
            href={`/${post?.tenantId || "default"}/${post?.slug || ""}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {post?.title || "Untitled Post"}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {excerpt}
        </p>

        {/* Author and Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Author Avatar */}
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>

            {/* Author Name */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {getAuthorName()}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {post?.updatedAt
                    ? new Date(post.updatedAt).toLocaleDateString()
                    : "Unknown date"}
                </span>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status indicator for drafts */}
          {post?.status === "draft" && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
              Draft
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
