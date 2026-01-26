"use client";

import { PostCard } from "../components/PostCard";
import { usePosts } from "../features/posts/hooks";

export default function ArticlesPage() {
  const { data: posts, isLoading, error } = usePosts(true); // Get public posts

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Latest Articles</h1>
        <div className="text-center py-12">Loading articles...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Latest Articles</h1>
        <div className="text-center py-12 text-red-600">
          Failed to load articles. Please try again later.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Latest Articles</h1>

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No articles found.
        </div>
      )}
    </main>
  );
}
