"use client";

import { Eye, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useComments } from "../features/comments/hooks";
import {
  useHasUserLiked,
  useLikeCount,
  useToggleLike,
} from "../features/likes/hooks";
import type { Post } from "../types/post";

interface PostCardProps {
  post: Post;
  showActions?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({
  post,
  showActions = false,
  onEdit,
  onDelete,
}: PostCardProps) {
  const { data: likeCount } = useLikeCount(post.id);
  const { data: hasLiked } = useHasUserLiked(post.id);
  const { data: comments } = useComments(post.id);
  const toggleLike = useToggleLike();

  const handleLike = () => {
    toggleLike.mutate(post.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.image && (
        <div className="relative h-48">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 uppercase tracking-wide">
            {post.category}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              post.status === "published"
                ? "bg-green-100 text-green-800"
                : post.status === "draft"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {post.status}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          <Link
            href={`/${post.tenantId}/${post.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {post.content.substring(0, 150)}...
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                hasLiked ? "text-red-500" : ""
              }`}
              disabled={toggleLike.isPending}
            >
              <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
              <span>{likeCount || 0}</span>
            </button>

            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{comments?.length || 0}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{post.isPublic ? "Public" : "Private"}</span>
            </div>
          </div>

          {showActions && (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => onEdit?.(post)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(post.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-400">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
