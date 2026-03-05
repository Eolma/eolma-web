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

  // 브라우저 기본 스크롤 복원 비활성화 (커스텀 복원과 경쟁 방지)
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = "auto";
    };
  }, []);

  // 마운트 시점에 저장된 데이터를 캐시 (scroll handler가 덮어쓰기 전에 확보)
  const cachedData = useRef<ScrollData | null>(null);
  const cachedDataLoaded = useRef(false);
  if (!cachedDataLoaded.current) {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + pathname);
      cachedData.current = raw ? JSON.parse(raw) : null;
    } catch {
      cachedData.current = null;
    }
    cachedDataLoaded.current = true;
  }

  useEffect(() => {
    const key = STORAGE_KEY_PREFIX + pathname;
    // 마지막으로 관측된 유효한 scrollY (0 제외)
    let lastScrollY = window.scrollY || 0;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function writeToStorage() {
      // 복원 완료 전에는 저장하지 않음 (race condition 방지)
      if (!restored.current) return;
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
      writeToStorage();
    };
  }, [pathname]);

  /** 저장된 스크롤 데이터 가져오기 (캐시된 값 반환) */
  function getSavedData(): ScrollData | null {
    return cachedData.current;
  }

  /** 저장된 스크롤 위치로 복원 (DOM 높이 충분할 때까지 재시도) */
  function restoreScroll() {
    if (restored.current) return;
    restored.current = true;

    const data = cachedData.current;
    if (!data || data.scrollY <= 0) return;

    const target = data.scrollY;
    let attempts = 0;
    const maxAttempts = 10;

    function tryScroll() {
      window.scrollTo(0, target);
      // 실제 스크롤 위치가 목표에 근접했거나, 최대 시도 횟수 도달 시 중단
      if (Math.abs(window.scrollY - target) < 10 || attempts >= maxAttempts) return;
      attempts++;
      requestAnimationFrame(tryScroll);
    }

    // 첫 시도는 rAF 한 프레임 대기 후
    requestAnimationFrame(tryScroll);
  }

  return { getSavedData, restoreScroll };
}
