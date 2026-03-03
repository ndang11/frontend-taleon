"use client";

import { AlertCircle, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuth } from "@/context/auth.provider";
import { StoryCard } from "@/core/components/molecule/dashboard/StoryCard";
import { useTenantPublishedPosts } from "@/hook/useStories";

export default function MyStoriesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: postsData, isLoading, isError } = useTenantPublishedPosts();

  const posts = postsData?.posts || [];
  const totalPosts = postsData?.total || 0;

  const handleView = useCallback(
    (post: any) => {
      router.push(`/story/${post.slug}`);
    },
    [router],
  );

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Please log in
          </h3>
          <p className="text-gray-500 mb-6">
            You need to be logged in to view published stories.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Published Stories
          </h1>
          <p className="text-gray-500 mt-1">
            All published stories in your workspace
          </p>
        </div>
        <Link
          href="/new-story"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Story
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 mb-8 max-w-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Published</p>
          <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load published stories
          </h3>
          <p className="text-gray-500 mb-6">Please try again later.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No published stories yet
          </h3>
          <p className="text-gray-500 mb-6">Be the first to publish a story!</p>
          <Link
            href="/new-story"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Write a Story
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <StoryCard
              key={post._id}
              post={post}
              isOwner={false}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
