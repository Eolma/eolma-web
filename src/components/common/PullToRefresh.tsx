"use client";

import { ReactNode } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

/**
 * Pull-to-refresh UI 래퍼 컴포넌트.
 * 상단에 스피너와 상태 텍스트를 표시한다.
 */
export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { containerRef, pullDistance, refreshing, triggered } = usePullToRefresh({
    onRefresh,
  });

  const showIndicator = pullDistance > 0 || refreshing;

  return (
    <div ref={containerRef} className="overscroll-none">
      {/* Pull indicator */}
      {showIndicator && (
        <div
          className="flex items-center justify-center overflow-hidden transition-[height] duration-100"
          style={{ height: pullDistance }}
        >
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <svg
              className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              style={
                !refreshing
                  ? { transform: `rotate(${(pullDistance / 50) * 180}deg)`, transition: "transform 0.1s" }
                  : undefined
              }
            >
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            </svg>
            <span>
              {refreshing
                ? "새로고침 중..."
                : triggered
                  ? "놓으면 새로고침"
                  : "당겨서 새로고침"}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
