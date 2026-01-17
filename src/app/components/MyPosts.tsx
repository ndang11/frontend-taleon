"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  deletePost,
  fetchPosts,
  type Post,
  type PostsResponse,
  updatePostStatus,
} from "../lib/api-client";
import { getToken } from "../lib/auth";
import { PostForm } from "./PostForm";

const POSTS_PER_PAGE = 10;

export function MyPosts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const queryClient = useQueryClient();
  const token = getToken();

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", currentPage, statusFilter],
    queryFn: () =>
      fetchPosts(
        { page: currentPage, limit: POSTS_PER_PAGE, status: statusFilter },
        token || "",
      ),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deletePost(postId, token || ""),
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["posts", currentPage, statusFilter],
      });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData([
        "posts",
        currentPage,
        statusFilter,
      ]);

      // Optimistically update to remove the post
      queryClient.setQueryData(
        ["posts", currentPage, statusFilter],
        (old: PostsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.filter((post: Post) => post.id !== postId),
            total: old.total - 1,
          };
        },
      );

      return { previousPosts };
    },
    onError: (_err, _postId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPosts) {
        queryClient.setQueryData(
          ["posts", currentPage, statusFilter],
          context.previousPosts,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      postId,
      status,
    }: {
      postId: string;
      status: "published" | "unpublished";
    }) => updatePostStatus(postId, status, token || ""),
    onMutate: async ({ postId, status }) => {
      await queryClient.cancelQueries({
        queryKey: ["posts", currentPage, statusFilter],
      });

      const previousPosts = queryClient.getQueryData([
        "posts",
        currentPage,
        statusFilter,
      ]);

      queryClient.setQueryData(
        ["posts", currentPage, statusFilter],
        (old: PostsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.map((post: Post) =>
              post.id === postId ? { ...post, status } : post,
            ),
          };
        },
      );

      return { previousPosts };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(
          ["posts", currentPage, statusFilter],
          context.previousPosts,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleDelete = (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(postId);
    }
  };

  const handleToggleStatus = (post: Post) => {
    const newStatus = post.status === "published" ? "unpublished" : "published";
    updateStatusMutation.mutate({ postId: post.id, status: newStatus });
  };

  const totalPages = data ? Math.ceil(data.total / POSTS_PER_PAGE) : 0;

  if (isLoading)
    return <div className="text-center py-8">Loading posts...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-600">Error loading posts</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Posts</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Post</span>
          </button>
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("draft");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md ${
                statusFilter === "draft"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Drafts
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("published");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md ${
                statusFilter === "published"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Published
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
          <PostForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingPost && (
        <div className="p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Edit Post</h2>
          <PostForm
            post={editingPost}
            onSuccess={() => setEditingPost(null)}
            onCancel={() => setEditingPost(null)}
          />
        </div>
      )}

      {data?.posts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No posts found</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {data?.posts.map((post) => (
              <li key={post.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          post.status === "published"
                            ? "text-green-600"
                            : post.status === "unpublished"
                              ? "text-yellow-600"
                              : "text-gray-600"
                        }`}
                      >
                        {post.status}
                      </span>
                      {" • "}
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {post.status === "draft" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingPost(post)}
                          className="p-2 text-blue-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          href={`/blog/myblog/${post.slug}`} // TODO: get actual tenantSlug
                          className="p-2 text-blue-400 hover:text-blue-600"
                          title="View Public Link"
                        >
                          <Eye className="h-5 w-5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(post)}
                          disabled={updateStatusMutation.isPending}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Move to Drafts"
                        >
                          <EyeOff className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-2 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
