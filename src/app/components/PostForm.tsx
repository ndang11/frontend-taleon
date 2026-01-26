"use client";

import { useEffect, useState } from "react";
import { useCreatePost, useUpdatePost } from "../features/posts/hooks";
import { generateSlug } from "../lib/api-client";
import type { Post } from "../types/post";
import { ImageUpload } from "./ImageUpload";

interface PostFormProps {
  post?: Post;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PostForm({ post, onSuccess, onCancel }: PostFormProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [status, setStatus] = useState<"draft" | "published" | "unpublished">(
    post?.status ?? "draft",
  );
  const [category, setCategory] = useState(post?.category ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!post?.slug);

  useEffect(() => {
    if (autoGenerateSlug && title.trim()) {
      setSlug(generateSlug(title.trim()));
    }
  }, [title, autoGenerateSlug]);
  const [imageUrl, setImageUrl] = useState(post?.image ?? "");
  const [imageId, setImageId] = useState(post?.imageId ?? "");
  const [isPublic, setIsPublic] = useState(post?.isPublic ?? false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUploaded = (data: { url: string; fileId: string }) => {
    setImageUrl(data.url);
    setImageId(data.fileId);
  };

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim() || !category.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    let finalSlug = slug.trim();
    if (!finalSlug) {
      finalSlug = generateSlug(title.trim());
    }

    const postData = {
      title: title.trim(),
      content: content.trim(),
      status,
      category: category.trim(),
      slug: finalSlug,
      image: imageUrl || undefined,
      imageId: imageId || undefined,
      isPublic,
    };

    if (post) {
      updatePost.mutate(
        { id: post.id, data: postData },
        {
          onSuccess: () => {
            onSuccess?.();
          },
          onError: (err) => {
            setError(err.message || "Failed to update post");
          },
        },
      );
    } else {
      createPost.mutate(postData, {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (err) => {
          setError(err.message || "Failed to create post");
        },
      });
    }
  };

  const isLoading = createPost.isPending || updatePost.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Slug *
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setAutoGenerateSlug(false);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Category *
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "draft" | "published" | "unpublished")
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="image-upload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Image
        </label>
        <ImageUpload
          onImageUploaded={handleImageUploaded}
          currentImage={imageUrl}
          onRemove={() => setImageUrl("")}
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Content *
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Make this post public</span>
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : post ? "Update Post" : "Create Post"}
        </button>
      </div>
    </form>
  );
}
