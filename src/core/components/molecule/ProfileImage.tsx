"use client";

import { Edit3, Loader2 } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import { uploadProfileImage } from "@/core/lib/api-client";

interface ProfileImageProps {
  avatar?: string;
  name: string;
  onAvatarChange: (url: string) => void;
  isEditing: boolean;
  uploading?: boolean;
}

export function ProfileImage({
  avatar,
  name,
  onAvatarChange,
  isEditing,
  uploading = false,
}: ProfileImageProps) {
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(avatar);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB max for profile images)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError("");

    // Create a local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLocalAvatar(result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const result = await uploadProfileImage(file);
      onAvatarChange(result.url);
    } catch (err) {
      setError("Failed to upload profile image");
      setLocalAvatar(avatar);
    }
  };

  const displayImage = localAvatar || avatar;

  return (
    <div
      className="relative w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayImage ? (
        <Image src={displayImage} alt={name} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">
          {name?.charAt(0) || "U"}
        </div>
      )}

      {/* Edit Overlay */}
      {isEditing && (
        <div
          className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <label className="cursor-pointer flex flex-col items-center text-white">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <>
                <Loader2 size={24} className="animate-spin mb-1" />
                <span className="text-xs">Uploading...</span>
              </>
            ) : (
              <>
                <Edit3 size={24} className="mb-1" />
                <span className="text-xs font-medium">Change</span>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}

export default ProfileImage;
