"use client";

import {
  Eye,
  FileText,
  Heart,
  Lightbulb,
  MessageCircle,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/core/lib/api-client";

interface AnalyticsData {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  followersCount: number;
  followingCount: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}
      >
        <span className="text-gray-700">{icon}</span>
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL ||
          "https://taleon-7rwt.onrender.com/api";
        const response = await fetch(`${API_BASE_URL}/users/me/analytics`, {
          headers: getAuthHeaders(),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        // Set default values on error
        setAnalytics({
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          followersCount: 0,
          followingCount: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold font-serif text-gray-900 mb-8">
          Analytics
        </h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold font-serif text-gray-900 mb-8">
        Analytics
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {/* Overview Stats Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Posts"
            value={analytics?.totalPosts ?? 0}
            icon={<FileText className="w-6 h-6" />}
            color="bg-blue-100"
          />
          <StatCard
            title="Total Views"
            value={analytics?.totalViews ?? 0}
            icon={<Eye className="w-6 h-6" />}
            color="bg-purple-100"
          />
          <StatCard
            title="Total Likes"
            value={analytics?.totalLikes ?? 0}
            icon={<Heart className="w-6 h-6" />}
            color="bg-red-100"
          />
          <StatCard
            title="Total Comments"
            value={analytics?.totalComments ?? 0}
            icon={<MessageCircle className="w-6 h-6" />}
            color="bg-green-100"
          />
          <StatCard
            title="Followers"
            value={analytics?.followersCount ?? 0}
            icon={<Users className="w-6 h-6" />}
            color="bg-indigo-100"
          />
          <StatCard
            title="Following"
            value={analytics?.followingCount ?? 0}
            color="bg-orange-100"
            icon={<UserPlus className="w-6 h-6" />}
          />
        </div>
      </div>

      {/* Engagement Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Engagement Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Avg. Views per Post</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics && analytics.totalPosts > 0
                ? Math.round(analytics.totalViews / analytics.totalPosts)
                : 0}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Avg. Likes per Post</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics && analytics.totalPosts > 0
                ? Math.round(
                    (analytics.totalLikes / analytics.totalPosts) * 10,
                  ) / 10
                : 0}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Avg. Comments per Post</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics && analytics.totalPosts > 0
                ? Math.round(
                    (analytics.totalComments / analytics.totalPosts) * 10,
                  ) / 10
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Tips to Increase Your Analytics
        </h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Write compelling titles to attract more views</li>
          <li>• Engage with your readers by responding to comments</li>
          <li>• Share your posts on social media to increase visibility</li>
          <li>• Post consistently to build a loyal audience</li>
          <li>• Use relevant tags to help readers find your content</li>
        </ul>
      </div>
    </div>
  );
}
