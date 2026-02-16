"use client";

import {
  Bell,
  Check,
  Heart,
  MessageCircle,
  Trash2,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  };
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Rename to avoid conflict with browser's Notification type
type AppNotification = NotificationData;

export function NotificationDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading: isLoading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    // Close dropdown
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationLink = (notification: AppNotification) => {
    if (notification.type === "follow") {
      return `/me/profile`;
    }
    if (notification.postId) {
      return `/story/${notification.postId._id}`;
    }
    return "/me";
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <Link
                  href="/me/notifications"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View All
                </Link>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => clearAll()}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                  title="Clear all notifications"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Notifications List - Increased height to show more */}
          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification: any) => (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-l-[3px] ${
                      !notification.isRead
                        ? "bg-blue-50 border-blue-600"
                        : "bg-white border-transparent"
                    }`}
                  >
                    {/* Avatar or Icon */}
                    <div className="flex-shrink-0">
                      {notification.fromUserId?.avatar ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden relative">
                          <Image
                            src={notification.fromUserId.avatar}
                            alt={notification.fromUserId.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <Link
                      href={getNotificationLink(notification)}
                      onClick={() => handleNotificationClick(notification)}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">
                          {notification.fromUserId?.name || "Someone"}
                        </span>{" "}
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-400"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification._id)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-400"
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
      )}
    </div>
  );
}
