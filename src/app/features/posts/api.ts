import { api } from "../../lib/api-client";
import type { Post } from "../../types/post";

export interface CreatePostRequest {
  title: string;
  content: string;
  status?: "draft" | "published" | "unpublished";
  slug: string;
  category: string;
  image?: string;
  isPublic?: boolean;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export const postsApi = {
  async getPosts(publicOnly?: boolean): Promise<Post[]> {
    const query = publicOnly ? "?public=true" : "";
    return api<Post[]>(`/posts${query}`);
  },

  async getPost(id: string): Promise<Post> {
    return api<Post>(`/posts/${id}`);
  },

  async getPostBySlug(slug: string): Promise<Post> {
    return api<Post>(`/posts/slug/${slug}`);
  },

  async createPost(data: CreatePostRequest): Promise<Post> {
    return api<Post>("/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  async updatePost(id: string, data: UpdatePostRequest): Promise<Post> {
    return api<Post>(`/posts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  async deletePost(id: string): Promise<void> {
    return api<void>(`/posts/${id}`, {
      method: "DELETE",
    });
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    return api<{ url: string }>("/posts/upload", {
      method: "POST",
      body: formData,
    });
  },
};
