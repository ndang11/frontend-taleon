import Cookies from "js-cookie";
import type {
  AuthResponse,
  RegisterRequest,
} from "../../core/types/auth.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://taleon-7rwt.onrender.com/api";

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined")
    return { "Content-Type": "application/json" };

  const token = localStorage.getItem("access_token");

  if (!token) {
    console.error("DEBUG: No token found in localStorage under 'access_token'");
  }

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
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
  put: <T>(url: string, data: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: "PUT",
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
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
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

export interface AuthorInfo {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Post {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  content: PostContent;
  status: "draft" | "published" | "unpublished" | "archived";
  authorId: AuthorInfo | string;
  tenantId?: string;
  readingTime?: number;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  category?: string;
  subtitle?: string;
  image?: string;
  coverImage?: string;
  isPublic?: boolean;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  tags?: string[];
}

export interface PostsResponse {
  posts: Post[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface FetchPostsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export function canEditPost(
  post: { authorId: string | AuthorInfo },
  currentUserId: string,
): boolean {
  const authorId =
    typeof post.authorId === "string" ? post.authorId : post.authorId._id;
  return authorId === currentUserId;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  console.log(
    "[api-client] Sending login request to:",
    `${API_BASE_URL}/auth/login`,
  );
  console.log("[api-client] Login data (email):", data.email);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  console.log("[api-client] Login response status:", response.status);

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let errorMessage = "Login failed";

    if (contentType?.includes("application/json")) {
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.error || "Login failed";
        console.error("[api-client] Login error response:", errorData);
      } catch {
        // Fallback to default error message
      }
    } else {
      // Try to get text response as error message
      try {
        const text = await response.text();
        if (text && text.length < 200) {
          errorMessage = text;
        }
        console.error("[api-client] Login error (text):", text);
      } catch {
        // Fallback to default error message
      }
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log(
    "[api-client] Login successful, received token:",
    result.accessToken ? "yes" : "no",
  );
  return result;
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

export interface CreatePostRequest {
  title: string;
  content: any;
  category?: string;
  image?: string;
  subtitle?: string;
  status?: "draft" | "published";
}

/**
 * Create a new post (draft)
 * POST /posts
 */
export async function createDraft(data: CreatePostRequest): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to create draft" }));
    throw new Error(error.message || "Failed to create draft");
  }

  return response.json();
}

/**
 * Autosave a draft
 * PATCH /posts/:id/autosave
 */
export async function autoSave(
  postId: string,
  content: any,
  title?: string,
): Promise<Post | any> {
  const headers = getAuthHeaders();

  if (!headers.Authorization) {
    console.warn("Autosave attempt without Token!");
  }

  const safeContent = content === undefined ? "" : content;
  const safeTitle = title === undefined ? "" : title;

  console.log("[autoSave] Saving post:", postId);
  console.log("[autoSave] Title:", safeTitle);
  console.log("[autoSave] Content type:", typeof safeContent);

  // Safely get content preview - avoid substring on undefined
  const getContentPreview = (): string => {
    if (safeContent === null) return "null";
    if (typeof safeContent === "string") {
      return safeContent.substring(0, 100) || "(empty string)";
    }
    try {
      const jsonStr = JSON.stringify(safeContent);
      return jsonStr.substring(0, 100) || "(empty object)";
    } catch {
      return "(non-serializable content)";
    }
  };

  console.log("[autoSave] Content preview:", getContentPreview());

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/autosave`, {
    method: "PATCH",
    headers: headers,
    body: JSON.stringify({ content: safeContent, title: safeTitle }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Autosave failed" }));
    console.error("[autoSave] Failed:", error);
    const err = new Error(error.message || "Autosave failed");
    (err as any).status = response.status;
    throw err;
  }

  const text = await response.text();
  console.log("[autoSave] Success:", text ? "yes" : "no response body");
  return text ? JSON.parse(text) : {};
}

/**
 * Publish a post
 * PATCH /posts/:id/publish
 */
export async function publishPost(postId: string): Promise<Post> {
  if (!postId) {
    throw new Error("Post ID is required for publishing");
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/publish`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to publish" }));
    throw new Error(error.message || "Failed to publish post");
  }

  return response.json();
}

/**
 * Update a post (PATCH)
 * PATCH /posts/:id
 */
export async function updatePost(
  postId: string,
  updates: {
    title?: string;
    content?: any;
    category?: string;
    image?: string;
    subtitle?: string;
  },
): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  if (response.status === 403) {
    throw new Error("You are not authorized to edit this post");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to update post" }));
    throw new Error(error.message || "Failed to update post");
  }

  return response.json();
}

/**
 * Delete a post
 * DELETE /posts/:id
 */
export async function deletePost(postId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (response.status === 403) {
    throw new Error("You are not authorized to delete this post");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to delete post" }));
    throw new Error(error.message || "Failed to delete post");
  }

  return { message: "Post deleted successfully" };
}

/**
 * Get published post by slug
 * GET /posts/slug/:slug
 */
export async function getPublishedPostBySlug(slug: string): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/posts/slug/${slug}`);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Post not found" }));
    throw new Error(error.message || "Post not found");
  }

  return response.json();
}

/**
 * Get a user's post by slug (authenticated)
 * GET /posts/slug/:slug
 */
export async function getUserPost(slug: string): Promise<{ post: Post }> {
  const response = await fetch(`${API_BASE_URL}/posts/slug/${slug}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Post not found" }));
    throw new Error(error.message || "Post not found");
  }

  return response.json();
}

/**
 * Get user's posts (dashboard)
 * GET /posts/user?page=1&limit=10
 */
export async function getMyPosts(
  page: number = 1,
  limit: number = 10,
  retries: number = 2,
): Promise<PostsResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(
        `${API_BASE_URL}/posts/user?page=${page}&limit=${limit}`,
        {
          headers: getAuthHeaders(),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch posts: ${response.status} ${response.statusText}`,
        );
      }

      return response.json();
    } catch (error) {
      const err = error as Error;
      lastError = err;

      if (isServerUnavailableError(err)) {
        console.warn(
          `[getMyPosts] Server unavailable (attempt ${attempt + 1}/${retries + 1}):`,
          err.message,
        );

        if (attempt >= retries) {
          throw new ServerUnavailableError();
        }
      } else {
        console.error(
          `[getMyPosts] Attempt ${attempt + 1} failed:`,
          err.message,
        );

        if (attempt >= retries) {
          throw new Error(getUserFriendlyErrorMessage(err));
        }
      }

      if (attempt < retries) {
        const waitTime = 2 ** attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error("Failed to fetch posts after multiple attempts");
}

/**
 * Custom error for server unavailable (sleeping/connection issues)
 */
export class ServerUnavailableError extends Error {
  constructor(
    message: string = "The server is unavailable. It may be sleeping due to inactivity. Please wait a moment and try again.",
  ) {
    super(message);
    this.name = "ServerUnavailableError";
  }
}

/**
 * Check if an error is due to server unavailability (connection reset, abort, etc.)
 */
function isServerUnavailableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes("signal is aborted") ||
    message.includes("connection reset") ||
    message.includes("net::err_connection_reset") ||
    message.includes("net::err") ||
    message.includes("failed to fetch") ||
    message.includes("network error") ||
    message.includes("socket hung up") ||
    error.name === "AbortError"
  );
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyErrorMessage(error: Error): string {
  if (isServerUnavailableError(error)) {
    return "The server is unavailable. This may be because:\n- The server is sleeping (free tier apps sleep after 15 minutes of inactivity)\n- There is a network issue\n\nPlease wait a moment and refresh the page, or contact support if the problem persists.";
  }
  return error.message || "An unexpected error occurred.";
}

/**
 * Get published posts (public feed)
 * GET /posts?page=1&limit=10
 */
export async function getPublishedPosts(
  page: number = 1,
  limit: number = 10,
  retries: number = 2,
): Promise<PostsResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(
        `${API_BASE_URL}/posts?page=${page}&limit=${limit}`,
        {
          headers: getAuthHeaders(),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch published posts: ${response.status} ${response.statusText}`,
        );
      }

      return response.json();
    } catch (error) {
      const err = error as Error;
      lastError = err;

      // Check if it's a server unavailability error
      if (isServerUnavailableError(err)) {
        console.warn(
          `[getPublishedPosts] Server unavailable (attempt ${attempt + 1}/${retries + 1}):`,
          err.message,
        );

        // If this is the last attempt, throw a user-friendly error
        if (attempt >= retries) {
          throw new ServerUnavailableError();
        }
      } else {
        console.error(
          `[getPublishedPosts] Attempt ${attempt + 1} failed:`,
          err.message,
        );

        if (attempt >= retries) {
          throw new Error(getUserFriendlyErrorMessage(err));
        }
      }

      if (attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s...
        const waitTime = 2 ** attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw (
    lastError ||
    new Error("Failed to fetch published posts after multiple attempts")
  );
}

/**
 * Search published posts
 * GET /posts/search?q=query&page=1&limit=10
 */
export async function searchPosts(
  query: string,
  page: number = 1,
  limit: number = 10,
): Promise<PostsResponse> {
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(
    `${API_BASE_URL}/posts/search?q=${encodedQuery}&page=${page}&limit=${limit}`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function uploadProfileImage(
  file: File,
): Promise<{ url: string; publicId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("You must be logged in to upload images");
  }

  const response = await fetch(`${API_BASE_URL}/upload/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed: ${response.status}`);
  }

  return response.json();
}

export async function uploadCoverImage(
  file: File,
): Promise<{ url: string; fileId: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload/cover-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload cover image");
  }

  return response.json();
}

export async function uploadPostImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload/post-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to upload post image" }));
    throw new Error(error.message || "Failed to upload post image");
  }

  return response.json();
}

/**
 * Get tenant's published posts (dashboard)
 * GET /posts/tenant-published?page=1&limit=10
 */
export async function getTenantPublishedPosts(
  page: number = 1,
  limit: number = 10,
): Promise<PostsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/posts/tenant-published?page=${page}&limit=${limit}`,
    { headers: getAuthHeaders() },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tenant published posts");
  }

  return response.json();
}

/**
 * Get all tenant posts (published, drafts, archived)
 * GET /posts/tenant-all?page=1&limit=50
 */
export async function getAllTenantPosts(
  page: number = 1,
  limit: number = 50,
): Promise<PostsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/posts/tenant-all?page=${page}&limit=${limit}`,
    { headers: getAuthHeaders() },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch all tenant posts");
  }

  return response.json();
}

/**
 * Get a single post
 * GET /posts/:id
 */
export async function getPost(
  postId: string,
): Promise<{ post: Post } | { error: string }> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Failed to fetch post" }));
    throw new Error(error.error || "Failed to fetch post");
  }

  const data = await response.json();

  // Apply mapPostData to ensure content is parsed
  if (data.post) {
    return { post: mapPostData(data.post) };
  }

  return { post: mapPostData(data) };
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

/**
 * Toggle like on a post
 * POST /likes/post/:postId/toggle
 */
export async function toggleLike(postId: string): Promise<LikeResponse> {
  const response = await fetch(`${API_BASE_URL}/likes/post/${postId}/toggle`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to toggle like" }));
    throw new Error(error.message || "Failed to toggle like");
  }

  return response.json();
}

export async function getLikeCount(postId: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/likes/post/${postId}/count`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return 0;
  }

  const data = await response.json();
  return data?.likeCount ?? 0;
}

export async function hasUserLiked(postId: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/likes/post/${postId}/status`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data?.liked ?? false;
}

export async function incrementView(
  postId: string,
): Promise<{ viewCount: number }> {
  const response = await fetch(`${API_BASE_URL}/posts/${postId}/view`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to increment view");
  }

  return response.json();
}

export interface Comment {
  _id: string;
  content: string;
  authorId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  postId: string;
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
}

/**
 * Create a comment
 * POST /comments
 */
export async function createComment(
  postId: string,
  content: string,
): Promise<Comment> {
  const response = await fetch(`${API_BASE_URL}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ postId, content }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to create comment" }));
    throw new Error(error.message || "Failed to create comment");
  }

  return response.json();
}

/**
 * Get comments for a post
 * GET /comments/post/:postId
 */
export async function getComments(postId: string): Promise<Comment[]> {
  const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to fetch comments" }));
    throw new Error(error.message || "Failed to fetch comments");
  }

  return response.json();
}

/**
 * Delete a comment
 * DELETE /comments/:id
 */
export async function deleteComment(
  commentId: string,
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to delete comment" }));
    throw new Error(error.message || "Failed to delete comment");
  }

  return response.json();
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  coverImage?: string;
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

export async function getUserProfile(
  userId: string,
  token: string,
): Promise<UserProfile> {
  if (!userId || !token) {
    throw new Error("User ID and token are required");
  }

  const activeToken = token || localStorage.getItem("access_token");

  if (!activeToken) {
    console.error("Get profile failed: No token found.");
    throw new Error("You must be logged in to view your profile");
  }

  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${activeToken}`,
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

  if (!userData || typeof userData !== "object") {
    throw new Error("Invalid profile response format");
  }

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

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    email?: string;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    location?: string;
    website?: string;
    phone?: string;
  },
  token?: string,
): Promise<UserProfile> {
  const activeToken = token || localStorage.getItem("access_token");

  if (!activeToken) {
    console.error("Update failed: No token found.");
    throw new Error("You must be logged in to update your profile");
  }

  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${activeToken}`,
    },
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
}

export async function followUser(
  userId: string,
): Promise<{ following: boolean; followersCount: number }> {
  const response = await fetch(`${API_BASE_URL}/follows/${userId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to follow user" }));
    throw new Error(error.message || "Failed to follow user");
  }

  return response.json();
}

export async function unfollowUser(
  userId: string,
): Promise<{ following: boolean; followersCount: number }> {
  const response = await fetch(`${API_BASE_URL}/follows/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Failed to unfollow user" }));
    throw new Error(error.message || "Failed to unfollow user");
  }

  return response.json();
}

export async function isFollowing(
  userId: string,
): Promise<{ isFollowing: boolean }> {
  const response = await fetch(`${API_BASE_URL}/follows/check/${userId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return { isFollowing: false };
  }

  return response.json();
}

export interface Follower {
  _id: string;
  followerId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface Following {
  _id: string;
  followingId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
}

export async function getFollowers(userId: string): Promise<Follower[]> {
  const response = await fetch(`${API_BASE_URL}/follows/followers/${userId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getFollowing(userId: string): Promise<Following[]> {
  const response = await fetch(`${API_BASE_URL}/follows/following/${userId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
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
  const response = await fetch(`${API_BASE_URL}/posts/user/me`, {
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
): Promise<{ user: UserProfile; posts: Post[] }> {
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

/**
 * Transforms backend response to match Post interface perfectly
 */
export const mapPostData = (data: any): Post => {
  // Handle content parsing - if content is a JSON string, parse it
  let parsedContent = data.content;
  if (typeof data.content === "string") {
    try {
      const parsed = JSON.parse(data.content);
      // Check if it looks like TipTap JSON (has type: 'doc')
      if (parsed && parsed.type === "doc") {
        parsedContent = parsed;
      }
      // Check if it's legacy blocks format { blocks: [] }
      else if (parsed && Array.isArray(parsed.blocks)) {
        parsedContent = parsed;
      }
      // Also handle content array format
      else if (parsed && Array.isArray(parsed.content)) {
        parsedContent = parsed;
      }
    } catch {
      // Not valid JSON, keep as string (HTML content)
    }
  }

  // Ensure image is properly mapped from coverImage
  const image = data.image || data.coverImage || undefined;

  return {
    ...data,
    id: data._id, // Map _id to id
    content: parsedContent,
    image: image,
    title: data.title || "Untitled Story",
  };
};

// ============================================
// Notifications
// ============================================

export interface Notification {
  _id: string;
  userId: string;
  fromUserId?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  type: "like" | "comment" | "follow";
  postId?: {
    _id: string;
    title: string;
  };
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export async function getNotifications(): Promise<NotificationsResponse> {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const response = await fetch(`${API_BASE_URL}/notifications/count`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch unread count");
  }

  return response.json();
}

export async function markNotificationAsRead(
  notificationId: string,
): Promise<{ unreadCount: number }> {
  const response = await fetch(
    `${API_BASE_URL}/notifications/${notificationId}/read`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return response.json();
}

export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
}> {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }

  return response.json();
}

export async function deleteNotification(
  notificationId: string,
): Promise<{ success: boolean }> {
  const response = await fetch(
    `${API_BASE_URL}/notifications/${notificationId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete notification");
  }

  return response.json();
}
