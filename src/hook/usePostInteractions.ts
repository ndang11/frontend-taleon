import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Comment,
  createComment,
  getComments,
  toggleLike,
} from "@/core/lib/api-client";

// ============================================
// Like/Unlike Post
// ============================================

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleLike(postId),
    onSuccess: (_, postId) => {
      // Invalidate post query to refresh like count
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}

// ============================================
// Comments
// ============================================

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      createComment(postId, content),
    onSuccess: (_, { postId }) => {
      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });
}

// ============================================
// Types
// ============================================

export interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: Error | null;
  createComment: (data: { postId: string; content: string }) => void;
  isCreating: boolean;
}

export interface UseLikeReturn {
  toggleLike: () => void;
  isToggling: boolean;
  liked: boolean | null;
  likeCount: number | null;
}
