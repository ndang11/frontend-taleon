"use client";

import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { useFollow } from "@/hook/useFollow";

interface FollowButtonProps {
  authorId: string;
  onFollowChange?: (isFollowing: boolean, followersCount: number) => void;
}

export function FollowButton({ authorId, onFollowChange }: FollowButtonProps) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const isAuthenticated = !!token;
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const { isFollowing, isLoading, toggleFollow, followCount } =
    useFollow(authorId);

  const handleToggle = () => {
    if (!isAuthenticated) {
      setShowLoginAlert(true);
      return;
    }
    toggleFollow();
    if (onFollowChange) {
      // We need to call this after the mutation completes, but since we don't have
      // direct access to the new state here, we'll call with the current inverted state
      // The parent should re-fetch or handle the state change
      onFollowChange(!isFollowing, followCount);
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
          isFollowing
            ? "border border-gray-300 hover:bg-gray-50"
            : "bg-blue-600 text-white hover:bg-blue-700"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isFollowing ? (
          <>
            <UserCheck size={18} />
            <span>Following</span>
          </>
        ) : (
          <>
            <UserPlus size={18} />
            <span>Follow</span>
          </>
        )}
      </button>

      <AlertDialog
        isOpen={showLoginAlert}
        onClose={() => setShowLoginAlert(false)}
        title="Login Required"
        message="Please log in to follow users."
        buttonText="Login"
        type="info"
        onButtonClick={() => {
          setShowLoginAlert(false);
          window.location.href = "/login";
        }}
      />
    </>
  );
}

export default FollowButton;
