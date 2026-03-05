"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* 로고 */}
          <Link href="/" className="text-xl font-bold text-primary">
            얼마
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              경매 목록
            </Link>
            <Link
              href="/products/new"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              상품 등록
            </Link>
          </nav>

          {/* 데스크톱 우측 영역 */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link
                  href="/mypage"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  {user?.nickname}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-primary text-text-on-primary px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* 모바일: 테마 토글만 표시 (네비게이션은 BottomNav로 이동) */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 (데스크톱에서는 숨김) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-bg">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/"
              className="block py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              경매 목록
            </Link>
            <Link
              href="/products/new"
              className="block py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              상품 등록
            </Link>
            <div className="border-t border-border pt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/mypage"
                    className="block py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user?.nickname}
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="block w-full text-left py-2 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="block py-2 text-sm text-primary hover:text-primary-hover transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
