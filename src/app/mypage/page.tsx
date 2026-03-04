"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Loading } from "@/components/common/Loading";
import { formatDateTime } from "@/lib/utils/format";

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
              {user.nickname.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.nickname}</p>
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
    </div>
  );
}
