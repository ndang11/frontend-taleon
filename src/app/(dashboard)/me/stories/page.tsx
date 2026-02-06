"use client";

import { useEffect, useState } from "react";
import { getMyPosts, deletePost } from "@/core/lib/api-client";
import Link from "next/link";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StoriesPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');
  const router = useRouter();

  useEffect(() => {
    loadMyPosts();
  }, []);

  const loadMyPosts = async () => {
    try {
      const data = await getMyPosts();
      // The API returns { posts: [...], total: ... }
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to load stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm("Are you sure you want to delete this story?")) {
      try {
        await deletePost(postId);
        setPosts(posts.filter(p => p._id !== postId));
      } catch (error) {
        alert("Failed to delete post");
      }
    }
  };

  // Filter posts based on status (assuming status field exists in post object from API)
  // If status is not available, we might need to infer from the API response structure
  const filteredPosts = posts.filter((post: any) => {
    if (activeTab === 'published') return post.status === 'published' || post.status === 'public';
    return post.status === 'draft' || !post.status || post.status !== 'published';
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif text-gray-900">Your stories</h1>
        <div className="flex gap-3">
          <Link 
            href="/new-story" 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Write a story
          </Link>
          <button className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium hover:border-gray-900 transition-colors">
            Import a story
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('drafts')}
          className={`pb-4 text-sm font-medium transition-colors ${
            activeTab === 'drafts' 
              ? "text-gray-900 border-b-2 border-gray-900" 
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Drafts {posts.filter((p: any) => p.status !== 'published').length}
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={`pb-4 text-sm font-medium transition-colors ${
            activeTab === 'published' 
              ? "text-gray-900 border-b-2 border-gray-900" 
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Published {posts.filter((p: any) => p.status === 'published').length}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post: any) => (
              <div key={post._id} className="py-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                     <Link href={`/new-story?edit=${post._id}`} className="block group">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:underline decoration-gray-900 decoration-2 underline-offset-4">
                        {post.title || "Untitled Story"}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2 line-clamp-1">
                        {post.content?.replace(/<[^>]*>?/gm, "")?.slice(0, 100) || "No content..."}
                      </p>
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>Last edited {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}</span>
                      {post.status !== 'published' && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Draft</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/new-story?edit=${post._id}`} className="text-gray-400 hover:text-gray-900">
                      <MoreHorizontal className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(post._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">
              You have no {activeTab} stories.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
