"use client";

import { useState, useEffect } from "react";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/common/Button";
import type { AuctionResponse } from "@/types/auction";
import { getAuctions } from "@/lib/api/auctions";

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

  const filters = [
    { value: "ACTIVE", label: "진행 중" },
    { value: "COMPLETED", label: "낙찰" },
    { value: "FAILED", label: "유찰" },
    { value: "", label: "전체" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">경매 목록</h1>
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(0); }}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                statusFilter === f.value
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : auctions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">경매가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-8">
            <Button
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </Button>
            <span className="flex items-center text-sm text-gray-500">
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
  );
}
