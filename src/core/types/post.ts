// ============================================
// Post Types (Taleon Posts API)
// ============================================

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
  isPublic?: boolean;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  tags?: string[];
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePostRequest {
  title: string;
  content: PostContent;
  category?: string;
  image?: string;
  subtitle?: string;
  status?: "draft" | "published";
}

export interface UpdatePostRequest {
  title?: string;
  content?: PostContent;
  category?: string;
  image?: string;
  subtitle?: string;
}

// ============================================
// Like Types
// ============================================

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

// ============================================
// Comment Types
// ============================================

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
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
}
