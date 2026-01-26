import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likesApi } from "./api";

export const useLikeCount = (postId: string) => {
  return useQuery({
    queryKey: ["likes", "count", postId],
    queryFn: () => likesApi.getLikeCount(postId),
    enabled: !!postId,
  });
};

export const useHasUserLiked = (postId: string) => {
  return useQuery({
    queryKey: ["likes", "status", postId],
    queryFn: () => likesApi.hasUserLiked(postId),
    enabled: !!postId,
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => likesApi.toggleLike(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["likes", "count", postId] });
      queryClient.invalidateQueries({ queryKey: ["likes", "status", postId] });
    },
  });
};
