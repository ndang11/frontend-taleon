"use client";

import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

// Mock data for stats
const mockStats = {
  overview: {
    totalViews: 12458,
    totalFollowers: 1284,
    totalLikes: 3421,
    totalStories: 24,
  },
  viewsChange: 12.5,
  followersChange: 8.3,
  likesChange: -2.1,
  storiesChange: 4,
};

const mockMonthlyViews = [
  { month: "Jan", views: 1200 },
  { month: "Feb", views: 1900 },
  { month: "Mar", views: 1500 },
  { month: "Apr", views: 2100 },
  { month: "May", views: 2800 },
  { month: "Jun", views: 3200 },
  { month: "Jul", views: 2900 },
  { month: "Aug", views: 3500 },
  { month: "Sep", views: 3100 },
  { month: "Oct", views: 3800 },
  { month: "Nov", views: 4200 },
  { month: "Dec", views: 4500 },
];

const mockTopStories = [
  {
    id: "1",
    title: "The Future of AI in Web Development",
    views: 3240,
    likes: 892,
    date: "Dec 15, 2024",
  },
  {
    id: "2",
    title: "Building Scalable React Applications",
    views: 2890,
    likes: 745,
    date: "Dec 10, 2024",
  },
  {
    id: "3",
    title: "Understanding TypeScript Generics",
    views: 2150,
    likes: 621,
    date: "Dec 5, 2024",
  },
  {
    id: "4",
    title: "CSS Grid vs Flexbox: When to Use What",
    views: 1890,
    likes: 534,
    date: "Nov 28, 2024",
  },
  {
    id: "5",
    title: "Optimizing Next.js Performance",
    views: 1650,
    likes: 478,
    date: "Nov 20, 2024",
  },
];

const mockRecentActivity = [
  { id: "1", type: "new_follower", user: "Sarah Johnson", time: "2 hours ago" },
  { id: "2", type: "like", user: "Mike Chen", time: "5 hours ago" },
  { id: "3", type: "view", user: "Anonymous", time: "6 hours ago" },
  { id: "4", type: "share", user: "Emma Wilson", time: "8 hours ago" },
  { id: "5", type: "new_follower", user: "Alex Turner", time: "1 day ago" },
];

type TimeRange = "7d" | "30d" | "90d" | "1y";

export default function StatsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const maxViews = Math.max(...mockMonthlyViews.map((m) => m.views));

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-500 mt-1">
            Track your performance and engagement
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(["7d", "30d", "90d", "1y"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === range
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {range === "7d"
                ? "7 Days"
                : range === "30d"
                  ? "30 Days"
                  : range === "90d"
                    ? "90 Days"
                    : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Views"
          value={formatNumber(mockStats.overview.totalViews)}
          change={mockStats.viewsChange}
          icon={<Eye className="w-5 h-5" />}
        />
        <StatCard
          title="Followers"
          value={formatNumber(mockStats.overview.totalFollowers)}
          change={mockStats.followersChange}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Total Likes"
          value={formatNumber(mockStats.overview.totalLikes)}
          change={mockStats.likesChange}
          icon={<Heart className="w-5 h-5" />}
        />
        <StatCard
          title="Stories"
          value={mockStats.overview.totalStories.toString()}
          change={mockStats.storiesChange}
          icon={<Share2 className="w-5 h-5" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Views Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Monthly Views
            </h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end gap-2">
            {mockMonthlyViews.map((item, i) => {
              const height = (item.views / maxViews) * 100;
              const isRecent = i >= mockMonthlyViews.length - 3;
              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
                      isRecent ? "bg-gray-900" : "bg-gray-300"
                    }`}
                    style={{ height: `${height}%`, minHeight: "4px" }}
                    title={`${item.month}: ${item.views.toLocaleString()} views`}
                  ></div>
                  <span className="text-xs text-gray-500">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {activity.type === "new_follower" && (
                    <Users className="w-4 h-4 text-blue-500" />
                  )}
                  {activity.type === "like" && (
                    <Heart className="w-4 h-4 text-red-500" />
                  )}
                  {activity.type === "view" && (
                    <Eye className="w-4 h-4 text-green-500" />
                  )}
                  {activity.type === "share" && (
                    <Share2 className="w-4 h-4 text-purple-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.type === "new_follower"
                      ? "started following you"
                      : activity.type === "like"
                        ? "liked your story"
                        : activity.type === "view"
                          ? "viewed your story"
                          : "shared your story"}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Stories Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Top Performing Stories
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Story
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockTopStories.map((story) => (
                <tr
                  key={story.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {story.title}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      {story.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Heart className="w-4 h-4" />
                      {story.likes.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{story.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}
