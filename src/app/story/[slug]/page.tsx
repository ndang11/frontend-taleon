"use client";

import {
  ArrowLeft,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPublishedPostBySlug } from "@/core/lib/api-client";

// Type for content block
type ContentBlock = {
  id?: string;
  type: string;
  data: Record<string, unknown>;
};

// Helper function to parse content
function parseContent(content: unknown): { blocks: ContentBlock[] } | null {
  if (!content) return null;

  // If content is already an object with blocks
  if (
    typeof content === "object" &&
    content !== null &&
    (content as any).blocks
  ) {
    return content as { blocks: ContentBlock[] };
  }

  // If content is a string, try to parse it as JSON
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (parsed.blocks) {
        return parsed as { blocks: ContentBlock[] };
      }
    } catch {
      // If parsing fails, return null so string content is handled
      return null;
    }
  }

  return null;
}

// Helper component for dynamic headers
function HeaderBlock({ level, text }: { level: number; text: string }) {
  const classes =
    level === 2
      ? "text-2xl font-bold mt-8 mb-4"
      : level === 3
        ? "text-xl font-semibold mt-6 mb-3"
        : level === 4
          ? "text-lg font-semibold mt-4 mb-2"
          : "text-2xl font-bold mt-8 mb-4";

  switch (level) {
    case 2:
      return <h2 className={classes}>{text}</h2>;
    case 3:
      return <h3 className={classes}>{text}</h3>;
    case 4:
      return <h4 className={classes}>{text}</h4>;
    case 5:
      return <h5 className={classes}>{text}</h5>;
    default:
      return <h2 className={classes}>{text}</h2>;
  }
}

export default function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Interaction states with localStorage persistence
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Unwrap params and fetch post
  useEffect(() => {
    params.then(({ slug: resolvedSlug }) => {
      setSlug(resolvedSlug);
    });
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const fetchedPost = await getPublishedPostBySlug(slug);
        setPost(fetchedPost);

        // Initialize like state from localStorage
        if (typeof window !== "undefined") {
          const likedPosts = JSON.parse(
            localStorage.getItem("likedPosts") || "{}",
          );
          const likeCounts = JSON.parse(
            localStorage.getItem("postLikeCounts") || "{}",
          );
          setIsLiked(likedPosts[fetchedPost._id] || false);
          setLikeCount(
            likeCounts[fetchedPost._id] || fetchedPost.likeCount || 0,
          );
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Story not found
          </h1>
          <p className="text-gray-500 mb-4">
            {error ||
              "The story you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const authorName =
    typeof post.authorId === "object" ? post.authorId.name : "Unknown Author";

  const authorAvatar =
    typeof post.authorId === "object" ? post.authorId.avatar : null;

  const handleLike = () => {
    if (!post) return;

    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    // Persist to localStorage
    if (typeof window !== "undefined") {
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "{}");
      const likeCounts = JSON.parse(
        localStorage.getItem("postLikeCounts") || "{}",
      );

      if (newIsLiked) {
        likedPosts[post._id] = true;
        likeCounts[post._id] = newLikeCount;
      } else {
        delete likedPosts[post._id];
        likeCounts[post._id] = newLikeCount;
      }

      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
      localStorage.setItem("postLikeCounts", JSON.stringify(likeCounts));
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.subtitle || post.title,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to stories
      </Link>

      <header className="mb-10">
        {/* Category/Tag */}
        {post.category && (
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-4">
            {post.category}
          </span>
        )}

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Author and metadata */}
        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-3">
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt={authorName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{authorName}</p>
              <p className="text-xs">
                {new Date(
                  post.publishedAt || post.createdAt,
                ).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <span className="hidden sm:inline">•</span>

          <span>{post.readingTime || 5} min read</span>

          {post.viewCount !== undefined && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>{post.viewCount} views</span>
            </>
          )}
        </div>

        {/* Cover image */}
        {post.image && (
          <div className="mt-8">
            <Image
              src={post.image}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-64 sm:h-96 object-cover rounded-xl"
              priority
            />
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-stone prose-lg max-w-none">
        {/* Handle JSON blocks content */}
        {(() => {
          const parsedContent = parseContent(post.content);
          if (parsedContent?.blocks) {
            return parsedContent.blocks.map((block: any, index: number) => {
              const key = block.id || `block-${index}`;

              switch (block.type) {
                case "paragraph":
                case "text":
                  return (
                    <p key={key} className="mb-4 leading-relaxed">
                      {(block.data as any).text}
                    </p>
                  );

                case "header": {
                  const level = (block.data as any).level || 2;
                  return (
                    <HeaderBlock
                      key={key}
                      level={level}
                      text={(block.data as any).text}
                    />
                  );
                }

                case "list": {
                  const listType = (block.data as any).style;
                  if (listType === "unordered") {
                    return (
                      <ul key={key} className="list-disc pl-6 mb-4 space-y-2">
                        {(block.data as any).items?.map(
                          (item: any, i: number) => (
                            <li key={`${i}-${item.content || item}`}>
                              {item.content || item}
                            </li>
                          ),
                        )}
                      </ul>
                    );
                  }
                  if (listType === "ordered") {
                    return (
                      <ol
                        key={key}
                        className="list-decimal pl-6 mb-4 space-y-2"
                      >
                        {(block.data as any).items?.map(
                          (item: any, i: number) => (
                            <li key={`${i}-${item.content || item}`}>
                              {item.content || item}
                            </li>
                          ),
                        )}
                      </ol>
                    );
                  }
                  return null;
                }

                case "quote":
                  return (
                    <blockquote
                      key={key}
                      className="border-l-4 border-blue-500 pl-4 py-2 my-6 text-gray-700 italic bg-gray-50 rounded-r"
                    >
                      {(block.data as any).text}
                      {(block.data as any).caption && (
                        <footer className="text-sm text-gray-500 mt-2">
                          — {(block.data as any).caption}
                        </footer>
                      )}
                    </blockquote>
                  );

                case "code":
                  return (
                    <pre
                      key={key}
                      className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-6"
                    >
                      <code>{(block.data as any).code}</code>
                    </pre>
                  );

                case "image":
                  return (
                    <figure key={key} className="my-8">
                      <Image
                        src={
                          (block.data as any).file?.url ||
                          (block.data as any).url
                        }
                        alt={(block.data as any).caption || "Image"}
                        width={800}
                        height={400}
                        className="w-full rounded-lg"
                      />
                      {(block.data as any).caption && (
                        <figcaption className="text-center text-sm text-gray-500 mt-2">
                          {(block.data as any).caption}
                        </figcaption>
                      )}
                    </figure>
                  );

                case "delimiter":
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-center my-8"
                    >
                      <span className="text-2xl text-gray-300">***</span>
                    </div>
                  );

                default:
                  return null;
              }
            });
          }

          // Handle string content - strip HTML tags
          const contentAny = post.content as unknown;
          if (typeof contentAny === "string") {
            const textContent = contentAny
              .replace(/<[^>]*>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/&/g, "&")
              .replace(/</g, "<")
              .replace(/>/g, ">")
              .replace(/"/g, '"')
              .trim();

            if (textContent) {
              return <p className="mb-4 leading-relaxed">{textContent}</p>;
            }
          }

          return null;
        })()}
      </div>

      {/* Story Actions - Medium.com style */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors group"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isLiked
                    ? "fill-red-500 text-red-500"
                    : "group-hover:fill-red-100"
                }`}
              />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>

            {/* Comment Button */}
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors group">
              <MessageCircle className="w-6 h-6 group-hover:fill-blue-100" />
              <span className="text-sm font-medium">0</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className="p-2 text-gray-600 hover:text-yellow-500 transition-colors"
              title="Bookmark"
            >
              <Bookmark
                className={`w-5 h-5 transition-colors ${
                  isBookmarked
                    ? "fill-yellow-500 text-yellow-500"
                    : "hover:fill-yellow-100"
                }`}
              />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 text-gray-600 hover:text-green-500 transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5 hover:fill-green-100" />
            </button>

            {/* More Options */}
            <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
