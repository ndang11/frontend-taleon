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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
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
  };
}
