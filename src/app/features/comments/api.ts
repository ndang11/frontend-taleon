import { api } from "../../lib/api-client";

export interface Comment {
  id: string;
  content: string;
  postId: string;
  userId: {
    id: string;
    name: string;
  };
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  postId: string;
}

export const commentsApi = {
  async getComments(postId: string): Promise<Comment[]> {
    return api<Comment[]>(`/comments/post/${postId}`);
  },

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    return api<Comment>("/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  async deleteComment(id: string): Promise<void> {
    return api<void>(`/comments/${id}`, {
      method: "DELETE",
    });
  },
};
