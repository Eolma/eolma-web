"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UsePullToRefreshOptions {
  /** 새로고침 실행 함수 */
  onRefresh: () => Promise<void>;
  /** 트리거 임계값 (기본: 50px) */
  threshold?: number;
}

interface PullToRefreshState {
  pullDistance: number;
  refreshing: boolean;
  triggered: boolean;
}

/**
 * 터치 이벤트 기반 Pull-to-refresh 훅.
 * 스크롤이 최상단(scrollTop === 0)일 때만 활성화된다.
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 50,
}: UsePullToRefreshOptions) {
  const [state, setState] = useState<PullToRefreshState>({
    pullDistance: 0,
    refreshing: false,
    triggered: false,
  });

  // ref로 제스처 상태 추적 (이벤트 리스너 안정성)
  const startY = useRef(0);
  const isPulling = useRef(false);
  const pullDistanceRef = useRef(0);
  const triggeredRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    isPulling.current = true;
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling.current) return;
      if (window.scrollY > 0) {
        isPulling.current = false;
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY.current);

      if (distance > 0) {
        e.preventDefault();
      }

      // 저항감 적용: 실제 이동 거리의 40%만 반영
      const pullDistance = Math.min(distance * 0.4, 100);
      const triggered = pullDistance >= threshold;

      pullDistanceRef.current = pullDistance;
      triggeredRef.current = triggered;
      setState((s) => ({ ...s, pullDistance, triggered }));
    },
    [threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (triggeredRef.current) {
      setState({ refreshing: true, pullDistance: threshold, triggered: false });
      try {
        await onRefreshRef.current();
      } finally {
        setState({ pullDistance: 0, refreshing: false, triggered: false });
      }
    } else {
      setState({ pullDistance: 0, refreshing: false, triggered: false });
    }

    pullDistanceRef.current = 0;
    triggeredRef.current = false;
  }, [threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    pullDistance: state.pullDistance,
    refreshing: state.refreshing,
    triggered: state.triggered,
  };
}
