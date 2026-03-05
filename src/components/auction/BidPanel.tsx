"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { formatPrice } from "@/lib/utils/format";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { AnimatedPrice } from "@/components/common/AnimatedPrice";

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
    <Card className="space-y-4">
      {/* 현재 최고가 */}
      <div>
        <p className="text-xs text-text-secondary mb-1">현재 최고가</p>
        <AnimatedPrice value={currentPrice} className="text-2xl font-bold text-primary" />
        <p className="text-sm text-text-secondary mt-1">입찰 수: {bidCount}회</p>
      </div>

      {/* 연결 상태 안내 */}
      {!isConnected && (
        <div className="bg-warning-light text-warning-text text-sm px-3 py-2 rounded-lg">
          서버 연결 중...
        </div>
      )}

      {/* 입찰 거절 알림 */}
      {lastBidResult && lastBidResult.status === "REJECTED" && (
        <div className="bg-error-light text-error-text text-sm px-3 py-2 rounded-lg">
          {lastBidResult.message || "입찰에 실패했습니다."}
        </div>
      )}

      {/* 입찰 성공 알림 */}
      {lastBidResult && lastBidResult.status === "ACCEPTED" && (
        <div className="bg-success-light text-success-text text-sm px-3 py-2 rounded-lg">
          입찰이 완료되었습니다.
        </div>
      )}

      {/* 입찰 폼 (로그인 + 활성 경매) */}
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
            <p className="text-xs text-text-secondary">
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

      {/* 비로그인 안내 */}
      {isActive && !isAuthenticated && (
        <div className="text-center py-4">
          <p className="text-sm text-text-secondary mb-2">입찰하려면 로그인이 필요합니다.</p>
          <Link href="/login" className="text-sm text-primary hover:underline">
            로그인
          </Link>
        </div>
      )}

      {/* 종료 안내 */}
      {!isActive && (
        <div className="text-center py-2">
          <p className="text-sm text-text-secondary">경매가 종료되었습니다.</p>
        </div>
      )}
    </Card>
  );
}
