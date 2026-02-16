"use client";

import {
  Clock,
  Edit,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Tag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import type { Post } from "@/core/lib/api-client";
import {
  useComments,
  useCreateComment,
} from "../../../../hook/usePostInteractions";
import { LikeButton } from "../../atom/LikeButton";

interface StoryCardProps {
  post: Post;
  isOwner?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  onView?: (post: Post) => void;
}

export function StoryCard({
  post,
  isOwner,
  onEdit,
  onDelete,
  onView,
}: StoryCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Auth check
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const isAuthenticated = !!token;

  // Use likeCount and commentCount from post data if available
  const likeCount = (post as any).likeCount ?? 0;
  const commentCount = (post as any).commentCount ?? 0;
  const viewCount = post.viewCount ?? 0;

  const { data: commentsData, isLoading: loadingComments } = useComments(
    post._id,
  );

  const createComment = useCreateComment();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    if (!trimmedComment) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/post/${post._id}`;
      return;
    }

    try {
      await createComment.mutateAsync({
        postId: post._id,
        content: trimmedComment,
      });
      setNewComment("");
      setSuccessTitle("Comment posted!");
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to create comment:", error);
      setErrorMessage("Failed to post comment. Please try again.");
      setShowError(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "unpublished":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatContent = (content: Post["content"]) => {
    if (!content) return "";

    // Handle case where content is a JSON string
    let parsedContent: any = content;
    if (typeof content === "string") {
      try {
        parsedContent = JSON.parse(content);
      } catch {
        // If parsing fails, return the raw string truncated
        const textContent = content as string;
        return (
          textContent.slice(0, 160) + (textContent.length > 160 ? "..." : "")
        );
      }
    }

    // Handle case where parsedContent might be a string
    if (typeof parsedContent === "string") {
      return (
        parsedContent.slice(0, 160) + (parsedContent.length > 160 ? "..." : "")
      );
    }

    // Handle case where parsedContent might not have blocks
    if (!parsedContent || typeof parsedContent !== "object") {
      return "";
    }

    const blocks = parsedContent.blocks;
    if (!blocks || !Array.isArray(blocks)) return "";

    return `${blocks
      .filter((block: any) => block.type === "paragraph")
      .map((block: any) => block.data?.text || "")
      .join(" ")
      .slice(0, 160)}${blocks.length > 160 ? "..." : ""}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Container with flex - mobile: column, desktop: row */}
      <div className="flex flex-col">
        {/* Text Content - First on mobile, Below image on desktop */}
        <div className="p-5 order-1 lg:order-none">
          <div className="flex items-start justify-between gap-4 mb-3">
            <Link
              href={
                post.status === "published" && post.slug
                  ? `/story/${post.slug}`
                  : `/post/${post._id}`
              }
              className="flex-1 min-w-0"
              onClick={() => onView?.(post)}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title || "Untitled Story"}
              </h3>
            </Link>

            <div
              className="flex items-center gap-1 flex-shrink-0"
              onClick={(e) => e.preventDefault()}
            >
              <LikeButton postId={post._id} className="text-sm" />

              {isOwner && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setShowMenu(!showMenu);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onEdit?.(post);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onDelete?.(post);
                          setShowMenu(false);
                          setSuccessTitle("Story deleted!");
                          setShowSuccess(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {formatContent(post.content) || "No content yet..."}
          </p>

          {/* Metrics Row */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatDate(post.publishedAt || post.createdAt)}
              </span>
              {post.category && (
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  {post.category}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{viewCount}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Heart className="w-4 h-4" />
                <span className="font-medium">{likeCount}</span>
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowComments(!showComments);
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{commentCount}</span>
              </button>
            </div>
          </div>

          {/* Comment Section - Medium Style */}
          {showComments && (
            <div
              className="mt-4 pt-4 border-t border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                {/* Comment Form */}
                <form
                  onSubmit={handleSubmitComment}
                  className="space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={
                      isAuthenticated
                        ? "What are your thoughts?"
                        : "Log in to share your thoughts..."
                    }
                    disabled={!isAuthenticated}
                    className="w-full px-4 py-3 border border-gray-200 rounded-sm resize-none focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm placeholder:text-gray-400"
                    rows={3}
                  />
                  {isAuthenticated ? (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setNewComment("");
                          setShowComments(false);
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newComment.trim() || createComment.isPending}
                        className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {createComment.isPending ? "Posting..." : "Respond"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      <a
                        href={`/login?redirect=/post/${post._id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Log in
                      </a>{" "}
                      to share your thoughts
                    </p>
                  )}
                </form>

                {/* Comments List */}
                {loadingComments ? (
                  <div className="text-center py-4">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
                  </div>
                ) : Array.isArray(commentsData) && commentsData.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    {commentsData.map((comment: any) => (
                      <div key={comment._id} className="flex gap-3">
                        <div className="shrink-0">
                          {comment.authorId?.avatar ? (
                            <Image
                              src={comment.authorId.avatar}
                              alt={comment.authorId.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-medium text-xs">
                                {(comment.authorId?.name || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">
                              {comment.authorId?.name || "Unknown"}
                            </span>
                            <span className="text-gray-500 text-xs">·</span>
                            <span className="text-xs text-gray-500">
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
                                return commentDate.toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                );
                              })()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No responses yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Image - Below text on mobile, Above text on desktop */}
        {post.image && (
          <div className="relative h-48 overflow-hidden order-2 lg:order-none">
            <Link
              href={
                post.status === "published" && post.slug
                  ? `/story/${post.slug}`
                  : `/post/${post._id}`
              }
              onClick={() => onView?.(post)}
            >
              <Image
                src={post.image}
                alt={post.title || "Post cover"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={600}
                height={192}
              />
              <div className="absolute top-3 left-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    post.status,
                  )}`}
                >
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <AlertDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={successTitle}
        message=""
        buttonText="OK"
      />

      {/* Error Dialog */}
      <AlertDialog
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Error"
        message={errorMessage}
        buttonText="OK"
      />
    </div>
  );
}
