"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loading } from "@/components/common/Loading";
import { AccountLinkModal } from "@/components/auth/AccountLinkModal";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ApiException } from "@/lib/api/client";
import type { AuthProvider, AccountLinkInfo } from "@/types/user";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthLogin = useAuthStore((s) => s.oauthLogin);

  const [error, setError] = useState<string | null>(null);
  const [linkInfo, setLinkInfo] = useState<AccountLinkInfo | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      setError("잘못된 요청입니다.");
      return;
    }

    const provider = state as Exclude<AuthProvider, "LOCAL">;
    if (provider !== "GOOGLE" && provider !== "KAKAO") {
      setError("지원하지 않는 로그인 방식입니다.");
      return;
    }

    (async () => {
      try {
        const res = await oauthLogin(provider, code);

        if (res.linkInfo) {
          setLinkInfo(res.linkInfo);
          return;
        }

        if (res.nicknameRequired) {
          router.replace("/auth/set-nickname");
          return;
        }

        router.replace("/");
      } catch (err) {
        if (err instanceof ApiException) {
          setError(err.detail);
        } else {
          setError("소셜 로그인 처리 중 오류가 발생했습니다.");
        }
      }
    })();
  }, [searchParams, oauthLogin, router]);

  // 계정 연결 모달
  if (linkInfo) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <AccountLinkModal
          linkInfo={linkInfo}
          onSuccess={() => router.replace("/")}
          onCancel={() => router.replace("/login")}
        />
      </div>
    );
  }

  // 에러
  if (error) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={() => router.replace("/login")}
            className="text-primary hover:underline text-sm"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 처리 중
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <Loading text="로그인 처리 중..." />
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
          <Loading text="로그인 처리 중..." />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
