"use client";

import { useState, useEffect, FormEvent } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { formatPrice } from "@/lib/utils/format";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface BidPanelProps {
  currentPrice: number;
  minBidUnit: number;
  instantPrice: number | null;
  bidCount: number;
  isActive: boolean;
  isConnected: boolean;
  onBid: (amount: number) => void;
  lastBidResult?: { status: string; message?: string } | null;
}

export function BidPanel({
  currentPrice,
  minBidUnit,
  instantPrice,
  bidCount,
  isActive,
  isConnected,
  onBid,
  lastBidResult,
}: BidPanelProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const nextMinBid = currentPrice + minBidUnit;
  const [bidAmount, setBidAmount] = useState(String(nextMinBid));

  useEffect(() => {
    setBidAmount(String(nextMinBid));
  }, [nextMinBid]);

  function handleBid(e: FormEvent) {
    e.preventDefault();
    const amount = Number(bidAmount);
    if (amount >= nextMinBid) {
      onBid(amount);
    }
  }

  function handleInstantBuy() {
    if (instantPrice) {
      onBid(instantPrice);
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <div>
        <p className="text-xs text-gray-500 mb-1">현재 최고가</p>
        <p className="text-2xl font-bold text-indigo-600">{formatPrice(currentPrice)}</p>
        <p className="text-sm text-gray-500 mt-1">입찰 수: {bidCount}회</p>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 text-yellow-700 text-sm px-3 py-2 rounded-lg">
          서버 연결 중...
        </div>
      )}

      {lastBidResult && lastBidResult.status === "REJECTED" && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
          {lastBidResult.message || "입찰에 실패했습니다."}
        </div>
      )}

      {lastBidResult && lastBidResult.status === "ACCEPTED" && (
        <div className="bg-green-50 text-green-600 text-sm px-3 py-2 rounded-lg">
          입찰이 완료되었습니다.
        </div>
      )}

      {isActive && isAuthenticated && (
        <>
          <form onSubmit={handleBid} className="space-y-3">
            <Input
              label="입찰가"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={nextMinBid}
              step={minBidUnit}
            />
            <p className="text-xs text-gray-500">
              최소 입찰가: {formatPrice(nextMinBid)}
            </p>
            <Button
              type="submit"
              className="w-full"
              disabled={!isConnected || Number(bidAmount) < nextMinBid}
            >
              입찰하기
            </Button>
          </form>

          {instantPrice && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleInstantBuy}
              disabled={!isConnected}
            >
              즉시 구매 {formatPrice(instantPrice)}
            </Button>
          )}
        </>
      )}

      {isActive && !isAuthenticated && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-2">입찰하려면 로그인이 필요합니다.</p>
          <a href="/login" className="text-sm text-indigo-600 hover:underline">
            로그인
          </a>
        </div>
      )}

      {!isActive && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-500">경매가 종료되었습니다.</p>
        </div>
      )}
    </div>
  );
}
