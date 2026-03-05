"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Gavel, PackageOpen } from "lucide-react";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { Button } from "@/components/common/Button";
import { Tabs } from "@/components/common/Tabs";
import { SkeletonCard } from "@/components/common/Skeleton";
import type { AuctionResponse } from "@/types/auction";
import { getAuctions } from "@/lib/api/auctions";

/** 경매 상태 필터 탭 항목 */
const STATUS_TABS = [
  { value: "ACTIVE", label: "진행 중" },
  { value: "COMPLETED", label: "낙찰" },
  { value: "FAILED", label: "유찰" },
  { value: "", label: "전체" },
];

export default function HomePage() {
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  useEffect(() => {
    async function fetchAuctions() {
      setLoading(true);
      try {
        const data = await getAuctions({ page, size: 12, status: statusFilter || undefined });
        setAuctions(data.content);
        setHasNext(data.hasNext);
      } catch {
        // 에러 시 빈 목록
      } finally {
        setLoading(false);
      }
    }
    fetchAuctions();
  }, [page, statusFilter]);

  function handleTabChange(value: string) {
    setStatusFilter(value);
    setPage(0);
  }

  return (
    <div>
      {/* 히어로 영역 */}
      <section className="bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            얼마에 살 수 있을까?
          </h1>
          <p className="mt-2 text-base text-text-secondary">
            중고 물품을 경매로 합리적인 가격에 거래하세요.
          </p>
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

        {/* 로딩 스켈레톤 */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
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
          </div>
        ) : (
          <>
            {/* 경매 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center gap-3 mt-8">
              <Button
                variant="secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                이전
              </Button>
              <span className="text-sm text-text-secondary tabular-nums">
                {page + 1} 페이지
              </span>
              <Button
                variant="secondary"
                disabled={!hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
