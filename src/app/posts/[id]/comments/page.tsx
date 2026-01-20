"use client";

import { useParams } from "next/navigation";

export default function PostCommentsPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Comments for Post {id}</h1>
      <p>Comments feature is coming soon.</p>
    </div>
  );
}
