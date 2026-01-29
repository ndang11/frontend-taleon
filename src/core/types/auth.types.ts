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
    email: string;
    name: string;
    tenantId: string;
  };
}
