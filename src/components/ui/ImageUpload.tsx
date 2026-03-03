"use client";

import { AlertCircle, Image as ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { uploadPostImage } from "@/core/lib/api-client";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
  maxSize?: number; // in bytes, default 10MB
  acceptedTypes?: string[];
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.";
      }
      if (file.size > maxSize) {
        return `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`;
      }
      return null;
    },
    [acceptedTypes, maxSize],
  );

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const result = await uploadPostImage(file);
      onChange(result.url);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = () => {
    onRemove();
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (value) {
    return (
      <div className="relative group">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 border">
          <Image
            src={value}
            alt="Post cover"
            className="w-full h-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled || isUploading}
          className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Remove image
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              JPEG, PNG, GIF, or WebP up to {Math.round(maxSize / 1024 / 1024)}
              MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
