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
import Link from "next/link";
import { useState } from "react";
import {
  deletePost,
  fetchPosts,
  type Post,
  type PostsResponse,
  updatePostStatus,
} from "../lib/api-client";
import { getToken } from "../lib/auth";

const POSTS_PER_PAGE = 10;

export function MyPosts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
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
          <Link
            href="/editor"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Create Post</span>
          </Link>
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("draft");
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                statusFilter === "draft"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                statusFilter === "published"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Published
            </button>
          </div>
        </div>
      </div>

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
                        <Link
                          href={`/editor/${post.id}`}
                          className="p-2 text-blue-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
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
            className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 disabled:opacity-50 transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-2 text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 disabled:opacity-50 transition-all duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
