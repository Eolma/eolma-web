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
 *
 * Save 전략:
 * - scroll 이벤트 발생 시 로컬 변수에 scrollY를 기록하되, 0은 무시한다.
 *   (Next.js SPA 네비게이션 시 scroll-to-top이 발생해 0이 들어오는 것을 방지)
 * - 150ms debounce로 sessionStorage에 기록한다.
 * - pagehide(탭 전환, 앱 전환)와 cleanup(SPA 네비게이션) 시에도 저장한다.
 *
 * Restore 전략:
 * - 페이지 컴포넌트에서 데이터 fetch 완료 후 restoreScroll()을 호출한다.
 * - setTimeout(100ms) + rAF로 React 렌더링 완료를 대기한 뒤 scrollTo한다.
 */
export function useScrollRestoration(loadedPages: number = 1) {
  const pathname = usePathname();
  const restored = useRef(false);
  const loadedPagesRef = useRef(loadedPages);
  loadedPagesRef.current = loadedPages;

  useEffect(() => {
    const key = STORAGE_KEY_PREFIX + pathname;
    // 마지막으로 관측된 유효한 scrollY (0 제외)
    let lastScrollY = window.scrollY || 0;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function writeToStorage() {
      if (lastScrollY <= 0) return;
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({ scrollY: lastScrollY, loadedPages: loadedPagesRef.current }),
        );
      } catch {
        // sessionStorage 용량 초과 무시
      }
    }

    function handleScroll() {
      const y = window.scrollY;
      // scroll-to-top(SPA 네비게이션)은 무시하고 마지막 유효 위치만 보존
      if (y > 0) {
        lastScrollY = y;
      }
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(writeToStorage, 150);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", writeToStorage);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pagehide", writeToStorage);
      // SPA 네비게이션 시 마지막 유효 위치 저장
      writeToStorage();
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
