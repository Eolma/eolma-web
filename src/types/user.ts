export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MemberResponse {
  id: string;
  email: string;
  nickname: string | null;
  profileImage: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// OAuth
export type AuthProvider = "LOCAL" | "GOOGLE" | "KAKAO";

export interface OAuthLoginRequest {
  provider: AuthProvider;
  code: string;
  redirectUri: string;
}

export interface OAuthLinkRequest {
  linkToken: string;
  password?: string;
}

export interface SetNicknameRequest {
  nickname: string;
}

export interface AccountLinkInfo {
  linkToken: string;
  email: string;
  existingProviders: AuthProvider[];
  hasPassword: boolean;
}

export interface OAuthLoginResponse {
  accessToken?: string;
  refreshToken?: string;
  nicknameRequired?: boolean;
  linkToken?: string;
  existingProviders?: string[];
  email?: string;
}

export interface LinkedAccount {
  provider: AuthProvider;
  linkedAt: string;
}
