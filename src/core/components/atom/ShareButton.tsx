"use client";

import { Bookmark, Link2, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  postId: string;
  postTitle: string;
  postSlug?: string;
  className?: string;
}

export function ShareButton({
  postId,
  postTitle,
  postSlug,
  className = "",
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/post/${postSlug || postId}`
      : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
    setShowMenu(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: `Check out this story: ${postTitle}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const handleBookmark = async () => {
    // Check if user is authenticated
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (!token) {
      window.location.href = `/login?redirect=/post/${postSlug || postId}`;
      return;
    }

    // TODO: Implement bookmark API call
    console.log("Bookmarking post:", postId);
    // await bookmarkPost(postId);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
      >
        <Share2 size={18} className="text-gray-600" />
        <span className="text-gray-700 font-medium">Share</span>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-48">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <Link2 size={16} />
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            onClick={() => {
              handleBookmark();
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <Bookmark size={16} />
            Save/Bookmark
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              postTitle,
            )}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <Share2 size={16} />
            Share on X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <Share2 size={16} />
            Share on Facebook
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              shareUrl,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            <Share2 size={16} />
            Share on LinkedIn
          </a>
        </div>
      )}
    </div>
  );
}

export default ShareButton;
