import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followUser, isFollowing, unfollowUser } from "@/core/lib/api-client";

export function useFollow(userId: string) {
  const queryClient = useQueryClient();

  const { data: followStatus } = useQuery({
    queryKey: ["followStatus", userId],
    queryFn: () => isFollowing(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      // Invalidate user profile queries to refresh followers/following counts
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // Return the followers count for the parent component to update
      return data;
    },
    onError: (error: any) => {
      // If already following (409), refresh the status
      if (error?.message?.includes("already following")) {
        queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      }
    },
    onError: (error: any) => {
      // If already following (409), refresh the status
      if (error?.message?.includes("already following")) {
        queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      }
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      // Invalidate user profile queries to refresh followers/following counts
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // Return the followers count for the parent component to update
      return data;
    },
  });

  const toggleFollow = () => {
    if (followStatus?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return {
    isFollowing: followStatus?.isFollowing || false,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
    toggleFollow,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    followCount:
      followMutation.data?.followersCount ??
      unfollowMutation.data?.followersCount ??
      0,
  };
}
