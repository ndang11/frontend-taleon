"use client";

import { Heart } from "lucide-react";
import { useToggleLike } from "../../../hook/usePostInteractions";

interface LikeButtonProps {
  postId: string;
  className?: string;
}

export function LikeButton({ postId, className = "" }: LikeButtonProps) {
  const toggleLike = useToggleLike();

  const handleLike = () => {
    toggleLike.mutate(postId);
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={toggleLike.isPending}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors bg-gray-50 text-gray-600 hover:bg-gray-100 ${className}`}
    >
      <Heart className="h-5 w-5" />
      <span className="font-medium">Like</span>
    </button>
  );
}
