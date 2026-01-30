"use client";

import {
  BookOpen,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Post } from "@/core/lib/api-client";

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
    if (!content || !content.blocks) return "";
    return content.blocks
      .filter((block) => block.type === "paragraph")
      .map((block) => block.data.text || "")
      .join(" ")
      .slice(0, 200);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getReadingTime = (content: Post["content"], readingTime?: number) => {
    if (readingTime) return `${readingTime} min read`;
    if (!content || !content.blocks) return "0 min read";
    const wordCount =
      content.blocks.filter((b) => b.type === "paragraph").length * 150;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                post.status,
              )}`}
            >
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </span>
            {post.readingTime && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min
              </span>
            )}
          </div>

          <Link href={`/story/${post.slug}`} className="block">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-gray-600 transition-colors">
              {post.title || "Untitled Story"}
            </h3>
          </Link>

          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {formatContent(post.content) || "No content yet..."}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(post.createdAt)}
            </span>
            {post.authorId && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {post.authorId.name || "Anonymous"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/story/${post.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Read
          </Link>

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      onEdit?.(post);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(post);
                      setShowMenu(false);
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
    </div>
  );
}
