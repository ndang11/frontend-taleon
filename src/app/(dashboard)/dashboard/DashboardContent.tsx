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

  // Mock data for features not yet implemented
  const analyticsData = {
    pageViews: 12543,
    engagement: 8.2,
    topPosts: postsData?.posts.slice(0, 3) || [],
    demographics: { desktop: 65, mobile: 30, tablet: 5 },
  };

  const notifications = [
    {
      id: 1,
      type: "comment",
      message: "New comment on 'Getting Started with React'",
      time: "2 min ago",
    },
    {
      id: 2,
      type: "traffic",
      message: "Traffic spike detected - 45% increase",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "publish",
      message: "Post 'Advanced TypeScript' scheduled for tomorrow",
      time: "3 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your blog.
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/posts/create"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Post</span>
            </Link>
            <button
              type="button"
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* Analytics & Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.pageViews.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <Eye className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Engagement Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.engagement}%
                </p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% from last month
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {postsData?.total || 0}
                </p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Plus className="h-3 w-3 mr-1" />
                  {postsData?.posts.filter((p) => p.status === "published")
                    .length || 0}{" "}
                  published
                </p>
              </div>
              <Edit className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comments</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  12 awaiting moderation
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Content Management & Calendar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Management Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Content Management
                </h2>
                <Link
                  href="/drafts"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {postsData?.posts.slice(0, 5).map((post: Post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {post.status} •{" "}
                        {new Date(post.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800"
                            : post.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {post.status}
                      </span>
                      <Link
                        href={`/posts/${post.id}/edit`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Calendar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Content Calendar
                </h2>
                <button
                  type="button"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Schedule Post
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Advanced React Patterns
                      </p>
                      <p className="text-sm text-gray-600">
                        Scheduled for tomorrow at 9:00 AM
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Scheduled
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        SEO Best Practices 2024
                      </p>
                      <p className="text-sm text-gray-600">
                        Published 2 days ago
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Published
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Analytics, Tools, Notifications */}
          <div className="space-y-6">
            {/* Top Posts Analytics */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Top Performing Posts
              </h2>
              <div className="space-y-3">
                {analyticsData.topPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-400 w-6">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {Math.floor(Math.random() * 1000) + 500} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI-Assisted Tools */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                AI Writing Assistant
              </h2>
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Zap className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Generate Post Ideas
                    </p>
                    <p className="text-xs text-gray-600">
                      Get topic suggestions based on trends
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      SEO Optimization
                    </p>
                    <p className="text-xs text-gray-600">
                      Analyze and improve post SEO
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Notifications
                </h2>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === "comment"
                          ? "bg-blue-500"
                          : notification.type === "traffic"
                            ? "bg-green-500"
                            : "bg-orange-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-600">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - SEO, Community, Integrations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* SEO & Visibility Tools */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                SEO Performance
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Organic Traffic</span>
                <span className="font-medium">+15.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Keyword Rankings</span>
                <span className="font-medium">23 improved</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Backlinks</span>
                <span className="font-medium">47 new</span>
              </div>
            </div>
          </div>

          {/* Comment & Community Management */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Community</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Comments</span>
                <span className="font-medium text-orange-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Featured Replies</span>
                <span className="font-medium">3</span>
              </div>
              <Link
                href="/comments"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Moderate Comments →
              </Link>
            </div>
          </div>

          {/* Integration & Export Tools */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Share2 className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Integrations
              </h2>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Download className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Export Analytics</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>

              <button
                type="button"
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Upload className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Social Sharing</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Preview Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Responsive Preview
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Globe className="h-4 w-4 text-gray-600" />
              </button>
              <button
                type="button"
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Smartphone className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="bg-white p-4 rounded border">
              <h3 className="font-medium text-gray-900 mb-2">
                Sample Post Preview
              </h3>
              <p className="text-sm text-gray-600">
                This is how your post will look across different devices...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
