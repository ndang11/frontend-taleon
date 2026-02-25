"use client";

import { Edit, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { deletePost } from "@/core/lib/api-client";
import { useMyPosts } from "@/hook/useStories";

// Types for Tiptap/ProseMirror JSON content
interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
  attrs?: Record<string, unknown>;
}

interface TiptapContent {
  type?: string;
  content?: TiptapNode[];
  time?: number;
  version?: string;
}

// Recursively extract text from Tiptap/ProseMirror JSON nodes
function extractTextFromTiptap(node: TiptapNode | undefined): string {
  if (!node) return "";

  // If node has text content, return it
  if (node.text) return node.text;

  // If node has nested content, recursively extract text from all children
  if (node.content && Array.isArray(node.content)) {
    return node.content
      .map((child) => extractTextFromTiptap(child))
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

// Helper function to extract text from content (handles both string and Tiptap/ProseMirror JSON)
function getPostExcerpt(
  content: string | TiptapContent | null | undefined,
): string {
  if (!content) return "No content...";

  // If content is a plain HTML string, strip all HTML tags
  if (typeof content === "string") {
    const stripped = content
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();

    if (!stripped) return "No content...";
    return `${stripped.slice(0, 100)}...`;
  }

  // If content is a Tiptap/ProseMirror JSON object
  if (typeof content === "object" && content !== null) {
    // Handle Tiptap JSON format: { type: "doc", content: [...] }
    if (Array.isArray(content.content)) {
      const text = content.content
        .map((node: TiptapNode) => extractTextFromTiptap(node))
        .filter(Boolean)
        .join(" ");

      if (text) return `${text.slice(0, 100)}...`;
    }

    // Handle simple blocks format: { blocks: [...] }
    if (Array.isArray((content as Record<string, unknown>).blocks)) {
      const blocks = (content as Record<string, TiptapNode[]>).blocks;
      const text = blocks
        .map((block: TiptapNode) => extractTextFromTiptap(block))
        .filter(Boolean)
        .join(" ");

      if (text) return `${text.slice(0, 100)}...`;
    }
  }

  return "No content...";
}

// Story Item Component with dropdown menu
function StoryItem({
  post,
  onEdit,
  onDelete,
  isDeleting,
}: {
  post: any;
  onEdit: (post: any) => void;
  onDelete: (postId: string) => void;
  isDeleting: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === "published") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Draft
      </span>
    );
  };

  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <Link href={`/post/${post._id}/edit`} className="block group">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:underline decoration-gray-900 decoration-2 underline-offset-4">
              {post.title || "Untitled Story"}
            </h3>
            <p className="text-gray-500 text-sm mb-2 line-clamp-1">
              {getPostExcerpt(post.content)}
            </p>
          </Link>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <span>
              Last edited{" "}
              {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
            </span>
            {getStatusBadge(post.status)}
          </div>
        </div>
        <div className="flex items-center gap-2" ref={menuRef}>
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Story options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit(post);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  aria-label="Edit story"
                >
                  <Edit className="w-4 h-4 text-green-600" />
                  <span>Edit story</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(post._id);
                    setShowMenu(false);
                  }}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label="Delete story"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const [activeTab, setActiveTab] = useState<"drafts" | "published">("drafts");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  // Use React Query for automatic refetching and cache invalidation
  const { data, isLoading, error, refetch } = useMyPosts();
  const posts = data?.posts || [];

  // Log for debugging
  console.log(
    "[StoriesPage] Posts loaded:",
    posts.map((p: any) => ({ id: p._id, title: p.title, status: p.status })),
  );

  const handleEdit = useCallback(
    (post: any) => {
      // Navigate to the edit page for this post
      router.push(`/post/${post._id}/edit`);
    },
    [router],
  );

  const handleDelete = async (postId: string) => {
    if (confirm("Are you sure you want to delete this story?")) {
      setDeletingId(postId);
      try {
        await deletePost(postId);
        // Refetch to update the list
        refetch();
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("Failed to delete post. Please try again.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Filter posts based on status
  const filteredPosts = posts.filter((post: any) => {
    if (activeTab === "published")
      return post.status === "published" || post.status === "public";
    return (
      post.status === "draft" || !post.status || post.status !== "published"
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-serif text-gray-900">
          Your stories
        </h1>
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
          onClick={() => setActiveTab("drafts")}
          className={`pb-4 text-sm font-medium transition-colors ${
            activeTab === "drafts"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Drafts{" "}
          <span className="text-gray-400">
            {posts.filter((p: any) => p.status !== "published").length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("published")}
          className={`pb-4 text-sm font-medium transition-colors ${
            activeTab === "published"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Published{" "}
          <span className="text-gray-400">
            {posts.filter((p: any) => p.status === "published").length}
          </span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="mt-3 text-sm text-gray-500">Loading your stories...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post: any) => (
              <StoryItem
                key={post._id}
                post={post}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deletingId === post._id}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500 mb-4">
                You have no {activeTab} stories.
              </p>
              <Link
                href="/new-story"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                <Edit className="w-4 h-4" />
                Write your first story
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
