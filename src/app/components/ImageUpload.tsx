"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useUploadImage } from "../features/posts/hooks";

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onRemove?: () => void;
}

export function ImageUpload({
  onImageUploaded,
  currentImage,
  onRemove,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadImage();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert("File size must be less than 5MB");
      return;
    }

    uploadImage.mutate(file, {
      onSuccess: (response) => {
        onImageUploaded(response.url);
      },
      onError: (error) => {
        console.error("Upload failed:", error);
        alert("Failed to upload image");
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="relative">
          <Image
            src={currentImage}
            alt="Uploaded"
            width={400}
            height={200}
            className="w-full h-48 object-cover rounded-lg"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          id="image-upload"
          type="button"
          aria-label="Upload image area"
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors bg-transparent border-gray-300 hover:border-gray-400 ${
            dragActive ? "border-blue-500 bg-blue-50" : ""
          }`}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onClick={onButtonClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onButtonClick();
            }
          }}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {uploadImage.isPending ? "Uploading..." : "Upload an image"}
          </p>
          <p className="text-sm text-gray-500">
            Drag and drop or click to select an image (max 5MB)
          </p>
          <input
            id="image-upload"
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </button>
      )}

      {uploadImage.isError && (
        <p className="text-red-600 text-sm">
          Failed to upload image. Please try again.
        </p>
      )}
    </div>
  );
}
