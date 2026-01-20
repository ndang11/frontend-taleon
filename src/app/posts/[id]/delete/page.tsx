"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { deletePost, fetchPost } from "../../../lib/api-client";
import { getToken } from "../../../lib/auth";

export default function DeletePostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const token = getToken();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id, token || ""),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(id, token || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/dashboard"); // or wherever
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Delete Post</h1>
      <p>Are you sure you want to delete the post "{post.title}"?</p>
      <div className="mt-4 space-x-2">
        <button
          type="button"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
