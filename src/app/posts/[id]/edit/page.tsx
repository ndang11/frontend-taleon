"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PostForm } from "../../../components/PostForm";
import { fetchPost } from "../../../lib/api-client";
import { getToken } from "../../../lib/auth";

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const token = getToken();

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id, token || ""),
    enabled: !!token,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading post</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <PostForm post={post} />
    </div>
  );
}
