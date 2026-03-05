"use client";

import { create } from "zustand";
import type { MemberResponse, OAuthLoginResponse, AuthProvider } from "@/types/user";
import { getAccessToken, setTokens, clearTokens } from "../utils/token";
import * as authApi from "../api/auth";
import { getRedirectUri } from "../oauth/config";

interface AuthState {
  user: MemberResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  initialize: () => Promise<void>;

  // OAuth
  oauthLogin: (provider: Exclude<AuthProvider, "LOCAL">, code: string) => Promise<OAuthLoginResponse>;
  linkAccount: (linkToken: string, password?: string) => Promise<void>;
  setNickname: (nickname: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const res = await authApi.login({ email, password });
    setTokens(res.accessToken, res.refreshToken);
    const user = await authApi.getMyProfile();
    set({ user, isAuthenticated: true });
  },

  register: async (email, password, nickname) => {
    await authApi.register({ email, password, nickname });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // 로그아웃 API 실패해도 로컬 토큰은 삭제
    }
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const user = await authApi.getMyProfile();
      set({ user, isAuthenticated: true });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  initialize: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.getMyProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // OAuth
  oauthLogin: async (provider, code) => {
    const res = await authApi.oauthLogin({
      provider,
      code,
      redirectUri: getRedirectUri(),
    });

    // 토큰이 있으면 저장 + 사용자 정보 로드
    if (res.tokens) {
      setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      const user = await authApi.getMyProfile();
      set({ user, isAuthenticated: true });
    }

    return res;
  },

  linkAccount: async (linkToken, password) => {
    const res = await authApi.linkAccount({ linkToken, password });
    setTokens(res.accessToken, res.refreshToken);
    const user = await authApi.getMyProfile();
    set({ user, isAuthenticated: true });
  },

  setNickname: async (nickname) => {
    const res = await authApi.setNickname({ nickname });
    setTokens(res.accessToken, res.refreshToken);
    const user = await authApi.getMyProfile();
    set({ user, isAuthenticated: true });
  },
}));
