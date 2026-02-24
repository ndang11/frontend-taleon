import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Comment,
  createComment,
  getBookmarkCount,
  getComments,
  getLikeCount,
  hasUserBookmarked,
  hasUserLiked,
  incrementView,
  toggleBookmark,
  toggleLike,
} from "@/core/lib/api-client";

// ============================================
// Like/Unlike Post with Optimistic Update
// ============================================

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleLike(postId),
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["likeCount", postId] });
      await queryClient.cancelQueries({ queryKey: ["hasLiked", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot the previous value
      const previousLikeCount = queryClient.getQueryData<number>([
        "likeCount",
        postId,
      ]);
      const previousHasLiked = queryClient.getQueryData<boolean>([
        "hasLiked",
        postId,
      ]);
      const previousPosts = queryClient.getQueryData<any[]>(["posts"]);

      // Optimistically update to new value
      queryClient.setQueryData(
        ["likeCount", postId],
        (old: number | undefined) =>
          previousHasLiked ? (old || 0) - 1 : (old || 0) + 1,
      );
      queryClient.setQueryData(["hasLiked", postId], !previousHasLiked);

      // Also update posts list if it exists
      if (previousPosts) {
        queryClient.setQueryData(["posts"], (old: any[] | undefined) =>
          old?.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likeCount: previousHasLiked
                    ? Math.max(0, (post.likeCount || 0) - 1)
                    : (post.likeCount || 0) + 1,
                  isLiked: !previousHasLiked,
                }
              : post,
          ),
        );
      }

      return { previousLikeCount, previousHasLiked, previousPosts };
    },
    onError: (_, postId, context) => {
      // Rollback on error
      if (context?.previousLikeCount !== undefined) {
        queryClient.setQueryData(
          ["likeCount", postId],
          context.previousLikeCount,
        );
      }
      if (context?.previousHasLiked !== undefined) {
        queryClient.setQueryData(
          ["hasLiked", postId],
          context.previousHasLiked,
        );
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
    onSettled: (_, __, postId) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["likeCount", postId] });
      queryClient.invalidateQueries({ queryKey: ["hasLiked", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useLikeCount(postId: string) {
  return useQuery({
    queryKey: ["likeCount", postId],
    queryFn: () => getLikeCount(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1 minute - refresh more frequently
  });
}

export function useHasUserLiked(postId: string) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  return useQuery({
    queryKey: ["hasLiked", postId],
    queryFn: () => hasUserLiked(postId),
    enabled: !!postId && !!token,
    staleTime: 1 * 60 * 1000, // 1 minute
    initialData: false,
  });
}

// ============================================
// Bookmark/Unbookmark Post with Optimistic Update
// ============================================

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => toggleBookmark(postId),
    onMutate: async (postId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["bookmarkCount", postId] });
      await queryClient.cancelQueries({ queryKey: ["hasBookmarked", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot the previous value
      const previousBookmarkCount = queryClient.getQueryData<number>([
        "bookmarkCount",
        postId,
      ]);
      const previousHasBookmarked = queryClient.getQueryData<boolean>([
        "hasBookmarked",
        postId,
      ]);
      const previousPosts = queryClient.getQueryData<any[]>(["posts"]);

      // Optimistically update to new value
      queryClient.setQueryData(
        ["bookmarkCount", postId],
        (old: number | undefined) =>
          previousHasBookmarked ? (old || 0) - 1 : (old || 0) + 1,
      );
      queryClient.setQueryData(
        ["hasBookmarked", postId],
        !previousHasBookmarked,
      );

      // Also update posts list if it exists
      if (previousPosts) {
        queryClient.setQueryData(["posts"], (old: any[] | undefined) =>
          old?.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  bookmarkCount: previousHasBookmarked
                    ? Math.max(0, (post.bookmarkCount || 0) - 1)
                    : (post.bookmarkCount || 0) + 1,
                  isBookmarked: !previousHasBookmarked,
                }
              : post,
          ),
        );
      }

      return { previousBookmarkCount, previousHasBookmarked, previousPosts };
    },
    onError: (_, postId, context) => {
      // Rollback on error
      if (context?.previousBookmarkCount !== undefined) {
        queryClient.setQueryData(
          ["bookmarkCount", postId],
          context.previousBookmarkCount,
        );
      }
      if (context?.previousHasBookmarked !== undefined) {
        queryClient.setQueryData(
          ["hasBookmarked", postId],
          context.previousHasBookmarked,
        );
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
    onSettled: (_, __, postId) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["bookmarkCount", postId] });
      queryClient.invalidateQueries({ queryKey: ["hasBookmarked", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useBookmarkCount(postId: string) {
  return useQuery({
    queryKey: ["bookmarkCount", postId],
    queryFn: () => getBookmarkCount(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1 minute - refresh more frequently
  });
}

export function useHasUserBookmarked(postId: string) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  return useQuery({
    queryKey: ["hasBookmarked", postId],
    queryFn: () => hasUserBookmarked(postId),
    enabled: !!postId && !!token,
    staleTime: 1 * 60 * 1000, // 1 minute
    initialData: false,
  });
}

// ============================================
// Comments with Optimistic Update
// ============================================

export function useComments(postId: string) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1 minute - refresh more frequently
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      createComment(postId, content),
    onMutate: async ({ postId, content }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<Comment[]>([
        "comments",
        postId,
      ]);
      const previousPosts = queryClient.getQueryData<any[]>(["posts"]);

      // Create optimistic comment
      const optimisticComment: Comment = {
        _id: `temp-${Date.now()}`,
        content,
        userId: {
          _id: "current-user",
          name: "You",
          avatar: undefined,
        },
        postId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likeCount: 0,
      };

      // Optimistically update to new value
      queryClient.setQueryData(
        ["comments", postId],
        (old: Comment[] | undefined) => [
          { ...optimisticComment, likeCount: 0 } as Comment,
          ...(old || []),
        ],
      );

      // Also update comment count in posts list
      if (previousPosts) {
        queryClient.setQueryData(["posts"], (old: any[] | undefined) =>
          old?.map((post) =>
            post._id === postId
              ? { ...post, commentCount: (post.commentCount || 0) + 1 }
              : post,
          ),
        );
      }

      return { previousComments, previousPosts };
    },
    onError: (_, { postId }, context) => {
      // Rollback on error
      if (context?.previousComments !== undefined) {
        queryClient.setQueryData(
          ["comments", postId],
          context.previousComments,
        );
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },
    onSettled: (_, __, { postId }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// ============================================
// Views
// ============================================

export function useIncrementView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => incrementView(postId),
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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

export interface UseBookmarkReturn {
  toggleBookmark: () => void;
  isToggling: boolean;
  bookmarked: boolean | null;
  bookmarkCount: number | null;
}
