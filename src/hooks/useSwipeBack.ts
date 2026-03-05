"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

const EDGE_WIDTH = 20; // 좌측 가장자리 감지 영역 (px)
const SWIPE_THRESHOLD = 100; // 스와이프 완료 임계값 (px)
const VELOCITY_THRESHOLD = 300; // 빠른 스와이프 임계값 (px/s)

interface SwipeBackState {
  swiping: boolean;
  translateX: number;
}

/**
 * 좌측 가장자리 스와이프 뒤로가기 훅.
 * 화면 좌측 20px 영역에서 시작하는 우측 스와이프만 감지한다.
 * 모바일에서만 동작 (md breakpoint 이상 비활성).
 */
export function useSwipeBack() {
  const router = useRouter();
  const [state, setState] = useState<SwipeBackState>({ swiping: false, translateX: 0 });

  // ref로 제스처 상태 추적 (이벤트 리스너 안정성)
  const startX = useRef(0);
  const startTime = useRef(0);
  const isEdgeSwipe = useRef(false);
  const currentTranslateX = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.innerWidth >= 768) return;

    const touchX = e.touches[0].clientX;
    if (touchX <= EDGE_WIDTH) {
      isEdgeSwipe.current = true;
      startX.current = touchX;
      startTime.current = Date.now();
      currentTranslateX.current = 0;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isEdgeSwipe.current) return;

    const currentX = e.touches[0].clientX;
    const distance = Math.max(0, currentX - startX.current);

    if (distance > 10) {
      e.preventDefault();
      currentTranslateX.current = distance;
      setState({ swiping: true, translateX: distance });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isEdgeSwipe.current) return;

    const translateX = currentTranslateX.current;
    const elapsed = Date.now() - startTime.current;
    const velocity = (translateX / elapsed) * 1000;

    if (translateX >= SWIPE_THRESHOLD || velocity >= VELOCITY_THRESHOLD) {
      setState({ swiping: true, translateX: window.innerWidth });
      setTimeout(() => {
        router.back();
        setState({ swiping: false, translateX: 0 });
      }, 200);
    } else {
      setState({ swiping: false, translateX: 0 });
    }

    isEdgeSwipe.current = false;
    currentTranslateX.current = 0;
  }, [router]);

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    swiping: state.swiping,
    translateX: state.translateX,
    /** 현재 스와이프 진행 비율 (0~1) */
    progress: Math.min(state.translateX / SWIPE_THRESHOLD, 1),
  };
}
