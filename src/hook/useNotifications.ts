"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/core/lib/api-client";

const getNotifications = async () => {
  const res: any = await fetcher.get("/notifications?limit=20");
  return res;
};

const markNotificationAsRead = async (notificationId: string) => {
  const res: any = await fetcher.post(
    `/notifications/${notificationId}/read`,
    {},
  );
  return res;
};

const markAllNotificationsAsRead = async () => {
  const res: any = await fetcher.post("/notifications/read-all", {});
  return res;
};

const deleteNotification = async (notificationId: string) => {
  await fetcher.delete(`/notifications/${notificationId}`);
  return notificationId;
};

const deleteAllNotifications = async () => {
  await fetcher.delete("/notifications");
};

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000,
    staleTime: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (updatedData, notificationId) => {
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

  const clearAllNotificationsMutation = useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: () => {
      // Optimistically clear all notifications
      queryClient.setQueryData(["notifications"], (oldData: any) => {
        if (!oldData) return { notifications: [], unreadCount: 0 };
        return {
          ...oldData,
          notifications: [],
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
    clearAll: clearAllNotificationsMutation.mutateAsync,
  };
};
