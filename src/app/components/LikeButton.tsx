"use client";

import { Heart } from "lucide-react";
import {
  useHasUserLiked,
  useLikeCount,
  useToggleLike,
} from "../features/likes/hooks";

interface LikeButtonProps {
  postId: string;
  className?: string;
}

export function LikeButton({ postId, className = "" }: LikeButtonProps) {
  const { data: likeCount } = useLikeCount(postId);
  const { data: hasLiked } = useHasUserLiked(postId);
  const toggleLike = useToggleLike();

  const handleLike = () => {
    toggleLike.mutate(postId);
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={toggleLike.isPending}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
        hasLiked
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      } ${className}`}
    >
      <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
      <span className="font-medium">{likeCount || 0}</span>
      <span className="text-sm">{hasLiked ? "Liked" : "Like"}</span>
    </button>
  );
}
