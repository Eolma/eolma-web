"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PackageOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { Tabs } from "@/components/common/Tabs";
import { SkeletonCard } from "@/components/common/Skeleton";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { Loading } from "@/components/common/Loading";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import type { AuctionResponse } from "@/types/auction";
import { getAuctions } from "@/lib/api/auctions";

const STATUS_TABS = [
  { value: "ACTIVE", label: "진행 중" },
  { value: "COMPLETED", label: "낙찰" },
  { value: "FAILED", label: "유찰" },
  { value: "", label: "전체" },
];

const MAX_CARDS = 200;
const PAGE_SIZE = 20;

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const initialLoad = useRef(true);

  const { getSavedData, restoreScroll } = useScrollRestoration(page + 1);

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

  useEffect(() => {
    async function init() {
      const saved = getSavedData();
      if (initialLoad.current && saved && saved.loadedPages > 1) {
        initialLoad.current = false;
        setLoading(true);
        try {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-4">경매 목록</h1>

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
              <p className="text-lg font-semibold text-text-primary mb-1">경매가 없습니다</p>
              <p className="text-sm text-text-tertiary">조건에 맞는 경매를 찾지 못했습니다.</p>
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
