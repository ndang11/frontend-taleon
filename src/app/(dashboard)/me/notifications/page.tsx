"use client";

import {
  Bell,
  Check,
  CheckCheck,
  Heart,
  MessageCircle,
  Trash2,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/auth.provider";
import { useNotifications } from "@/hook/useNotifications";

interface NotificationData {
  _id: string;
  userId: string;
  fromUserId?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  type: "like" | "comment" | "follow" | "mention";
  postId?: {
    _id: string;
    title: string;
    slug: string;
    coverImage?: string;
  };
  message: string;
  isRead: boolean;
  createdAt: string;
}

type AppNotification = NotificationData;

export default function NotificationsPage() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading: isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="text-center py-10">
          <p className="text-gray-500">
            Please log in to view your notifications.
          </p>
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n: any) => !n.isRead)
      : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationLink = (notification: AppNotification) => {
    if (notification.type === "follow") {
      return `/me/profile`;
    }
    if (notification.postId?.slug) {
      return `/story/${notification.postId.slug}`;
    }
    return "/me";
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === "unread"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Unread
            </button>
          </div>
          {notifications.length > 0 && (
            <>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck size={18} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => clearAll()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear all notifications"
              >
                <Trash2 size={18} />
                <span>Clear all</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Bell className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === "unread"
                ? "You have read all your notifications"
                : "When someone interacts with your content, you'll see it here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification: any) => (
              <div
                key={notification._id}
                className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-l-[3px] ${
                  !notification.isRead
                    ? "bg-blue-50 border-blue-600"
                    : "bg-white border-transparent"
                }`}
              >
                <div className="flex-shrink-0">
                  {notification.fromUserId?.avatar ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden relative">
                      <Image
                        src={notification.fromUserId.avatar}
                        alt={notification.fromUserId.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>

                <Link
                  href={getNotificationLink(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex-1 min-w-0"
                >
                  <p className="text-gray-900">
                    <span className="font-semibold">
                      {notification.fromUserId?.name || "Someone"}
                    </span>{" "}
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </Link>
                {notification.postId?.coverImage && (
                  <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden relative">
                    <Image
                      src={notification.postId.coverImage}
                      alt={notification.postId.title || "Post"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="p-2 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification._id)}
                    className="p-2 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
