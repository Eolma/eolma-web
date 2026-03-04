import type { LoginRequest, LoginResponse, RegisterRequest, MemberResponse } from "@/types/user";
import { apiClient } from "./client";

export async function login(req: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function register(req: RegisterRequest): Promise<void> {
  return apiClient<void>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function logout(): Promise<void> {
  return apiClient<void>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function getMyProfile(): Promise<MemberResponse> {
  return apiClient<MemberResponse>("/api/v1/members/me");
}

export async function updateMyProfile(data: {
  nickname?: string;
  profileImage?: string;
}): Promise<MemberResponse> {
  return apiClient<MemberResponse>("/api/v1/members/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
