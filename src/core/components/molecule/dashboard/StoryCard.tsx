"use client";

import {
  Clock,
  Edit,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Tag,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import type { Post } from "@/core/lib/api-client";
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");

  // Use likeCount and commentCount from post data if available
  const likeCount = (post as any).likeCount ?? 0;
  const commentCount = (post as any).commentCount ?? 0;
  const viewCount = post.viewCount ?? 0;

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

    // Ensure content is treated as any to avoid type errors with replace/JSON.parse
    let parsedContent: any = content;
    let textContent = "";

    if (typeof parsedContent === "string") {
      try {
        const parsedJson = JSON.parse(parsedContent);
        if (parsedJson && parsedJson.type === "doc") {
          parsedContent = parsedJson; // It's a TipTap JSON object now
        } else {
          // It's a JSON but not TipTap, maybe just a string in JSON.
          textContent = String(parsedJson);
        }
      } catch {
        // Not JSON, likely HTML or plain text.
        // Use browser to strip HTML tags. This runs only on the client.
        if (typeof window !== "undefined") {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = parsedContent;
          textContent = tempDiv.textContent || tempDiv.innerText || "";
        } else {
          // Basic stripping for SSR
          textContent = parsedContent.replace(/<[^>]+>/g, "");
        }
      }
    }

    if (typeof parsedContent === "object" && parsedContent?.type === "doc") {
      // It's a TipTap object
      const getTextFromNode = (node: any): string => {
        if (node.type === "text" && node.text) {
          return node.text;
        }
        return node.content?.map(getTextFromNode).join(" ") || "";
      };
      textContent = parsedContent.content?.map(getTextFromNode).join(" ") || "";
    }

    const excerpt = textContent.slice(0, 160);
    return textContent.length > 160 ? `${excerpt}...` : excerpt;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Navigate to post page to view comments
  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate directly to the comment input
    const postUrl =
      post.status === "published" && post.slug
        ? `/story/${post.slug}#comment-input`
        : `/post/${post._id}#comment-input`;
    window.location.href = postUrl;
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
                {post.title}
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
              {/* Comments - Click to view on post page */}
              <button
                onClick={handleCommentClick}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                title="View comments"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">{commentCount}</span>
              </button>
            </div>
          </div>
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
    </div>
  );
}
