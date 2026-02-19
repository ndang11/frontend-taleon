"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import {
  PostCard,
  type PostCardData,
} from "@/core/components/molecule/PostCard";
import { getPublishedPosts } from "@/core/lib/api-client";

const mapPostToCardData = (post: any): PostCardData => ({
  _id: post._id,
  title: post.title,
  content: post.content,
  image: post.image,
  author: typeof post.authorId === "object" ? post.authorId : undefined,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  readTime: post.readTime,
  tags: post.tags,
  slug: post.slug,
  viewCount: post.viewCount ?? 0,
  likeCount: post.likeCount ?? 0,
  commentCount: post.commentCount ?? 0,
});

export default function HomePage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["published-posts", 1, 20],
    queryFn: () => getPublishedPosts(1, 20),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const handlePostPublished = () => {
      refetch();
    };

    window.addEventListener("post-published", handlePostPublished);

    return () => {
      window.removeEventListener("post-published", handlePostPublished);
    };
  }, [refetch]);

  const posts = data?.posts ? data.posts.map(mapPostToCardData) : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 mb-8">
        <div className="flex gap-8">
          <button className="pb-4 text-sm font-medium text-gray-900 border-b-2 border-gray-900">
            For you
          </button>
          <button className="pb-4 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Following
          </button>
        </div>
        <Link
          href="/new-story"
          className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium mb-4"
        >
          <Plus size={16} />
          Write
        </Link>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No stories yet
          </h3>
          <p className="text-gray-500 mb-6">
            Be the first to write a story on Taleon.
          </p>
          <Link
            href="/new-story"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Start writing
          </Link>
        </div>
      )}
    </div>
  );
}
