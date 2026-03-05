"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Gavel, PackageOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { Button } from "@/components/common/Button";
import { Tabs } from "@/components/common/Tabs";
import { SkeletonCard } from "@/components/common/Skeleton";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { Loading } from "@/components/common/Loading";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import type { AuctionResponse } from "@/types/auction";
import { getAuctions } from "@/lib/api/auctions";
import { HeroCarousel } from "@/components/auction/HeroCarousel";

const STATUS_TABS = [
  { value: "ACTIVE", label: "진행 중" },
  { value: "COMPLETED", label: "낙찰" },
  { value: "FAILED", label: "유찰" },
  { value: "", label: "전체" },
];

/** DOM 노드 과다 방지: 최대 카드 수 */
const MAX_CARDS = 200;
const PAGE_SIZE = 12;

export default function HomePage() {
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const initialLoad = useRef(true);

  const { getSavedData, restoreScroll } = useScrollRestoration(page + 1);

  // 초기 로드 + 필터 변경 시
  const fetchPage = useCallback(
    async (targetPage: number, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        const data = await getAuctions({
          page: targetPage,
          size: PAGE_SIZE,
          status: statusFilter || undefined,
        });
        setAuctions((prev) => {
          const next = append ? [...prev, ...data.content] : data.content;
          // NFR-2: 최대 카드 수 제한
          return next.slice(0, MAX_CARDS);
        });
        setHasNext(data.hasNext && (!append ? data.content.length > 0 : true));
      } catch {
        // 에러 시 현재 상태 유지
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter],
  );

  // 초기 로드: 스크롤 복원 데이터가 있으면 해당 페이지 수만큼 로드
  useEffect(() => {
    async function init() {
      const saved = getSavedData();
      if (initialLoad.current && saved && saved.loadedPages > 1) {
        initialLoad.current = false;
        setLoading(true);
        try {
          // 저장된 페이지 수만큼 한번에 fetch
          const promises = Array.from({ length: saved.loadedPages }, (_, i) =>
            getAuctions({ page: i, size: PAGE_SIZE, status: statusFilter || undefined }),
          );
          const results = await Promise.all(promises);
          const allAuctions = results.flatMap((r) => r.content).slice(0, MAX_CARDS);
          const lastResult = results[results.length - 1];
          setAuctions(allAuctions);
          setPage(saved.loadedPages - 1);
          setHasNext(lastResult.hasNext);
          setLoading(false);
          // 데이터 로드 완료 후 스크롤 복원
          requestAnimationFrame(() => restoreScroll());
        } catch {
          setLoading(false);
          fetchPage(0);
        }
      } else {
        initialLoad.current = false;
        fetchPage(0);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // 무한 스크롤: 다음 페이지 로드
  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, true);
  }, [page, fetchPage]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasNext,
    loading: loading || loadingMore,
  });

  // Pull-to-refresh: 처음부터 다시 로드
  const handleRefresh = useCallback(async () => {
    setPage(0);
    await fetchPage(0);
  }, [fetchPage]);

  function handleTabChange(value: string) {
    setStatusFilter(value);
    setPage(0);
    setAuctions([]);
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      {/* 히어로 영역 */}
      <section className="bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            얼마에 살 수 있을까?
          </h1>
          <p className="mt-2 text-base text-text-secondary">
            중고 물품을 경매로 합리적인 가격에 거래하세요.
          </p>
          <div className="mt-6">
            <HeroCarousel />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 상태 필터 탭 */}
        <Tabs
          items={STATUS_TABS}
          activeValue={statusFilter}
          onChange={handleTabChange}
          className="mb-6"
        />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </motion.div>
          ) : auctions.length === 0 ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <PackageOpen className="w-12 h-12 text-text-tertiary mb-4" strokeWidth={1.5} />
              <p className="text-lg font-semibold text-text-primary mb-1">
                {statusFilter === "ACTIVE" ? "진행 중인 경매가 없습니다" : "경매가 없습니다"}
              </p>
              <p className="text-sm text-text-tertiary mb-6">
                새로운 상품을 등록하고 경매를 시작해보세요.
              </p>
              <Link href="/products/new">
                <Button variant="primary" size="md">
                  <Gavel className="w-4 h-4 mr-1.5" />
                  상품 등록하기
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {auctions.map((auction) => (
                  <AuctionCard key={auction.id} auction={auction} />
                ))}
              </div>

              {/* 무한 스크롤 sentinel + 로딩 표시 */}
              <div ref={sentinelRef} className="mt-4">
                {loadingMore && <Loading text="더 불러오는 중..." />}
              </div>

              {!hasNext && auctions.length > 0 && (
                <p className="text-center text-sm text-text-tertiary mt-6 mb-2">
                  모든 경매를 불러왔습니다
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PullToRefresh>
  );
}
