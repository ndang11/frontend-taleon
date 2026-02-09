"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  createComment,
  getComments,
  getLikeCount,
  hasUserLiked,
  incrementView,
  toggleLike,
} from "@/core/lib/api-client";

interface UsePostInteractionsOptions {
  postId: string;
  initialLikeCount?: number;
}

interface CommentData {
  content: string;
  authorId: string;
}

export function usePostInteractions({
  postId,
  initialLikeCount = 0,
}: UsePostInteractionsOptions) {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [viewCount, setViewCount] = useState(0);

  // Toggle like mutation
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(postId),
    onMutate: async () => {
      const previousIsLiked = isLiked;
      const previousLikeCount = likeCount;

      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

      return { previousIsLiked, previousLikeCount };
    },
    onError: (_, __, context) => {
      if (context) {
        setIsLiked(context.previousIsLiked);
        setLikeCount(context.previousLikeCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["likeCount", postId] });
      queryClient.invalidateQueries({ queryKey: ["hasLiked", postId] });
    },
  });

  // Increment view mutation
  const viewMutation = useMutation({
    mutationFn: () => incrementView(postId),
    onSuccess: (data) => {
      setViewCount(data.viewCount || 0);
    },
  });

  // Submit comment mutation
  const commentMutation = useMutation({
    mutationFn: (data: CommentData) => createComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  // Handle like
  const handleLike = useCallback(() => {
    likeMutation.mutate();
  }, [likeMutation]);

  // Handle view increment
  const handleView = useCallback(() => {
    viewMutation.mutate();
  }, [viewMutation]);

  // Handle comment submission
  const handleComment = useCallback(
    async (content: string, authorId: string) => {
      return commentMutation.mutateAsync({ content, authorId });
    },
    [commentMutation],
  );

  return {
    isLiked,
    likeCount,
    viewCount,
    setLikeCount,
    setViewCount,
    setIsLiked,
    handleLike,
    handleView,
    handleComment,
    isLiking: likeMutation.isPending,
    isViewing: viewMutation.isPending,
    isCommenting: commentMutation.isPending,
  };
}
