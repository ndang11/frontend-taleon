"use client";

import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { followUser, unfollowUser } from "@/core/lib/api-client";

interface FollowButtonProps {
  authorId: string;
  initialIsFollowing?: boolean;
}

export function FollowButton({
  authorId,
  initialIsFollowing = false,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(authorId);
        setIsFollowing(false);
      } else {
        await followUser(authorId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
        isFollowing
          ? "border border-gray-300 hover:bg-gray-50"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
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
  );
}

export default FollowButton;
