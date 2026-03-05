"use client";

import { ReactNode } from "react";
import { useSwipeBack } from "@/hooks/useSwipeBack";

/**
 * 스와이프 뒤로가기 전역 프로바이더.
 * 스와이프 중 시각적 피드백(translateX + 오버레이)을 제공한다.
 */
export function SwipeBackProvider({ children }: { children: ReactNode }) {
  const { swiping, translateX, progress } = useSwipeBack();

  return (
    <>
      {/* 스와이프 중 반투명 오버레이 (이전 페이지 힌트) */}
      {swiping && (
        <div
          className="fixed inset-0 z-[60] pointer-events-none bg-black md:hidden"
          style={{ opacity: 0.3 * (1 - progress) }}
        />
      )}
      <div
        style={
          swiping
            ? {
                transform: `translateX(${translateX}px)`,
                transition: typeof window !== "undefined" && translateX >= window.innerWidth ? "transform 0.2s ease-out" : "none",
              }
            : undefined
        }
      >
        {children}
      </div>
    </>
  );
}
