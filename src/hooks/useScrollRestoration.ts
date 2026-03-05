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

  // pathnameRef는 렌더 시 동기적으로 갱신된다.
  // 네비게이션이 발생하면 React 렌더 단계에서 즉시 업데이트되므로,
  // 이후 발생하는 scroll 이벤트(scroll-to-top 등)에서
  // 이전 경로의 저장값이 덮어씌워지는 것을 방지할 수 있다.
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    const capturedPathname = pathname;
    let rafId: number | null = null;

    function savePosition() {
      // 네비게이션 중이면 저장하지 않음
      // (pathnameRef는 렌더 시 이미 새 경로로 갱신됨)
      if (pathnameRef.current !== capturedPathname) return;

      const data: ScrollData = {
        scrollY: window.scrollY,
        loadedPages: loadedPagesRef.current,
      };
      try {
        sessionStorage.setItem(STORAGE_KEY_PREFIX + capturedPathname, JSON.stringify(data));
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
