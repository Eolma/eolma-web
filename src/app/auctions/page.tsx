"use client";

import { useState, useEffect } from "react";
import { PackageOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { Tabs } from "@/components/common/Tabs";
import { SkeletonCard } from "@/components/common/Skeleton";
import { Button } from "@/components/common/Button";
import type { AuctionResponse } from "@/types/auction";
import { getAuctions } from "@/lib/api/auctions";

const STATUS_TABS = [
  { value: "ACTIVE", label: "진행 중" },
  { value: "COMPLETED", label: "낙찰" },
  { value: "FAILED", label: "유찰" },
  { value: "", label: "전체" },
];

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const data = await getAuctions({ page, size: 20, status: statusFilter || undefined });
        setAuctions(data.content);
        setHasNext(data.hasNext);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [page, statusFilter]);

  function handleTabChange(value: string) {
    setStatusFilter(value);
    setPage(0);
  }

  return (
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
          <div className="flex justify-center items-center gap-3 mt-8">
            <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              이전
            </Button>
            <span className="text-sm text-text-secondary">{page + 1} 페이지</span>
            <Button variant="secondary" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
              다음
            </Button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
