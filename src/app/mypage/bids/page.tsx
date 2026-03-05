"use client";

import { useState, useEffect } from "react";
import { AuctionCard } from "@/components/auction/AuctionCard";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/common/Button";
import type { AuctionResponse } from "@/types/auction";
import { getMyAuctions } from "@/lib/api/auctions";

export default function MyBidsPage() {
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const data = await getMyAuctions({ page, size: 12 });
        setAuctions(data.content);
        setHasNext(data.hasNext);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">내 입찰</h1>

      {loading ? (
        <Loading />
      ) : auctions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary">참여한 경매가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-8">
            <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              이전
            </Button>
            <span className="flex items-center text-sm text-text-secondary">{page + 1} 페이지</span>
            <Button variant="secondary" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
              다음
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
