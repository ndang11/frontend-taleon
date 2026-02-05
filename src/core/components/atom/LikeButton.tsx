"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { AlertDialog } from "../../../components/ui/AlertDialog";
import {
  useHasUserLiked,
  useLikeCount,
  useToggleLike,
} from "../../../hook/usePostInteractions";

interface LikeButtonProps {
  postId: string;
  className?: string;
  showCount?: boolean;
}

export function LikeButton({
  postId,
  className = "",
  showCount = true,
}: LikeButtonProps) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const isAuthenticated = !!token;
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const { data: likeCount } = useLikeCount(postId);
  const { data: hasLiked } = useHasUserLiked(postId);
  const toggleLike = useToggleLike();

  const handleLike = () => {
    if (!isAuthenticated) {
      setShowLoginAlert(true);
      return;
    }
    toggleLike.mutate(postId);
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={toggleLike.isPending || !isAuthenticated}
      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
        !isAuthenticated
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : hasLiked
            ? "bg-red-50 text-red-600 hover:bg-red-100"
            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      } ${className}`}
    >
      <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
      {showCount && <span className="font-medium">{likeCount || 0}</span>}

      <AlertDialog
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        title="Login Required"
        message="Please log in to like posts."
        buttonText="Login"
        type="info"
        onButtonClick={() => {
          setShowLoginAlert(false);
          window.location.href = "/login";
        }}
      />
    </button>
  );
}
