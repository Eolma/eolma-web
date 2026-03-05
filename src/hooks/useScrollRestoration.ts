"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY_PREFIX = "scroll_";

interface ScrollData {
  scrollY: number;
  loadedPages: number;
}

/**
 * 페이지별 스크롤 위치 복원 훅.
 * sessionStorage에 pathname별 scrollY와 로드된 페이지 수를 저장한다.
 * 무한 스크롤과 연계하여 복원 시 필요한 페이지 수를 함께 관리한다.
 */
export function useScrollRestoration(loadedPages: number = 1) {
  const pathname = usePathname();
  const restored = useRef(false);
  const loadedPagesRef = useRef(loadedPages);
  loadedPagesRef.current = loadedPages;

  // scroll 이벤트로 지속적으로 위치 추적 (rAF throttle)
  // App Router에서는 cleanup 시점에 scrollY가 이미 변경되므로,
  // 스크롤할 때마다 최신 위치를 저장해둔다.
  useEffect(() => {
    let rafId: number | null = null;

    function savePosition() {
      const data: ScrollData = {
        scrollY: window.scrollY,
        loadedPages: loadedPagesRef.current,
      };
      try {
        sessionStorage.setItem(STORAGE_KEY_PREFIX + pathname, JSON.stringify(data));
      } catch {
        // sessionStorage 용량 초과 무시
      }
    }

    function handleScroll() {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        savePosition();
        rafId = null;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", savePosition);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", savePosition);
    };
  }, [pathname]);

  /** 저장된 스크롤 데이터 가져오기 */
  function getSavedData(): ScrollData | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + pathname);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /** 저장된 스크롤 위치로 복원 */
  function restoreScroll() {
    if (restored.current) return;
    restored.current = true;

    const data = getSavedData();
    if (data && data.scrollY > 0) {
      // React 렌더링 완료 대기 후 스크롤 복원
      setTimeout(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, data.scrollY);
        });
      }, 100);
    }
  }

  return { getSavedData, restoreScroll };
}
