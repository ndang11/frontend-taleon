import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CreateCommentRequest, commentsApi } from "./api";

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentsApi.getComments(postId),
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentsApi.createComment(data),
    onSuccess: (newComment) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", newComment.postId],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => commentsApi.deleteComment(id),
    onSuccess: () => {
      // Invalidate all comments queries since we don't know which post it belonged to
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
};
