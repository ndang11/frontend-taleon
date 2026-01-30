"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteStory,
  fetchMyStories,
  fetchStories,
  fetchStoryById,
  type Post,
} from "@/core/lib/api-client";

interface UseStoriesOptions {
  tenantId: string;
  userId?: string;
  token: string;
}

export function useStories({ tenantId, token }: UseStoriesOptions) {
  return useQuery({
    queryKey: ["stories", tenantId],
    queryFn: () => fetchStories(tenantId, token),
    enabled: !!tenantId && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMyStories({ tenantId, userId, token }: UseStoriesOptions) {
  return useQuery({
    queryKey: ["my-stories", tenantId, userId],
    queryFn: () => fetchMyStories(tenantId, userId || "", token),
    enabled: !!tenantId && !!userId && !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStory(tenantId: string, storyId: string, token: string) {
  return useQuery({
    queryKey: ["story", tenantId, storyId],
    queryFn: () => fetchStoryById(tenantId, storyId, token),
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
    mutationFn: (storyId: string) =>
      deleteStory(tenantId, storyId, userId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories", tenantId] });
      queryClient.invalidateQueries({
        queryKey: ["my-stories", tenantId, userId],
      });
    },
  });
}

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
