"use client";

import {
  BookOpen,
  Clock,
  Edit3,
  Image as ImageIcon,
  MoreVertical,
  Send,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SuccessDialog } from "@/components/ui/SuccessDialog";
import { useAuth } from "@/context/auth.provider";
import {
  deletePost,
  fetchMyPosts,
  type Post,
  type PostContent,
  updatePostStatus,
} from "@/core/lib/api-client";
import { getToken } from "@/core/lib/auth";

function extractTextFromContent(
  content: PostContent | string | undefined,
): string {
  if (!content) return "";

  // If content is already a string, return it directly
  if (typeof content === "string") {
    return content.replace(/<[^>]*>/g, "");
  }

  // Handle PostContent object with blocks
  if (typeof content === "object" && "blocks" in content) {
    const blocks = content.blocks || [];
    return blocks
      .map((block: { data?: Record<string, unknown> }) => {
        // Different block types store text in different data properties
        const data = block.data || {};
        return (
          (data.text as string) ||
          (data.title as string) ||
          (data.items as string[])?.join(" ") ||
          ""
        );
      })
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

type TabType = "drafts" | "published";

export default function LibraryPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("drafts");
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showUnpublishSuccess, setShowUnpublishSuccess] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      const data = await fetchMyPosts(token);
      setPosts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handlePublish = async (postId: string) => {
    try {
      setProcessingId(postId);
      await updatePostStatus(postId, "published", "");
      await loadPosts();
      setSuccessMessage("Your story has been published successfully!");
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to publish story");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setSuccessMessage("");
  };

  const handleUnpublish = async (postId: string) => {
    try {
      setProcessingId(postId);
      await updatePostStatus(postId, "unpublished", "");
      await loadPosts();
      setShowUnpublishSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to unpublish story");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      setProcessingId(postId);
      await deletePost(postId);
      await loadPosts();
    } catch (err: any) {
      setError(err.message || "Failed to delete story");
    } finally {
      setProcessingId(null);
    }
  };

  const drafts = posts.filter((post) => post.status === "draft");
  const published = posts.filter((post) => post.status === "published");
  const unpublished = posts.filter((post) => post.status === "unpublished");

  const displayedPosts =
    activeTab === "drafts" ? drafts : [...published, ...unpublished];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library</h1>
          <p className="text-gray-500 mt-1">Manage your stories and drafts</p>
        </div>
        <Link
          href="/new-story"
          className="inline-flex items-center gap-2 px-6 py-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          New Story
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("drafts")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "drafts"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Drafts ({drafts.length})
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "published"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Published ({published.length})
          </button>
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === "drafts" ? "No drafts yet" : "No published stories"}
          </h3>
          <p className="text-gray-500 mb-6">
            {activeTab === "drafts"
              ? "Start writing your first story to see it here."
              : "Publish your drafts to share them with the world."}
          </p>
          {activeTab === "drafts" && (
            <Link
              href="/new-story"
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Write a Story
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedPosts.map((post) => (
            <div
              key={post._id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex gap-4">
                {/* Thumbnail Image */}
                <Link
                  href={`/new-story?edit=${post._id}`}
                  className="flex-shrink-0"
                >
                  {post.image ? (
                    <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={post.image}
                        alt={post.title || "Post cover"}
                        className="w-full h-full object-cover"
                        width={128}
                        height={96}
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.status === "published"
                          ? "bg-green-100 text-green-800"
                          : post.status === "unpublished"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {post.status.charAt(0).toUpperCase() +
                        post.status.slice(1)}
                    </span>
                    {post.category && (
                      <span className="text-xs text-gray-500">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <Link href={`/new-story?edit=${post._id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {extractTextFromContent(post.content).slice(0, 150) ||
                      "No content yet..."}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span className="text-blue-600 font-medium">
                        {typeof post.authorId === "object" && post.authorId
                          ? (post.authorId as any).name || "You"
                          : "You"}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(post.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {post.status === "draft" && (
                    <button
                      onClick={() => handlePublish(post._id)}
                      disabled={processingId === post._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publish
                    </button>
                  )}
                  {post.status === "published" && (
                    <button
                      onClick={() => handleUnpublish(post._id)}
                      disabled={processingId === post._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                    >
                      Unpublish
                    </button>
                  )}
                  <Link
                    href={`/new-story?edit=${post._id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post._id)}
                    disabled={processingId === post._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SuccessDialog
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="Published!"
        message={successMessage}
        buttonText="Continue"
        onButtonClick={handleSuccessClose}
      />
      <SuccessDialog
        isOpen={showUnpublishSuccess}
        onClose={() => setShowUnpublishSuccess(false)}
        title="Unpublished"
        message="Your story has been moved to drafts."
        buttonText="Continue"
        onButtonClick={() => setShowUnpublishSuccess(false)}
      />
    </div>
  );
}
