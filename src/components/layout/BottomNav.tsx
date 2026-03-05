"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  /** pathname 매칭 패턴 (startsWith) */
  matchPrefix: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", icon: Home, matchPrefix: "/" },
  { href: "/mypage", label: "마이", icon: User, matchPrefix: "/mypage" },
];

/** 모바일 하단 네비게이션 (당근/토스 스타일) */
export function BottomNav() {
  const pathname = usePathname();

  /** 현재 경로가 네비 아이템에 매칭되는지 확인 */
  function isActive(item: NavItem): boolean {
    // 홈은 정확히 "/" 일 때만 활성
    if (item.matchPrefix === "/") return pathname === "/";
    return pathname.startsWith(item.matchPrefix);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active
                  ? "text-primary"
                  : "text-text-tertiary"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
