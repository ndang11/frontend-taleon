"use client";

import { Edit3, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import { uploadCoverImage } from "@/core/lib/api-client";

interface CoverImageProps {
  coverImage?: string | null;
  onCoverImageChange: (url: string) => void;
  isEditing: boolean;
  uploading?: boolean;
}

export function CoverImage({
  coverImage,
  onCoverImageChange,
  isEditing,
  uploading = false,
}: CoverImageProps) {
  const [localCoverImage, setLocalCoverImage] = useState<string | null>(
    coverImage || null,
  );
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

    // Validate file size (10MB max for cover images)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setError("");

    // Create a local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLocalCoverImage(result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const result = await uploadCoverImage(file);
      onCoverImageChange(result.url);
    } catch (err) {
      setError("Failed to upload cover image");
      setLocalCoverImage(coverImage || null);
    }
  };

  const handleRemoveCover = () => {
    setLocalCoverImage(null);
    onCoverImageChange("");
  };

  const displayImage = localCoverImage || coverImage;

  return (
    <div
      className="relative w-full h-[300px] rounded-[8px] overflow-hidden bg-gray-200 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayImage ? (
        <Image
          src={displayImage}
          alt="Cover Image"
          fill
          className="object-cover transition-opacity duration-300"
          priority
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Upload size={32} className="mx-auto mb-2" />
            <p className="text-sm">No cover image</p>
          </div>
        </div>
      )}

      {/* Edit Overlay */}
      {isEditing && (
        <>
          <div
            className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-200 ${
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
                  <Loader2 size={32} className="animate-spin mb-2" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Edit3 size={32} className="mb-2" />
                  <span className="text-sm font-medium">
                    {displayImage ? "Change Cover" : "Upload Cover"}
                  </span>
                </>
              )}
            </label>
          </div>

          {/* Remove button (only if there's an image) */}
          {displayImage && (
            <button
              onClick={handleRemoveCover}
              className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all shadow-md"
              disabled={uploading}
            >
              <X size={16} className="text-gray-700" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default CoverImage;
