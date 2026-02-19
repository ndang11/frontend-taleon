"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/core/lib/api-client";

// API functions (can be moved to api-client.ts if preferred)

interface Notification {
  _id: string;
  isRead: boolean;
  // Add other notification properties as needed
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

const getNotifications = async (): Promise<NotificationsResponse> => {
  const res = await fetcher.get<NotificationsResponse>(
    "/notifications?limit=20",
  );
  return res;
};

const markNotificationAsRead = async (notificationId: string) => {
  const res = await fetcher.post<{ unreadCount: number }>(
    `/notifications/${notificationId}/read`,
    {},
  );
  return res;
};

const markAllNotificationsAsRead = async () => {
  const res = await fetcher.post<{ unreadCount: number }>(
    "/notifications/read-all",
    {},
  );
  return res;
};

const deleteNotification = async (notificationId: string) => {
  await fetcher.delete(`/notifications/${notificationId}`);
  return notificationId;
};

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000, // Poll for new notifications every 30 seconds
    staleTime: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (updatedData, notificationId) => {
      // Optimistically update the UI and then refetch in the background
      queryClient.setQueryData(["notifications"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          notifications: oldData.notifications.map((n: any) =>
            n._id === notificationId ? { ...n, isRead: true } : n,
          ),
          unreadCount: updatedData.unreadCount,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Optimistically update all as read
      queryClient.setQueryData(["notifications"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          notifications: oldData.notifications.map((n: any) => ({
            ...n,
            isRead: true,
          })),
          unreadCount: 0,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const removeNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: (deletedId) => {
      // Optimistically remove the notification
      queryClient.setQueryData(["notifications"], (oldData: any) => {
        if (!oldData) return oldData;
        const notificationToRemove = oldData.notifications.find(
          (n: any) => n._id === deletedId,
        );
        const newUnreadCount =
          notificationToRemove && !notificationToRemove.isRead
            ? Math.max(0, oldData.unreadCount - 1)
            : oldData.unreadCount;

        return {
          ...oldData,
          notifications: oldData.notifications.filter(
            (n: any) => n._id !== deletedId,
          ),
          unreadCount: newUnreadCount,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    loading: isLoading,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    removeNotification: removeNotificationMutation.mutateAsync,
  };
};
