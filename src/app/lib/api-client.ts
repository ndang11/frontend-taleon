const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
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

export interface Post {
  id: string;
  title: string;
  content: string;
  status: "draft" | "published" | "unpublished";
  createdAt: string;
  updatedAt: string;
  slug: string;
  userId: string;
  tenantId: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
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
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
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
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  return response.json();
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  status?: "draft" | "published" | "unpublished";
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
