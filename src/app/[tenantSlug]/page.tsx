"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { use, useState } from "react";
import { ErrorMessage, LoadingSpinner } from "@/components/ui/ErrorMessage";
import { PostForm } from "../components/PostForm";
import {
  deletePost,
  fetchPosts,
  fetchPublicPosts,
  type Post,
  type PublicPost,
  updatePostStatus,
} from "../lib/api-client";
import { getToken } from "../lib/auth";

interface TenantPageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default function TenantPage({ params }: TenantPageProps) {
  const { tenantSlug } = use(params);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const queryClient = useQueryClient();
  const token = getToken();

  const {
    data: publicData,
    isLoading: publicLoading,
    error: publicError,
  } = useQuery({
    queryKey: ["public-posts", tenantSlug],
    queryFn: () => fetchPublicPosts({ tenantSlug }),
  });

  const {
    data: myData,
    isLoading: myLoading,
    error: myError,
  } = useQuery({
    queryKey: ["posts", token ? "my" : null],
    queryFn: () => fetchPosts({}, token || ""),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => deletePost(postId, token || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["public-posts"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["public-posts"] });
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

  if (publicLoading || myLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner message="Loading posts..." />
      </div>
    );
  }

  if (publicError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          title="Failed to load posts"
          message="We couldn't load the posts for this tenant. Please check your connection and try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (myError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          title="Failed to load your posts"
          message="We couldn't load your personal posts. You can still view public posts, but you won't be able to manage your content."
          variant="warning"
        />
      </div>
    );
  }

  const posts = publicData?.posts || [];
  const myPosts = myData?.posts || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Posts for {tenantSlug}</h1>

      {token && (
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Post</span>
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
          <PostForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingPost && (
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Edit Post</h2>
          <PostForm
            post={editingPost}
            onSuccess={() => setEditingPost(null)}
            onCancel={() => setEditingPost(null)}
          />
        </div>
      )}

      <div className="grid gap-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-6">
              {token
                ? "Be the first to create a post for this tenant!"
                : "There are no published posts to display."}
            </p>
            {token && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Create Your First Post
              </button>
            )}
          </div>
        ) : (
          posts.map((post: PublicPost) => {
            const myPost = myPosts.find((p) => p.id === post.id);
            return (
              <article
                key={post.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <h2 className="text-2xl font-semibold mb-2 text-gray-900">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {post.excerpt || post.content.slice(0, 200)}...
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  By {post.authorName} on{" "}
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                {myPost && token && (
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setEditingPost(myPost)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(myPost)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                      title={
                        myPost.status === "published" ? "Unpublish" : "Publish"
                      }
                    >
                      {myPost.status === "published" ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(myPost.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
