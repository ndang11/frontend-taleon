"use client";

import {
  Archive,
  BarChart2,
  BookOpen,
  FileText,
  Plus,
  SquarePen,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { useAuth } from "@/context/auth.provider";
import { StoryCard } from "@/core/components/molecule/dashboard/StoryCard";
import { deletePost } from "@/core/lib/api-client";
import { useMyPosts, useTenantPublishedPosts } from "@/hook/useStories";

export default function HomeDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Local state for posts to allow optimistic updates
  const [localPosts, setLocalPosts] = useState<any[]>([]);

  // All hooks must be called unconditionally at the top level
  const { data: postsData, isLoading, error, refetch } = useMyPosts(1, 50);
  const {
    data: publishedPostsData,
    isLoading: publishedLoading,
    refetch: refetchPublished,
  } = useTenantPublishedPosts(1, 50);
  const isLoadingAny = isLoading || publishedLoading;
  const [activeTab, setActiveTab] = useState<
    "recent" | "drafts" | "published" | "archived"
  >("recent");

  // Update local posts when data changes
  useEffect(() => {
    if (postsData?.posts) {
      setLocalPosts(postsData.posts);
    }
  }, [postsData]);

  // Set mounted state after component mounts
  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
    setMounted(true);
  }, []);

  // Show loading spinner until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const posts = localPosts.length > 0 ? localPosts : postsData?.posts || [];
  const drafts = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");
  const archived = posts.filter((p) => p.status === "archived");
  const allTenantPublishedPosts = publishedPostsData?.posts || [];
  const userPublishedPosts =
    publishedPostsData?.posts?.filter((p: any) =>
      typeof p.authorId === "object"
        ? p.authorId._id === user?._id
        : p.authorId === user?._id,
    ) || [];

  // Check if current user owns a post
  const isPostOwner = (post: any) => {
    return posts.some((p) => p._id === post._id);
  };

  // Calculate total views from all user's posts (published + drafts)
  const totalViews = posts.reduce((sum: number, post: any) => {
    return sum + (post.viewCount || 0);
  }, 0);

  const stats = {
    total: posts.length,
    drafts: drafts.length,
    published: published.length,
    archived: archived.length,
    totalViews: totalViews,
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deletePost(postToDelete._id);

      // Update local state to remove the deleted post
      setLocalPosts((prev) => prev.filter((p) => p._id !== postToDelete._id));

      setShowDeleteDialog(false);
      setPostToDelete(null);

      // Refetch data to ensure consistency
      refetch();
      refetchPublished();
    } catch (error: any) {
      setDeleteError(error.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (post: any) => {
    setPostToDelete(post);
    setShowDeleteDialog(true);
    setDeleteError("");
  };

  // Handle edit post - redirect to edit page
  const handleEditPost = (post: any) => {
    router.push(`/post/${post._id}/edit`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-500 mb-4">
            Please log in to access your dashboard.
          </p>
          <Link
            href="/login"
            className="inline-block bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b max-w-7xl mt-4 border-gray-200 pb-6 mb-8">
        <div className="flex items-center w-full justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.name?.split(" ")[0] || "Writer"}
            </h1>
            <p className="text-gray-500">
              Here's what's happening with your stories today.
            </p>
          </div>
          <Link
            href="/new-story"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            <SquarePen className="w-4 h-4" />
            Write a story
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="Total Stories"
            value={stats.total}
            color="bg-gray-100 text-gray-600"
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5" />}
            label="Drafts"
            value={stats.drafts}
            color="bg-yellow-50 text-yellow-600"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Published"
            value={allTenantPublishedPosts.length}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            icon={<Archive className="w-5 h-5" />}
            label="Archived"
            value={stats.archived}
            color="bg-red-50 text-red-600"
          />
          <StatCard
            icon={<BarChart2 className="w-5 h-5" />}
            label="Total Views"
            value={stats.totalViews}
            color="bg-blue-50 text-blue-600"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-col gap-4">
          <QuickActionCard
            href="/new-story"
            icon={<Plus className="w-5 h-5" />}
            title="New Story"
            description="Start writing a new story"
          />
          <QuickActionCard
            href="/me/my-stories"
            icon={<BookOpen className="w-5 h-5" />}
            title="My Stories"
            description="View all your stories"
          />
          <QuickActionCard
            href="/me/stats"
            icon={<BarChart2 className="w-5 h-5" />}
            title="Analytics"
            description="See your performance"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Most Recent Stories
          </h2>
          <div className="flex gap-2">
            <TabButton
              active={activeTab === "recent"}
              onClick={() => setActiveTab("recent")}
            >
              Recent
            </TabButton>
            <TabButton
              active={activeTab === "drafts"}
              onClick={() => setActiveTab("drafts")}
            >
              Drafts ({drafts.length})
            </TabButton>
            <TabButton
              active={activeTab === "published"}
              onClick={() => setActiveTab("published")}
            >
              Published ({allTenantPublishedPosts.length})
            </TabButton>
            <TabButton
              active={activeTab === "archived"}
              onClick={() => setActiveTab("archived")}
            >
              Archived ({archived.length})
            </TabButton>
          </div>
        </div>

        {isLoadingAny ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Failed to load stories</p>
          </div>
        ) : posts.length === 0 && allTenantPublishedPosts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {(activeTab === "recent"
              ? allTenantPublishedPosts.sort(
                  (a: any, b: any) =>
                    new Date(
                      b.updatedAt || b.publishedAt || b.createdAt,
                    ).getTime() -
                    new Date(
                      a.updatedAt || a.publishedAt || a.createdAt,
                    ).getTime(),
                )
              : activeTab === "drafts"
                ? drafts
                : activeTab === "published"
                  ? userPublishedPosts
                  : archived
            ).map((post: any) => (
              <StoryCard
                key={post._id}
                post={post}
                isOwner={isPostOwner(post)}
                onEdit={isPostOwner(post) ? handleEditPost : undefined}
                onDelete={isPostOwner(post) ? openDeleteDialog : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Warning icon"
                >
                  <title>Warning</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Delete Story
              </h2>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete "{postToDelete?.title}"?
                <br />
                <span className="text-sm">This action cannot be undone.</span>
              </p>
              {deleteError && (
                <p className="text-sm text-red-600 mb-4">
                  Error: {deleteError}
                </p>
              )}
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-full font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200 hover:border-gray-300"
    >
      <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700">
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-black text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No stories yet</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Start your writing journey by creating your first story.
      </p>
      <Link
        href="/new-story"
        className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-colors"
      >
        <SquarePen className="w-4 h-4" />
        Write your first story
      </Link>
    </div>
  );
}
