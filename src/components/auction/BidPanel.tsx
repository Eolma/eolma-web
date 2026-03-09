"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { LongPressButton } from "@/components/auction/LongPressButton";
import { ConnectionIndicator } from "@/components/auction/ConnectionIndicator";
import { InstantBuyBanner } from "@/components/auction/InstantBuyBanner";
import { formatPrice } from "@/lib/utils/format";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { AnimatedPrice } from "@/components/common/AnimatedPrice";
import type { ConnectionStatus, InstantBuyReservation } from "@/lib/websocket/useAuctionSocket";

const BID_PRESETS = [1_000, 5_000, 10_000, 50_000];

interface BidPanelProps {
  currentPrice: number;
  minBidUnit: number;
  instantPrice: number | null;
  bidCount: number;
  isActive: boolean;
  connectionStatus: ConnectionStatus;
  onBid: (amount: number) => void;
  lastBidResult?: { status: string; message?: string } | null;
  isPending?: boolean;
  onReconnect?: () => void;
  instantBuyReservation?: InstantBuyReservation | null;
  instantBuyLocked?: boolean;
}

export function BidPanel({
  currentPrice,
  minBidUnit,
  instantPrice,
  bidCount,
  isActive,
  connectionStatus,
  onBid,
  lastBidResult,
  isPending = false,
  onReconnect,
  instantBuyReservation,
  instantBuyLocked = false,
}: BidPanelProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isConnected = connectionStatus === "connected";
  const nextMinBid = currentPrice + minBidUnit;
  const [bidAmount, setBidAmount] = useState(String(nextMinBid));
  const isReserved = !!instantBuyReservation;

  useEffect(() => {
    setBidAmount(String(nextMinBid));
  }, [nextMinBid]);

  function handleBid() {
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

      {/* 연결 상태 표시 */}
      <ConnectionIndicator status={connectionStatus} onReconnect={onReconnect} />

      {/* 즉시구매 선점 배너 */}
      {isReserved && <InstantBuyBanner reservation={instantBuyReservation!} />}

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

      {/* 입찰 폼 (로그인 + 활성 경매 + 선점 아닌 상태) */}
      {isActive && isAuthenticated && !isReserved && (
        <>
          <div className="space-y-3">
            <Input
              label="입찰가"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={nextMinBid}
              step={minBidUnit}
            />
            {/* 가격 프리셋 버튼 */}
            <div className="flex gap-2 overflow-x-auto">
              {BID_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => {
                    const next = Math.max(Number(bidAmount) + preset, nextMinBid);
                    setBidAmount(String(next));
                  }}
                >
                  +{preset.toLocaleString()}
                </Button>
              ))}
            </div>
            <p className="text-xs text-text-secondary">
              최소 입찰가: {formatPrice(nextMinBid)}
            </p>
            <LongPressButton
              className="w-full"
              disabled={!isConnected || Number(bidAmount) < nextMinBid || isPending}
              onConfirm={handleBid}
            >
              {isPending ? "입찰 처리 중..." : "꾹 눌러 입찰하기"}
            </LongPressButton>
          </div>

          {instantPrice && (
            <div className="space-y-1">
              <LongPressButton
                variant="secondary"
                className="w-full"
                onConfirm={handleInstantBuy}
                disabled={!isConnected || isPending || instantBuyLocked}
              >
                꾹 눌러 즉시 구매 {formatPrice(instantPrice)}
              </LongPressButton>
              {instantBuyLocked && (
                <p className="text-xs text-warning-text text-center">
                  입찰 경쟁이 과열되어 즉시구매가 잠겼습니다.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* 선점 중일 때 비활성 안내 */}
      {isActive && isAuthenticated && isReserved && (
        <div className="text-center py-2">
          <p className="text-sm text-text-secondary">즉시구매 진행 중에는 입찰할 수 없습니다.</p>
        </div>
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
