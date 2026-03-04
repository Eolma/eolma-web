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
  id: number;
  email: string;
  nickname: string;
  profileImage: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
