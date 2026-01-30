import type {
  AuthResponse,
  RegisterRequest,
} from "../../core/types/auth.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  // FIX: Check if the response body exists and isn't empty
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
};

export const fetcher = {
  get: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, data: any, options?: RequestInit) =>
    request<T>(url, { ...options, method: "POST", body: JSON.stringify(data) }),
  patch: <T>(url: string, data: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "DELETE" }),
};

export const api = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateBlogRequest {
  name: string;
  slug: string;
  userId: string;
}

export interface BlogResponse {
  id: string;
  name: string;
  slug: string;
  userId: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  followers: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
  following: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }[];
  followersCount: number;
  followingCount: number;
}

export interface Post {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  content: PostContent;
  status: "draft" | "published" | "unpublished";
  authorId: AuthorInfo;
  tenantId: string;
  readingTime?: number;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
  category?: string;
  image?: string;
  isPublic?: boolean;
}

export interface AuthorInfo {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface PostContent {
  blocks: ContentBlock[];
  time?: number;
  version?: string;
}

export interface ContentBlock {
  id?: string;
  type: string;
  data: Record<string, unknown>;
  tunes?: Record<string, unknown>;
}

export interface PostsResponse {
  posts: Post[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface FetchPostsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Registration failed");
  }

  return response.json();
}

export async function createBlog(
  data: CreateBlogRequest,
  token: string,
): Promise<BlogResponse> {
  const response = await fetch(`${API_BASE_URL}/blogs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Blog creation failed");
  }

  return response.json();
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function fetchPosts(
  params: FetchPostsParams = {},
  token: string,
): Promise<PostsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.status) query.append("status", params.status);

  const response = await fetch(`${API_BASE_URL}/posts?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return response.json();
}

export async function fetchMyPosts(token: string): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts/my-posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch my posts");
  }

  return response.json();
}

export async function fetchPost(postId: string, token: string): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }

  return response.json();
}

export async function deletePost(postId: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete post");
  }
}

export async function updatePostStatus(
  postId: string,
  status: "published" | "unpublished",
  token: string,
): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update post status");
  }

  return response.json();
}

export interface CreatePostRequest {
  title: string;
  content: string;
  status?: "draft" | "published" | "unpublished";
  slug?: string;
  category?: string;
  image?: string;
  isPublic?: boolean;
}

export async function createPost(
  data: CreatePostRequest,
  token: string,
): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: data.title,
      content: data.content,
      status: data.status || "draft",
      slug: data.slug,
      category: data.category,
      image: data.image,
      isPublic: data.isPublic,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create post");
  }

  return response.json();
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  status?: "draft" | "published" | "unpublished";
  category?: string;
  image?: string;
}

export async function updatePost(
  postId: string,
  data: UpdatePostRequest,
  token: string,
): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update post");
  }

  return response.json();
}

export interface PublicPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  slug: string;
  blogSlug: string;
  authorName: string;
  excerpt?: string;
  imageUrl?: string;
}

export interface PublicPostsResponse {
  posts: PublicPost[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchPublicPosts(
  params: FetchPostsParams & { tenantSlug?: string } = {},
): Promise<PublicPostsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.status) query.append("status", params.status);
  if (params.tenantSlug) query.append("tenantSlug", params.tenantSlug);

  const response = await fetch(`${API_BASE_URL}/public/posts?${query}`);

  if (!response.ok) {
    throw new Error("Failed to fetch public posts");
  }

  return response.json();
}

export async function getUserProfile(
  userId: string,
  token: string,
): Promise<UserProfile> {
  if (!userId || !token) {
    throw new Error("User ID and token are required");
  }

  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch user profile: ${response.status} ${response.statusText}`,
    );
  }

  const userData = await response.json();

  // Validate the response structure
  if (!userData || typeof userData !== "object") {
    throw new Error("Invalid profile response format");
  }

  // Ensure required fields exist
  const profile: UserProfile = {
    _id: userData._id || userId,
    name: userData.name || "Unknown User",
    email: userData.email || "",
    avatar: userData.avatar || undefined,
    bio: userData.bio || undefined,
    location: userData.location || undefined,
    website: userData.website || undefined,
    phone: userData.phone || undefined,
    followers: Array.isArray(userData.followers) ? userData.followers : [],
    following: Array.isArray(userData.following) ? userData.following : [],
    followersCount: userData.followersCount || userData.followers?.length || 0,
    followingCount: userData.followingCount || userData.following?.length || 0,
  };

  return profile;
}

export async function followUser(userId: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to follow user");
  }
}

export async function unfollowUser(
  userId: string,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to unfollow user");
  }
}

export async function isFollowing(
  userId: string,
  token: string,
): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/is-following`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to check follow status");
  }

  return response.json();
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    email?: string;
    bio?: string;
    avatar?: string;
    location?: string;
    website?: string;
    phone?: string;
  },
  token: string,
): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
}

// Story fetching functions

export async function fetchStories(
  tenantId: string,
  token: string,
): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-tenant-id": tenantId,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch stories" }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

export async function fetchMyStories(
  tenantId: string,
  _userId: string,
  token: string,
): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts/user/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-tenant-id": tenantId,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch your stories" }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : [];
}

export async function fetchStoryById(
  tenantId: string,
  storyId: string,
  token: string,
): Promise<Post | null> {
  const response = await fetch(`${API_BASE_URL}/posts/${storyId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-tenant-id": tenantId,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch story" }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function fetchOwnStoryById(
  tenantId: string,
  storyId: string,
  _userId: string,
  token: string,
): Promise<Post | null> {
  const response = await fetch(`${API_BASE_URL}/posts/${storyId}/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-tenant-id": tenantId,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch story" }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function deleteStory(
  tenantId: string,
  storyId: string,
  _userId: string,
  token: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/posts/${storyId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-tenant-id": tenantId,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to delete story" }));
    throw new Error(error.message || `Error ${response.status}`);
  }
}

export async function updateStory(
  tenantId: string,
  storyId: string,
  _userId: string,
  data: Partial<Post>,
  token: string,
): Promise<Post | null> {
  const response = await fetch(`${API_BASE_URL}/posts/${storyId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-tenant-id": tenantId,
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to update story" }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export async function fetchUserStories(
  userId: string,
  token: string,
): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/stories`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user stories");
  }

  return response.json();
}
