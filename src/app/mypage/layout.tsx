"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Loading } from "@/components/common/Loading";

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuthStore();

  if (isLoading) return <Loading />;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
        <Link href="/login" className="text-indigo-600 hover:underline">
          로그인
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
