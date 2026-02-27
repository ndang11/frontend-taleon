"use client";

import {
  ArrowTrendingUpIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowTrendingUpIcon as ArrowTrendingUpSolidIcon,
  HeartIcon as HeartSolidIcon,
} from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/auth.provider";
import {
  PostCard,
  type PostCardData,
} from "@/core/components/molecule/PostCard";
import { getPublishedPosts, getUserAnalytics } from "@/core/lib/api-client";

// Type for analytics data from API
interface UserAnalytics {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  followersCount: number;
  followingCount: number;
}

const mapPostToCardData = (post: any): PostCardData => ({
  _id: post._id,
  title: post.title,
  content: post.content,
  image: post.image,
  author: typeof post.authorId === "object" ? post.authorId : undefined,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  readTime: post.readTime,
  tags: post.tags,
  slug: post.slug,
  viewCount: post.viewCount ?? 0,
  likeCount: post.likeCount ?? 0,
  commentCount: post.commentCount ?? 0,
});

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  trend?: string;
}

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <div className={`w-5 h-5 ${color}`}>{icon}</div>
        </div>
        {trend && (
          <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function StatCardMini({
  icon,
  label,
  value,
  color,
}: Omit<StatCardProps, "bgColor" | "trend">) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
      <div className={`p-2 rounded-lg ${color}`}>
        <div className="w-4 h-4">{icon}</div>
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900">
          {value.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const { user } = useAuth();

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["user-analytics"],
    queryFn: getUserAnalytics,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all published posts to get user's posts and calculate stats
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["published-posts", 1, 100],
    queryFn: () => getPublishedPosts(1, 100),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = analyticsLoading || postsLoading;

  // Filter to get only current user's published posts
  const userPosts =
    postsData?.posts
      ?.filter((post: any) =>
        typeof post.authorId === "object"
          ? post.authorId._id === user?._id
          : post.authorId === user?._id,
      )
      .map(mapPostToCardData) || [];

  // Calculate additional stats
  const totalViews = userPosts.reduce(
    (sum, post) => sum + (post.viewCount || 0),
    0,
  );
  const totalLikes = userPosts.reduce(
    (sum, post) => sum + (post.likeCount || 0),
    0,
  );
  const totalComments = userPosts.reduce(
    (sum, post) => sum + (post.commentCount || 0),
    0,
  );

  // Get top performing posts (by views)
  const topPosts = [...userPosts]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  // Get most liked posts
  const mostLikedPosts = [...userPosts]
    .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
    .slice(0, 3);

  // Calculate average engagement
  const avgViewsPerPost =
    userPosts.length > 0 ? Math.round(totalViews / userPosts.length) : 0;
  const avgLikesPerPost =
    userPosts.length > 0 ? Math.round(totalLikes / userPosts.length) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-serif">
                Analytics
              </h1>
              <p className="text-gray-500 mt-1">
                Track your content performance and audience engagement
              </p>
            </div>
            <Link
              href="/new-story"
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium transition-colors"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Write a story
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon={<DocumentTextIcon className="w-5 h-5" />}
            label="Total Stories"
            value={analytics?.totalPosts || 0}
            color="text-gray-700"
            bgColor="bg-gray-100"
          />
          <StatCard
            icon={<EyeIcon className="w-5 h-5" />}
            label="Total Views"
            value={analytics?.totalViews || 0}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<HeartIcon className="w-5 h-5" />}
            label="Total Likes"
            value={analytics?.totalLikes || 0}
            color="text-red-500"
            bgColor="bg-red-50"
          />
          <StatCard
            icon={<ChatBubbleLeftIcon className="w-5 h-5" />}
            label="Comments"
            value={analytics?.totalComments || 0}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={<UserGroupIcon className="w-5 h-5" />}
            label="Followers"
            value={analytics?.followersCount || 0}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={<BookOpenIcon className="w-5 h-5" />}
            label="Following"
            value={analytics?.followingCount || 0}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Posts Performance */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              Posts Performance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCardMini
                icon={<EyeIcon className="w-4 h-4 text-blue-600" />}
                label="Avg. Views per Post"
                value={avgViewsPerPost}
                color="bg-blue-50"
              />
              <StatCardMini
                icon={<HeartIcon className="w-4 h-4 text-red-500" />}
                label="Avg. Likes per Post"
                value={avgLikesPerPost}
                color="bg-red-50"
              />
              <StatCardMini
                icon={<BookOpenIcon className="w-4 h-4 text-green-600" />}
                label="Published Stories"
                value={userPosts.length}
                color="bg-green-50"
              />
              <StatCardMini
                icon={
                  <ArrowTrendingUpIcon className="w-4 h-4 text-purple-600" />
                }
                label="Engagement Rate"
                value={
                  avgViewsPerPost > 0
                    ? `${((avgLikesPerPost / avgViewsPerPost) * 100).toFixed(1)}%`
                    : "0%"
                }
                color="bg-purple-50"
              />
            </div>
          </div>

          {/* Audience Overview */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" />
              Audience Overview
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <UserGroupIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Followers</p>
                    <p className="text-sm text-gray-500">
                      People following you
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.followersCount || 0}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BookOpenIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Following</p>
                    <p className="text-sm text-gray-500">People you follow</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.followingCount || 0}
                </p>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Total Comments</p>
                    <p className="text-sm text-gray-500">On your stories</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalComments || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Posts */}
        {topPosts.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5" />
                Top Performing Posts
              </h2>
              <Link
                href="/me/stories"
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                View all
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="View all posts"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div
                  key={post._id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  {post.image && (
                    <div className="flex-shrink-0 w-16 h-12 relative rounded-lg overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/post/${post._id}`}
                      className="font-medium text-gray-900 hover:text-green-600 transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      {post.viewCount?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4" />
                      {post.likeCount?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      {post.commentCount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Liked Posts */}
        {mostLikedPosts.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
                Most Liked Posts
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mostLikedPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/post/${post._id}`}
                  className="group block"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <DocumentTextIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <HeartSolidIcon className="w-3 h-3 text-red-500" />
                      {post.likeCount?.toLocaleString() || 0}
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-3 h-3" />
                      {post.viewCount?.toLocaleString() || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ChatBubbleLeftIcon className="w-3 h-3" />
                      {post.commentCount?.toLocaleString() || 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts Feed */}
        {userPosts.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5" />
                Recent Stories
              </h2>
              <Link
                href="/me/stories"
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                View all
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="View all posts"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
            <div className="space-y-2">
              {userPosts.slice(0, 5).map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {userPosts.length === 0 && !isLoading && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No stats yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Publish your first story to start tracking your performance and
              engagement metrics.
            </p>
            <Link
              href="/new-story"
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              <DocumentTextIcon className="w-4 h-4" />
              Write your first story
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
