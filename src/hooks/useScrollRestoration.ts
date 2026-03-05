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

  // 스크롤 위치 저장 (페이지 이탈 시)
  useEffect(() => {
    function handleSave() {
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

    window.addEventListener("beforeunload", handleSave);
    return () => {
      // cleanup 시 현재 스크롤 저장 (SPA 네비게이션)
      handleSave();
      window.removeEventListener("beforeunload", handleSave);
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
