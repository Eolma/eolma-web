"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Loading } from "@/components/common/Loading";
import { Card } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Badge } from "@/components/common/Badge";
import { formatDateTime } from "@/lib/utils/format";
import { getLinkedAccounts } from "@/lib/api/auth";
import { getOAuthUrl } from "@/lib/oauth/config";
import type { LinkedAccount, AuthProvider } from "@/types/user";
import { ChevronRight, Plus, Package, Gavel } from "lucide-react";

const PROVIDER_LABELS: Record<AuthProvider, string> = {
  LOCAL: "이메일/비밀번호",
  GOOGLE: "Google",
  KAKAO: "카카오",
};

const PROVIDER_BADGE_VARIANT: Record<AuthProvider, "neutral" | "info" | "warning"> = {
  LOCAL: "neutral",
  GOOGLE: "info",
  KAKAO: "warning",
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
    return <p className="text-sm text-text-tertiary py-2">로딩 중...</p>;
  }

  const linkedProviders = new Set(accounts.map((a) => a.provider));
  const availableProviders: Exclude<AuthProvider, "LOCAL">[] = (["GOOGLE", "KAKAO"] as const).filter(
    (p) => !linkedProviders.has(p),
  );

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">연결된 소셜 계정</h2>

      {accounts.length === 0 ? (
        <p className="text-sm text-text-secondary mb-4">연결된 소셜 계정이 없습니다.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {accounts.map((account) => (
            <Card key={account.provider}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={PROVIDER_BADGE_VARIANT[account.provider]}>
                    {PROVIDER_LABELS[account.provider]}
                  </Badge>
                  <span className="text-sm text-text-secondary">
                    {formatDateTime(account.linkedAt)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {availableProviders.length > 0 && (
        <div className="space-y-2">
          {availableProviders.map((provider) => (
            <button
              key={provider}
              onClick={() => (window.location.href = getOAuthUrl(provider))}
              className="w-full text-left flex items-center justify-between p-4 border border-dashed border-border rounded-xl hover:bg-bg-secondary transition-colors text-sm text-text-secondary"
            >
              <span>{PROVIDER_LABELS[provider]} 연결하기</span>
              <Plus className="w-4 h-4 text-text-tertiary" />
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
        <p className="text-text-secondary mb-4">로그인이 필요합니다.</p>
        <Link href="/login" className="text-primary hover:underline">
          로그인
        </Link>
      </div>
    );
  }

  const menuItems = [
    { href: "/mypage/products", label: "내 상품", description: "등록한 상품 관리", icon: Package },
    { href: "/mypage/bids", label: "내 입찰", description: "참여한 경매 목록", icon: Gavel },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">마이페이지</h1>

      {/* 프로필 카드 */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <Avatar
            name={user.nickname ?? user.email}
            size="lg"
          />
          <div className="min-w-0">
            <p className="font-semibold text-text-primary truncate">
              {user.nickname ?? "닉네임 미설정"}
            </p>
            <p className="text-sm text-text-secondary truncate">{user.email}</p>
            <p className="text-xs text-text-tertiary mt-1">
              가입일: {formatDateTime(user.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      {/* 메뉴 */}
      <div className="space-y-3">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card interactive>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{item.label}</p>
                    <p className="text-sm text-text-secondary">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-tertiary" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <SocialAccountsSection />
    </div>
  );
}
