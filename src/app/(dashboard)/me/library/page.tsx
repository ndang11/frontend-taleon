"use client";

import { AlertCircle, Archive, FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth.provider";
import { StoryCard } from "@/core/components/molecule/dashboard/StoryCard";
import { fetcher, type Post } from "@/core/lib/api-client";

interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export default function LibraryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"drafts" | "archived">("drafts");
  const [draftsData, setDraftsData] = useState<PostsResponse | null>(null);
  const [archivedData, setArchivedData] = useState<PostsResponse | null>(null);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDrafts = useCallback(async () => {
    setIsLoadingDrafts(true);
    try {
      const data = await fetcher.get<PostsResponse>("/posts/user/drafts");
      setDraftsData(data);
    } catch (err) {
      console.error("Failed to load drafts:", err);
      setError("Failed to load drafts");
    } finally {
      setIsLoadingDrafts(false);
    }
  }, []);

  const loadArchived = useCallback(async () => {
    setIsLoadingArchived(true);
    try {
      const data = await fetcher.get<PostsResponse>("/posts/user/archived");
      setArchivedData(data);
    } catch (err) {
      console.error("Failed to load archived:", err);
      setError("Failed to load archived posts");
    } finally {
      setIsLoadingArchived(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDrafts();
    }
  }, [user, loadDrafts]);

  useEffect(() => {
    if (activeTab === "archived" && !archivedData) {
      loadArchived();
    }
  }, [activeTab, archivedData, loadArchived]);

  const handleViewDraft = useCallback(
    (post: Post) => {
      router.push(`/new-story?edit=${post._id}`);
    },
    [router],
  );

  const handleViewArchived = useCallback(
    (post: Post) => {
      router.push(`/story/${post.slug}`);
    },
    [router],
  );

  const currentData = activeTab === "drafts" ? draftsData : archivedData;
  const isLoading =
    activeTab === "drafts" ? isLoadingDrafts : isLoadingArchived;
  const emptyMessage =
    activeTab === "drafts" ? "No drafts yet" : "No archived posts yet";
  const emptySubtitle =
    activeTab === "drafts"
      ? "Start writing your first draft!"
      : "Archived posts will appear here";
  const emptyIcon =
    activeTab === "drafts" ? (
      <FileText className="w-8 h-8 text-gray-400" />
    ) : (
      <Archive className="w-8 h-8 text-gray-400" />
    );
  const ActionButton =
    activeTab === "drafts" ? (
      <Link
        href="/new-story"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Draft
      </Link>
    ) : null;

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Please log in
          </h3>
          <p className="text-gray-500 mb-6">
            You need to be logged in to view your library.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Library</h1>
          <p className="text-gray-500 mt-1">
            Manage your drafts and archived stories
          </p>
        </div>
        <Link
          href="/new-story"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Story
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("drafts")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === "drafts"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          Drafts
          {draftsData && draftsData.total > 0 && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {draftsData.total}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === "archived"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Archive className="w-4 h-4" />
          Archive
          {archivedData && archivedData.total > 0 && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {archivedData.total}
            </span>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 mb-8 max-w-xs">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">
            {activeTab === "drafts" ? "Total Drafts" : "Total Archived"}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {currentData?.total || 0}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
          <p className="text-gray-500 mb-6">Please try again later.</p>
          <button
            onClick={() =>
              activeTab === "drafts" ? loadDrafts() : loadArchived()
            }
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : currentData?.posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {emptyIcon}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500 mb-6">{emptySubtitle}</p>
          {ActionButton}
        </div>
      ) : (
        <div className="grid gap-4">
          {currentData?.posts.map((post) => (
            <StoryCard
              key={post._id}
              post={post}
              isOwner={false}
              onView={
                activeTab === "drafts" ? handleViewDraft : handleViewArchived
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
