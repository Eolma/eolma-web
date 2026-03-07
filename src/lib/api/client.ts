import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from "../utils/token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export class ApiException extends Error {
  constructor(
    public status: number,
    public detail: string,
    public errorType?: string,
  ) {
    super(detail);
    this.name = "ApiException";
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function ensureValidToken(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;

  if (!isTokenExpired(token)) return token;

  // 토큰 갱신이 이미 진행 중이면 기존 Promise 재사용
  if (isRefreshing && refreshPromise) {
    const success = await refreshPromise;
    return success ? getAccessToken() : null;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken();
  const success = await refreshPromise;
  isRefreshing = false;
  refreshPromise = null;

  if (!success) {
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return getAccessToken();
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = await ensureValidToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = "An error occurred";
    let errorType: string | undefined;

    try {
      const error: ApiError = await res.json();
      detail = error.detail;
      errorType = error.type;
    } catch {
      // JSON 파싱 실패 시 기본 에러 메시지 사용
    }

    // 401이면서 토큰이 있었다면 갱신 시도 후 재요청
    if (res.status === 401 && token) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = getAccessToken();
        headers["Authorization"] = `Bearer ${newToken}`;
        const retryRes = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          headers,
        });
        if (retryRes.ok) {
          if (retryRes.status === 204) return undefined as T;
          return retryRes.json();
        }
      }
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    throw new ApiException(res.status, detail, errorType);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}
