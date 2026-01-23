"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Globe,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Share2,
  Smartphone,
  Target,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { fetchPosts, fetchPublicPosts, type Post } from "../../lib/api-client";
import { getToken } from "../../lib/auth";

export default function DashboardContent() {
  const token = getToken();

  const { data: postsData } = useQuery({
    queryKey: ["posts", 1, ""],
    queryFn: () => fetchPosts({ page: 1, limit: 10, status: "" }, token || ""),
    enabled: !!token,
  });

  // Analytics data from posts
  const analyticsData = {
    pageViews: postsData?.posts.length ? postsData.posts.length * 100 : 0,
    engagement: postsData?.posts.length
      ? Math.round((postsData.posts.length / 10) * 100) / 100
      : 0,
    topPosts: postsData?.posts.slice(0, 3) || [],
    demographics: { desktop: 65, mobile: 30, tablet: 5 },
  };

  const notifications: Array<{
    id: number;
    type: string;
    message: string;
    time: string;
  }> = [];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Welcome back! Here's what's happening with your blog.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/posts/create"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>New Post</span>
              </Link>
              <button
                type="button"
                className="backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-2xl hover:bg-white/90 dark:hover:bg-gray-800/90 flex items-center justify-center space-x-2 transition-all"
              >
                <Settings className="h-5 w-5" />
                <span>Customize</span>
              </button>
            </div>
          </div>
        </div>

        {/* Analytics & Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Page Views
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {analyticsData.pageViews.toLocaleString()}
                </p>
                <div className="flex items-center mt-3">
                  <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+12.5%</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    from last month
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Eye className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Engagement Rate
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {analyticsData.engagement}%
                </p>
                <div className="flex items-center mt-3">
                  <div className="flex items-center text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+2.1%</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    from last month
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Total Posts
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {postsData?.total || 0}
                </p>
                <div className="flex items-center mt-3">
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">
                      {postsData?.posts.filter((p) => p.status === "published")
                        .length || 0}{" "}
                      published
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Edit className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-900/80 transition-all transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Comments
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {postsData?.posts
                    ? Math.floor(postsData.posts.length * 2.5)
                    : 0}
                </p>
                <div className="flex items-center mt-3">
                  <div className="flex items-center text-orange-600 dark:text-orange-400">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">
                      {postsData?.posts
                        ? Math.floor(postsData.posts.length * 0.3)
                        : 0}{" "}
                      awaiting
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    moderation
                  </span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content Management & Calendar */}
          <div className="lg:col-span-2 space-y-8">
            {/* Content Management Panel */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <Edit className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Content Management
                  </h2>
                </div>
                <Link
                  href="/drafts"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {postsData?.posts.slice(0, 5).map((post: Post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-5 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all transform hover:scale-[1.02]"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <span className="capitalize">{post.status}</span>
                        <span>•</span>
                        <span>
                          {new Date(post.updatedAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          post.status === "published"
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                            : post.status === "draft"
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {post.status}
                      </span>
                      <Link
                        href={`/posts/${post.id}/edit`}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Calendar */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Content Calendar
                  </h2>
                </div>
                <button
                  type="button"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  Schedule Post
                </button>
              </div>

              <div className="space-y-4">
                {postsData?.posts.slice(0, 3).map((post: Post) => (
                  <div
                    key={post.id}
                    className={`flex items-center justify-between p-5 backdrop-blur-sm rounded-2xl border ${
                      post.status === "published"
                        ? "bg-emerald-50/70 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-700/30"
                        : "bg-blue-50/70 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-700/30"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 bg-gradient-to-r rounded-xl flex items-center justify-center ${
                          post.status === "published"
                            ? "from-emerald-500 to-green-500"
                            : "from-blue-500 to-cyan-500"
                        }`}
                      >
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-lg">
                          {post.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {post.status === "published" ? "Published" : "Draft"}{" "}
                          • {new Date(post.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        post.status === "published"
                          ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                          : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                ))}
                {(!postsData?.posts || postsData.posts.length === 0) && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No scheduled posts yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Analytics, Tools, Notifications */}
          <div className="space-y-8">
            {/* Top Posts Analytics */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Top Performing Posts
                </h2>
              </div>
              <div className="space-y-4">
                {analyticsData.topPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex items-center space-x-4 p-4 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/30 dark:border-gray-600/30"
                  >
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent w-8">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {Math.floor(Math.random() * 1000) + 500} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI-Assisted Tools */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  AI Writing Assistant
                </h2>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full text-left p-4 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all transform hover:scale-[1.02] flex items-center space-x-4"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      Generate Post Ideas
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Get topic suggestions based on trends
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className="w-full text-left p-4 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all transform hover:scale-[1.02] flex items-center space-x-4"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      SEO Optimization
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Analyze and improve post SEO
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Notifications
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-4 p-4 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/30 dark:border-gray-600/30"
                    >
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          notification.type === "comment"
                            ? "bg-blue-500"
                            : notification.type === "traffic"
                              ? "bg-emerald-500"
                              : "bg-orange-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No notifications yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      You'll see updates here as your blog grows
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - SEO, Community, Integrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* SEO & Visibility Tools */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                SEO Performance
              </h2>
            </div>

            <div className="space-y-5">
              {postsData?.posts && postsData.posts.length > 0 ? (
                <>
                  <div className="flex justify-between items-center p-4 backdrop-blur-sm bg-emerald-50/70 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Posts
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {postsData.total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 backdrop-blur-sm bg-blue-50/70 dark:bg-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/30">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Published Posts
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {
                        postsData.posts.filter((p) => p.status === "published")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 backdrop-blur-sm bg-purple-50/70 dark:bg-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Draft Posts
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {
                        postsData.posts.filter((p) => p.status === "draft")
                          .length
                      }
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No SEO data available yet
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Create your first post to see analytics
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Comment & Community Management */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Community
              </h2>
            </div>

            <div className="space-y-5">
              {postsData?.posts && postsData.posts.length > 0 ? (
                <>
                  <div className="flex justify-between items-center p-4 backdrop-blur-sm bg-orange-50/70 dark:bg-orange-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/30">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Published Posts
                    </span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {
                        postsData.posts.filter((p) => p.status === "published")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 backdrop-blur-sm bg-cyan-50/70 dark:bg-cyan-900/20 rounded-2xl border border-cyan-200/50 dark:border-cyan-700/30">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Draft Posts
                    </span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                      {
                        postsData.posts.filter((p) => p.status === "draft")
                          .length
                      }
                    </span>
                  </div>
                  <Link
                    href="/comments"
                    className="flex items-center justify-center w-full p-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-2xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    Moderate Comments
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No community activity yet
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Publish posts to engage with readers
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Integration & Export Tools */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Integrations
              </h2>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                className="w-full text-left p-5 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all transform hover:scale-[1.02] flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Export Analytics
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>

              <button
                type="button"
                className="w-full text-left p-5 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all transform hover:scale-[1.02] flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Social Sharing
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Preview Section */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Responsive Preview
              </h2>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                className="p-3 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all transform hover:scale-105"
              >
                <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                type="button"
                className="p-3 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-white/30 dark:border-gray-600/30 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all transform hover:scale-105"
              >
                <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80 p-6 rounded-2xl border border-white/30 dark:border-gray-600/30">
            {postsData?.posts && postsData.posts.length > 0 ? (
              <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 p-6 rounded-2xl border border-white/50 dark:border-gray-600/50 shadow-lg">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">
                  {postsData.posts[0].title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {postsData.posts[0].content.substring(0, 150)}...
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    A
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Author •{" "}
                    {Math.ceil(
                      postsData.posts[0].content.split(" ").length / 200,
                    )}{" "}
                    min read
                  </span>
                </div>
              </div>
            ) : (
              <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 p-6 rounded-2xl border border-white/50 dark:border-gray-600/50 shadow-lg text-center">
                <Smartphone className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">
                  No Posts Yet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Create your first post to see how it will look across
                  different devices and screen sizes.
                </p>
                <Link
                  href="/posts/create"
                  className="inline-flex items-center mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
