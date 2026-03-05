"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Loading } from "@/components/common/Loading";
import { formatDateTime } from "@/lib/utils/format";
import { getLinkedAccounts } from "@/lib/api/auth";
import { getOAuthUrl } from "@/lib/oauth/config";
import type { LinkedAccount, AuthProvider } from "@/types/user";

const PROVIDER_LABELS: Record<AuthProvider, string> = {
  LOCAL: "이메일/비밀번호",
  GOOGLE: "Google",
  KAKAO: "카카오",
};

const PROVIDER_COLORS: Record<AuthProvider, string> = {
  LOCAL: "bg-gray-100 text-gray-700",
  GOOGLE: "bg-white text-gray-700 border border-gray-200",
  KAKAO: "text-[#191919]",
};

function SocialAccountsSection() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLinkedAccounts()
      .then(setAccounts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-400 py-2">로딩 중...</div>;
  }

  const linkedProviders = new Set(accounts.map((a) => a.provider));
  const availableProviders: Exclude<AuthProvider, "LOCAL">[] = (["GOOGLE", "KAKAO"] as const).filter(
    (p) => !linkedProviders.has(p),
  );

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">연결된 소셜 계정</h2>

      {accounts.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">연결된 소셜 계정이 없습니다.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {accounts.map((account) => (
            <div
              key={account.provider}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${PROVIDER_COLORS[account.provider]}`}
                  style={account.provider === "KAKAO" ? { backgroundColor: "#FEE500" } : undefined}
                >
                  {PROVIDER_LABELS[account.provider]}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDateTime(account.linkedAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {availableProviders.length > 0 && (
        <div className="space-y-2">
          {availableProviders.map((provider) => (
            <button
              key={provider}
              onClick={() => (window.location.href = getOAuthUrl(provider))}
              className="w-full text-left flex items-center justify-between p-3 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600"
            >
              <span>{PROVIDER_LABELS[provider]} 연결하기</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyPage() {
  const { user, isLoading, isAuthenticated } = useAuthStore();

  if (isLoading) return <Loading />;

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
        <Link href="/login" className="text-indigo-600 hover:underline">
          로그인
        </Link>
      </div>
    );
  }

  const menuItems = [
    { href: "/mypage/products", label: "내 상품", description: "등록한 상품 관리" },
    { href: "/mypage/bids", label: "내 입찰", description: "참여한 경매 목록" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">마이페이지</h1>

      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-indigo-600">
              {(user.nickname ?? user.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.nickname ?? "닉네임 미설정"}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              가입일: {formatDateTime(user.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <SocialAccountsSection />
    </div>
  );
}
