"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePost,
  getMyPosts,
  getPost,
  getPublishedPosts,
  type Post,
} from "@/core/lib/api-client";

interface UseStoriesOptions {
  tenantId?: string;
  userId?: string;
  token: string;
}

// ============================================
// Published Posts (Public Feed)
// ============================================

export function usePublishedPosts(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["published-posts", page, limit],
    queryFn: () => getPublishedPosts(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================
// My Posts (Dashboard)
// ============================================

export function useMyPosts(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["my-posts", page, limit],
    queryFn: () => getMyPosts(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================
// Single Post
// ============================================

export function usePost(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// Delete Post
// ============================================

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["published-posts"] });
    },
  });
}

// ============================================
// Stories (Legacy - Tenant-based)
// ============================================

export function useStories({ tenantId, token }: UseStoriesOptions) {
  return useQuery({
    queryKey: ["stories", tenantId],
    queryFn: () => {
      if (!tenantId || !token) throw new Error("Missing required parameters");
      return getPublishedPosts(1, 10); // Fallback to new function
    },
    enabled: !!tenantId && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMyStories({ tenantId, userId, token }: UseStoriesOptions) {
  return useQuery({
    queryKey: ["my-stories", tenantId, userId],
    queryFn: () => {
      if (!tenantId || !userId || !token)
        throw new Error("Missing required parameters");
      return getMyPosts(1, 10); // Use new function
    },
    enabled: !!tenantId && !!userId && !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStory(tenantId: string, storyId: string, token: string) {
  return useQuery({
    queryKey: ["story", tenantId, storyId],
    queryFn: () => {
      if (!tenantId || !storyId || !token)
        throw new Error("Missing required parameters");
      return getPost(storyId);
    },
    enabled: !!tenantId && !!storyId && !!token,
  });
}

interface DeleteStoryOptions {
  tenantId: string;
  userId: string;
  token: string;
}

export function useDeleteStory({
  tenantId,
  userId,
  token,
}: DeleteStoryOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) => deletePost(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories", tenantId] });
      queryClient.invalidateQueries({
        queryKey: ["my-stories", tenantId, userId],
      });
    },
  });
}

// ============================================
// Stats Helper
// ============================================

export function useStoriesStats(posts: Post[] | undefined) {
  if (!posts) {
    return {
      total: 0,
      published: 0,
      drafts: 0,
      unpublished: 0,
    };
  }

  return {
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    drafts: posts.filter((p) => p.status === "draft").length,
    unpublished: posts.filter((p) => p.status === "unpublished").length,
  };
}
