"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import LandingPageHeader from "@/core/components/molecule/landingPage/landingPageHeader";
import type { Post } from "@/core/lib/api-client";
import { getPublishedPosts } from "@/core/lib/api-client";
import { useToggleLike } from "@/hook/usePostInteractions";
import { Footer } from "../../core/components/molecule/Footer";

export default function BlogPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    data,
    isLoading: isQueryLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["publishedPosts", page],
    queryFn: () => getPublishedPosts(page, 12),
    staleTime: 30 * 1000,
  });

  const toggleLikeMutation = useToggleLike();

  const fetchPosts = useCallback(async (pageNum: number) => {
    const response = await getPublishedPosts(pageNum, 12);
    if (pageNum === 1) {
      setPosts(response.posts || []);
    } else {
      setPosts((prev) => [...prev, ...(response.posts || [])]);
    }
    setHasMore((response.posts || []).length === 12);
    setLoading(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchPosts(1);
    }
  }, [fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleLikeMutation.mutateAsync(postId);
    window.dispatchEvent(new CustomEvent("post-liked", { detail: { postId } }));
  };

  const refreshPosts = () => {
    setPage(1);
    setLoading(true);
    fetchPosts(1);
    refetch();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatReadingTime = (minutes?: number) => {
    if (!minutes) return "5 min read";
    return `${minutes} min read`;
  };

  const getExcerpt = (content: any) => {
    if (!content) return "";

    if (content.content && Array.isArray(content.content)) {
      const textContent: string[] = [];
      const extractText = (nodes: any[]) => {
        nodes.forEach((node) => {
          if (node.type === "text" && node.text) {
            textContent.push(node.text);
          }
          if (node.content) {
            extractText(node.content);
          }
        });
      };
      extractText(content.content);
      return textContent.join(" ").length > 200
        ? `${textContent.join(" ").slice(0, 200)}...`
        : textContent.join(" ");
    }

    if (content.blocks && Array.isArray(content.blocks)) {
      const text = (content.blocks as any[])
        .filter((block) => block.type === "paragraph")
        .map((block) => (block.data as any).text || "")
        .join(" ");
      return text.length > 200 ? `${text.slice(0, 200)}...` : text;
    }

    return "";
  };

  const isLiked = (post: Post) => {
    return (post as any).isLiked || false;
  };

  // Use data from query if available
  const displayPosts =
    data?.posts && data.posts.length > 0 ? data.posts : posts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <LandingPageHeader />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          <button
            onClick={refreshPosts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className={`w-4 h-4 ${isQueryLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Refresh"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            All Stories
          </h1>
          <p className="text-gray-600 text-lg">
            Discover stories from our amazing community of writers
          </p>
        </div>

        {loading && posts.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 animate-pulse h-96 shadow-sm"
              >
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Error"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-red-500 mb-4">Failed to load stories</p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchPosts(1);
                }}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl p-12 max-w-md mx-auto shadow-sm">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="No stories"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 mb-6 text-lg">
                No stories published yet
              </p>
              <Link
                href="/new-story"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Be the first to publish
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post) => {
              const authorName =
                typeof post.authorId === "object" && post.authorId
                  ? (post.authorId as any).name || "Anonymous"
                  : "Anonymous";

              const authorAvatar =
                typeof post.authorId === "object" && post.authorId
                  ? (post.authorId as any).avatar
                  : null;

              return (
                <article
                  key={post._id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Link href={`/post/${post._id}`} className="block">
                    {post.image && (
                      <div className="relative h-52 bg-gray-100 overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title || "Story image"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <div className="p-6">
                      {post.category && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                          <Tag className="w-3 h-3" />
                          {post.category}
                        </span>
                      )}

                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                        {getExcerpt(post.content) || "No preview available..."}
                      </p>

                      {/* Author & Meta */}
                      <div className="flex items-center gap-3 mb-4">
                        {authorAvatar ? (
                          <Image
                            src={authorAvatar}
                            alt={authorName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold ring-2 ring-gray-100">
                            {authorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {authorName}
                          </p>
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt || post.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatReadingTime(post.readingTime)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-gray-400" />
                            {(post as any).viewCount || 0}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <button
                            onClick={(e) => handleLike(post._id, e)}
                            className={`flex items-center gap-1.5 transition-colors ${
                              isLiked(post)
                                ? "text-pink-600"
                                : "text-gray-400 hover:text-pink-600"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${isLiked(post) ? "fill-pink-600" : ""}`}
                            />
                            {(post as any).likeCount || 0}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/post/${post._id}#comments`);
                            }}
                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {(post as any).commentCount || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        {hasMore && displayPosts.length > 0 && (
          <div className="text-center mt-16">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-white border-2 border-gray-200 text-gray-700 px-10 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    role="img"
                    aria-label="Loading"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </span>
              ) : (
                "Load More Stories"
              )}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
