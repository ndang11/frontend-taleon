"use client";

import {
  ArrowLeft,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPublishedPostBySlug } from "@/core/lib/api-client";
import {
  useBookmarkCount,
  useComments,
  useCreateComment,
  useHasUserBookmarked,
  useToggleBookmark,
} from "@/hook/usePostInteractions";

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

  // Comment states
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [commentFocused, setCommentFocused] = useState(false);

  // Hooks for interactions
  const { data: comments = [], isLoading: commentsLoading } = useComments(
    post?._id || "",
  );
  const createCommentMutation = useCreateComment();
  const toggleBookmarkMutation = useToggleBookmark();
  const { data: bookmarkCount = 0 } = useBookmarkCount(post?._id || "");
  const { data: hasBookmarked = false } = useHasUserBookmarked(post?._id || "");

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
    if (post?._id) {
      toggleBookmarkMutation.mutate(post._id);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post?._id) return;

    try {
      await createCommentMutation.mutateAsync({
        postId: post._id,
        content: commentText.trim(),
      });
      setCommentText("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo(commentId);
    setReplyText(`@${authorName} `);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
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
            <button
              onClick={handleCommentClick}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors group"
            >
              <MessageCircle className="w-6 h-6 group-hover:fill-blue-100" />
              <span className="text-sm font-medium">{comments.length}</span>
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
                  hasBookmarked
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

      {/* Comments Section - Medium-style Responses */}
      {showComments && (
        <div id="comment-input" className="mt-16">
          {/* Responses Header */}
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Responses ({comments.length})
            </h2>
          </div>

          {/* Comment Input - Medium Style */}
          <form onSubmit={handleCommentSubmit} className="mt-8 mb-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {typeof window !== "undefined" &&
                    localStorage.getItem("user")
                      ? JSON.parse(localStorage.getItem("user") || "{}")
                          .name?.charAt(0)
                          .toUpperCase() || "U"
                      : "U"}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div
                  className={`relative transition-all duration-200 ${
                    commentFocused ? "ring-1 ring-gray-900" : ""
                  } rounded-sm`}
                >
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onFocus={() => setCommentFocused(true)}
                    onBlur={() => setCommentFocused(false)}
                    placeholder="What are your thoughts?"
                    className="w-full p-4 border border-gray-200 rounded-sm resize-none focus:outline-none focus:border-gray-300 transition-colors text-gray-900 placeholder:text-gray-400"
                    rows={commentFocused || commentText ? 4 : 1}
                    disabled={createCommentMutation.isPending}
                  />
                </div>
                {(commentFocused || commentText) && (
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCommentText("");
                        setCommentFocused(false);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !commentText.trim() || createCommentMutation.isPending
                      }
                      className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-green-600"
                    >
                      {createCommentMutation.isPending
                        ? "Responding..."
                        : "Respond"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Comments List - Medium Style */}
          <div className="space-y-8">
            {commentsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-16">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No responses yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Be the first to share your thoughts
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="group">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {comment.userId.avatar ? (
                        <Image
                          src={comment.userId.avatar}
                          alt={comment.userId.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {comment.userId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      {/* Author Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900 hover:underline cursor-pointer">
                          {comment.userId.name}
                        </span>
                        <span className="text-gray-500 text-sm">·</span>
                        <span className="text-gray-500 text-sm">
                          {(() => {
                            const now = new Date();
                            const commentDate = new Date(comment.createdAt);
                            const diffMs =
                              now.getTime() - commentDate.getTime();
                            const diffMins = Math.floor(diffMs / 60000);
                            const diffHours = Math.floor(diffMs / 3600000);
                            const diffDays = Math.floor(diffMs / 86400000);

                            if (diffMins < 1) return "Just now";
                            if (diffMins < 60) return `${diffMins}m ago`;
                            if (diffHours < 24) return `${diffHours}h ago`;
                            if (diffDays < 7) return `${diffDays}d ago`;
                            return commentDate.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            });
                          })()}
                        </span>
                      </div>

                      {/* Comment Text */}
                      <p className="text-gray-900 leading-relaxed mb-3">
                        {comment.content}
                      </p>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-6">
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors group/clap">
                          <Heart className="w-4 h-4 group-hover/clap:scale-110 transition-transform" />
                          <span className="text-sm">0</span>
                        </button>
                        <button
                          onClick={() =>
                            handleReply(comment._id, comment.userId.name)
                          }
                          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          Reply
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Reply Form */}
                      {replyingTo === comment._id && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-200">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {typeof window !== "undefined" &&
                                  localStorage.getItem("user")
                                    ? JSON.parse(
                                        localStorage.getItem("user") || "{}",
                                      )
                                        .name?.charAt(0)
                                        .toUpperCase() || "U"
                                    : "U"}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full p-3 border border-gray-200 rounded-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                                rows={3}
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={handleCancelReply}
                                  className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={!replyText.trim()}
                                  className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
