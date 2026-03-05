import type { AuthProvider } from "@/types/user";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const REDIRECT_URI = `${APP_URL}/auth/oauth/callback`;

const OAUTH_CONFIG: Record<
  Exclude<AuthProvider, "LOCAL">,
  { authUrl: string; clientId: string; params: Record<string, string> }
> = {
  GOOGLE: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    params: {
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    },
  },
  KAKAO: {
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "",
    params: {
      response_type: "code",
    },
  },
};

export function getOAuthUrl(provider: Exclude<AuthProvider, "LOCAL">): string {
  const config = OAUTH_CONFIG[provider];
  const params = new URLSearchParams({
    ...config.params,
    client_id: config.clientId,
    redirect_uri: REDIRECT_URI,
    state: provider,
  });

  return `${config.authUrl}?${params.toString()}`;
}

export function getRedirectUri(): string {
  return REDIRECT_URI;
}
