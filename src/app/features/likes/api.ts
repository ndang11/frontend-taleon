import { api } from "../../lib/api-client";

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

export const likesApi = {
  async toggleLike(postId: string): Promise<LikeResponse> {
    return api<LikeResponse>(`/likes/post/${postId}/toggle`, {
      method: "POST",
    });
  },

  async getLikeCount(postId: string): Promise<number> {
    const response = await api<{ count: number }>(
      `/likes/post/${postId}/count`,
    );
    return response.count;
  },

  async hasUserLiked(postId: string): Promise<boolean> {
    const response = await api<{ liked: boolean }>(
      `/likes/post/${postId}/status`,
    );
    return response.liked;
  },
};
