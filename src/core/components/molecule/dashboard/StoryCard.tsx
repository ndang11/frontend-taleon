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
    if (!newComment.trim()) return;

    try {
      await createComment.mutateAsync({
        postId: post._id,
        content: newComment,
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
      <Link
        href={
          post.status === "published"
            ? `/post/${post.slug}`
            : `/post/${post._id}`
        }
        className="flex-1 min-w-0"
        onClick={() => onView?.(post)}
      >
        {post.image && (
          <div className="relative h-48 overflow-hidden">
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
          </div>
        )}
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <Link
            href={
              post.status === "published"
                ? `/post/${post.slug}`
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
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{commentCount}</span>
            </span>
          </div>
        </div>

        {/* Comment Section */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowComments(!showComments);
            }}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {commentCount > 0
              ? `Show ${commentCount} comments`
              : "Write a comment"}
          </button>

          {showComments && (
            <div className="mt-4 space-y-4">
              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || createComment.isPending}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Comments List */}
              {loadingComments ? (
                <p className="text-sm text-gray-400">Loading comments...</p>
              ) : Array.isArray(commentsData) && commentsData.length > 0 ? (
                <div className="space-y-3">
                  {commentsData.map((comment: any) => (
                    <div
                      key={comment._id}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {comment.authorId?.name || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          )}
        </div>
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
