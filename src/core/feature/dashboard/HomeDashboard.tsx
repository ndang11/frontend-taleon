"use client";

import {
  Archive,
  BarChart2,
  BookOpen,
  Clock,
  FileText,
  Plus,
  SquarePen,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/auth.provider";
import { StoryCard } from "@/core/components/molecule/dashboard/StoryCard";
import { useMyPosts, useTenantPublishedPosts } from "@/hook/useStories";

export default function HomeDashboard() {
  const { user } = useAuth();
  const { data: postsData, isLoading, error } = useMyPosts(1, 10);
  const { data: publishedPostsData } = useTenantPublishedPosts(1, 10);
  const [activeTab, setActiveTab] = useState<
    "recent" | "drafts" | "published" | "archived"
  >("published");

  const posts = postsData?.posts || [];
  const drafts = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");
  const archived = posts.filter((p) => p.status === "archived");
  const allPublishedPosts = publishedPostsData?.posts || [];

  const stats = {
    total: posts.length,
    drafts: drafts.length,
    published: published.length,
    archived: archived.length,
    totalViews: 0,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-500">
            Please log in to access your dashboard.
          </p>
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
            value={allPublishedPosts.length}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <h2 className="text-lg font-semibold text-gray-900">Your Stories</h2>
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
              Published ({allPublishedPosts.length})
            </TabButton>
            <TabButton
              active={activeTab === "archived"}
              onClick={() => setActiveTab("archived")}
            >
              Archived ({archived.length})
            </TabButton>
          </div>
        </div>

        {isLoading ? (
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
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {(activeTab === "recent"
              ? posts
              : activeTab === "drafts"
                ? drafts
                : activeTab === "published"
                  ? allPublishedPosts
                  : archived
            ).map((post) => (
              <StoryCard key={post._id} post={post} isOwner={false} />
            ))}
          </div>
        )}
      </div>
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
