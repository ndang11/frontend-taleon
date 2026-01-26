import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreatePostRequest,
  postsApi,
  type UpdatePostRequest,
} from "./api";

export const usePosts = (publicOnly?: boolean) => {
  return useQuery({
    queryKey: ["posts", publicOnly],
    queryFn: () => postsApi.getPosts(publicOnly),
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => postsApi.getPost(id),
    enabled: !!id,
  });
};

export const usePostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["post", "slug", slug],
    queryFn: () => postsApi.getPostBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => postsApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostRequest }) =>
      postsApi.updatePost(id, data),
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", updatedPost.id] });
      queryClient.invalidateQueries({
        queryKey: ["post", "slug", updatedPost.slug],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postsApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File) => postsApi.uploadImage(file),
  });
};
