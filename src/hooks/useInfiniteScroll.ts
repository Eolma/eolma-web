"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  /** 다음 페이지 로드 함수 */
  onLoadMore: () => void;
  /** 다음 페이지가 존재하는지 */
  hasNext: boolean;
  /** 현재 로딩 중인지 */
  loading: boolean;
  /** IntersectionObserver rootMargin (기본: 200px) */
  rootMargin?: string;
}

/**
 * IntersectionObserver 기반 무한 스크롤 훅.
 * sentinel ref를 반환하며, 해당 요소가 뷰포트에 진입하면 onLoadMore를 호출한다.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasNext,
  loading,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  const observe = useCallback(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!hasNext || loading) return;
    return observe();
  }, [hasNext, loading, observe]);

  return sentinelRef;
}
