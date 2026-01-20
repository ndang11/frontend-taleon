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
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [status, setStatus] = useState<"draft" | "published" | "unpublished">(
    post?.status || "draft",
  );
  const queryClient = useQueryClient();
  const token = getToken();

  const mutation = useMutation({
    mutationFn: (data: CreatePostRequest | UpdatePostRequest) =>
      post
        ? updatePost(post.id, data as UpdatePostRequest, token || "")
        : createPost(data as CreatePostRequest, token || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["public-posts"] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ title, content, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-black">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "draft" | "published" | "unpublished")
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : post ? "Update" : "Create"} Post
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
