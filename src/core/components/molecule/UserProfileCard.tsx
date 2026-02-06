"use client";

import Image from "next/image";
import { ProfileImage } from "./ProfileImage";

export interface UserProfileCardProps {
  userId?: string;
  name: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  showFollowButton?: boolean;
  onFollowChange?: (isFollowing: boolean, followersCount: number) => void;
}

export function UserProfileCard({
  userId: _userId,
  name,
  email,
  avatar,
  coverImage,
  bio,
  followersCount = 0,
  followingCount = 0,
  showFollowButton: _showFollowButton = true,
  onFollowChange: _onFollowChange,
}: UserProfileCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-gray-300 transition-all duration-300">
      {/* Cover image - behind profile image */}
      <div className="relative h-24 bg-gray-100">
        {coverImage && (
          <Image src={coverImage} alt="Cover" fill className="object-cover" />
        )}
      </div>

      {/* Profile image - overlapping cover */}
      <div className="relative px-5 -mt-12 mb-3">
        <ProfileImage
          avatar={avatar}
          name={name}
          onAvatarChange={() => {}}
          isEditing={false}
        />
      </div>

      {/* User info */}
      <div className="px-5 pb-5">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          <p className="text-sm text-gray-500 truncate">
            @{email?.split("@")[0] || "user"}
          </p>
          {bio && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{bio}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{followersCount} followers</span>
            <span>{followingCount} following</span>
          </div>
        </div>
      </div>
    </div>
  );
}
