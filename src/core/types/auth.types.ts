export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  blogName: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    _id?: string;
    email: string;
    name: string;
    tenantId: string;
    avatar?: string;
    coverImage?: string;
    bio?: string;
    location?: string;
    website?: string;
    phone?: string;
    followersCount?: number;
    followingCount?: number;
  };
}
