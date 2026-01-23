"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  type CreatePostRequest,
  createPost,
  type Post,
  type UpdatePostRequest,
  updatePost,
} from "../lib/api-client";
import { getToken } from "../lib/auth";

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
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const token = getToken();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!token) throw new Error("You must be logged in");

      if (post) {
        const postData: UpdatePostRequest = {
          title: formData.get("title") as string,
          content: formData.get("content") as string,
          status: formData.get("status") as
            | "draft"
            | "published"
            | "unpublished",
          category: formData.get("category") as string,
        };
        return updatePost(post.id, postData, token);
      }

      const postData: CreatePostRequest = {
        title,
        content,
        status,
        category,
        image: image ? image.name : undefined,
      };
      return createPost(postData, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["public-posts"] });
      onSuccess?.();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to create post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !content || !category) {
      setError("All fields are required");
      return;
    }

    if (!image && !post) {
      setError("Image is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("status", status);
    formData.append("category", category);

    if (image) {
      formData.append("image", image); // 👈 MUST be "image"
    }

    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border p-2"
        required
      />

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="w-full rounded border p-2"
        required
      />

      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value as "draft" | "published" | "unpublished")
        }
        className="w-full rounded border p-2"
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="unpublished">Unpublished</option>
      </select>

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded border p-2"
        required
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
          }
        }}
      />

      {imagePreview && (
        <img
          src={imagePreview}
          alt="Preview"
          className="h-32 rounded object-cover"
        />
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {mutation.isPending
          ? "Saving..."
          : post
            ? "Update Post"
            : "Create Post"}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      )}
    </form>
  );
}
