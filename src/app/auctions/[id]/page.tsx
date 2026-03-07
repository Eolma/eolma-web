"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { BottomSheet } from "@/components/common/BottomSheet";
import { AuctionTimer } from "@/components/auction/AuctionTimer";
import { BidPanel } from "@/components/auction/BidPanel";
import { BidHistory } from "@/components/auction/BidHistory";
import { BidCelebration } from "@/components/auction/BidCelebration";
import { BidFeed, type BidFeedItem } from "@/components/auction/BidFeed";
import { AuctionCountdown } from "@/components/auction/AuctionCountdown";
import type { AuctionResponse, BidHistoryResponse, BidResultMessage, AuctionClosedMessage } from "@/types/auction";
import { AUCTION_STATUS_LABELS } from "@/types/auction";
import { getAuction, getBidHistory } from "@/lib/api/auctions";
import { useAuctionSocket } from "@/lib/websocket/useAuctionSocket";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { AnimatedPrice } from "@/components/common/AnimatedPrice";
import Link from "next/link";
import { ShareButton } from "@/components/common/ShareButton";
import { WishlistButton } from "@/components/auction/WishlistButton";

const STATUS_BADGE_VARIANT: Record<string, "success" | "primary" | "error" | "warning" | "neutral"> = {
  ACTIVE: "success",
  PENDING_INSTANT_BUY: "warning",
  COMPLETED: "primary",
  FAILED: "error",
  PENDING: "warning",
};

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [auction, setAuction] = useState<AuctionResponse | null>(null);
  const [bids, setBids] = useState<BidHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBidSheetOpen, setIsBidSheetOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedItems, setFeedItems] = useState<BidFeedItem[]>([]);
  const [auctionClosed, setAuctionClosed] = useState(false);
  const [closedInfo, setClosedInfo] = useState<{ winnerId: number; winningPrice: number } | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);

  const id = Number(params.id);

  useEffect(() => {
    async function fetchData() {
      try {
        const [auctionData, bidData] = await Promise.all([
          getAuction(id),
          getBidHistory(id),
        ]);
        setAuction(auctionData);
        setBids(bidData);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  const initialRemainingSeconds = useMemo(() => {
    if (!auction) return 0;
    const endTime = new Date(auction.endAt).getTime();
    const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    return remaining;
  }, [auction]);

  const isActive = auction?.status === "ACTIVE" || auction?.status === "PENDING_INSTANT_BUY";

  const {
    currentPrice,
    bidCount,
    remainingSeconds,
    connectionStatus,
    lastMessage,
    viewerCount,
    placeBid,
    isPending,
    reconnect,
    instantBuyReservation,
    myInstantBuyReserved,
  } = useAuctionSocket(
    id,
    auction?.currentPrice ?? 0,
    auction?.bidCount ?? 0,
    initialRemainingSeconds,
  );

  // 내가 즉시구매를 선점했으면 결제 페이지로 이동
  useEffect(() => {
    if (myInstantBuyReserved) {
      router.push(`/payments/${myInstantBuyReserved.auctionId}`);
    }
  }, [myInstantBuyReserved, router]);

  const lastBidResult = useMemo(() => {
    if (!lastMessage || lastMessage.type !== "BID_RESULT") return null;
    const msg = lastMessage as BidResultMessage;
    return { status: msg.status, message: msg.message };
  }, [lastMessage]);

  // 입찰 성공 시 축하 효과 + 입찰 이력 자동 갱신
  useEffect(() => {
    if (lastBidResult?.status === "ACCEPTED") {
      setShowCelebration(true);
      getBidHistory(id).then(setBids).catch(() => {});
    }
  }, [lastBidResult, id]);

  // 실시간 입찰 피드: AUCTION_UPDATE 수신 시 피드 아이템 추가
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== "AUCTION_UPDATE") return;
    const newItem: BidFeedItem = {
      id: `${Date.now()}-${Math.random()}`,
      amount: lastMessage.currentPrice,
      nickname: lastMessage.bidderNickname || "익명",
      timestamp: Date.now(),
    };
    setFeedItems((prev) => {
      const next = [newItem, ...prev].slice(0, 10);
      return next;
    });
    const itemId = newItem.id;
    const timer = setTimeout(() => {
      setFeedItems((prev) => prev.filter((item) => item.id !== itemId));
    }, 3000);
    return () => clearTimeout(timer);
  }, [lastMessage]);

  // 경매 종료 감지
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== "AUCTION_CLOSED") return;
    const msg = lastMessage as AuctionClosedMessage;
    setAuctionClosed(true);
    setClosedInfo({ winnerId: msg.winnerId, winningPrice: msg.winningPrice });
  }, [lastMessage]);

  // 카운트다운 오버레이 표시 제어
  useEffect(() => {
    if (isActive && remainingSeconds <= 5 && remainingSeconds > 0 && !auctionClosed) {
      setShowCountdown(true);
    }
    if (remainingSeconds === 0 && showCountdown) {
      const timer = setTimeout(() => setShowCountdown(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [remainingSeconds, auctionClosed, showCountdown, isActive]);

  if (loading || !auction) return <Loading />;

  const isWinner = closedInfo
    ? closedInfo.winnerId === user?.id
    : auction.winnerId === user?.id;

  const displayStatus = instantBuyReservation ? "PENDING_INSTANT_BUY" : auction.status;

  return (
    <>
      {showCelebration && (
        <BidCelebration onComplete={() => setShowCelebration(false)} />
      )}

      <BidFeed items={feedItems} />

      {showCountdown && <AuctionCountdown remainingSeconds={remainingSeconds} />}

      {auctionClosed && closedInfo && (
        <div className="fixed inset-0 z-[45] flex items-center justify-center bg-black/50">
          <div className="bg-bg rounded-2xl p-8 text-center shadow-xl max-w-sm mx-4">
            <p className="text-lg font-bold text-text-primary mb-2">경매 종료</p>
            <p className="text-3xl font-bold text-primary mb-4">
              {formatPrice(closedInfo.winningPrice)}
            </p>
            {isWinner ? (
              <>
                <p className="text-sm text-success-text mb-4">축하합니다! 낙찰되었습니다.</p>
                <Button onClick={() => router.push(`/payments/${auction.id}`)}>
                  결제하기
                </Button>
              </>
            ) : (
              <p className="text-sm text-text-secondary">다음 기회에 도전하세요.</p>
            )}
            <button
              className="mt-4 block mx-auto text-sm text-text-tertiary hover:text-text-secondary"
              onClick={() => setAuctionClosed(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      <div className={`max-w-5xl mx-auto px-4 py-6 transition-all duration-700 ${
        auctionClosed ? "grayscale" : ""
      }`}>
      <div className="mb-4">
        <Link href="/" className="text-sm text-primary hover:underline">
          경매 목록으로
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={STATUS_BADGE_VARIANT[displayStatus] || "neutral"}>
                {AUCTION_STATUS_LABELS[displayStatus] || displayStatus}
              </Badge>
              {viewerCount != null && (
                <span className="flex items-center gap-1 text-xs text-text-secondary">
                  <Eye size={14} />
                  {viewerCount}명 참여 중
                </span>
              )}
              <div className="ml-auto flex items-center gap-1">
                <WishlistButton auctionId={auction.id} />
                <ShareButton title={auction.title} text={`${auction.title} - 경매 진행 중`} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{auction.title}</h1>
          </div>

          <Card>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">시작가</span>
                <p className="font-medium text-text-primary">{formatPrice(auction.startingPrice)}</p>
              </div>
              {auction.instantPrice && (
                <div>
                  <span className="text-text-secondary">즉시 구매가</span>
                  <p className="font-medium text-text-primary">{formatPrice(auction.instantPrice)}</p>
                </div>
              )}
              <div>
                <span className="text-text-secondary">최소 입찰 단위</span>
                <p className="font-medium text-text-primary">{formatPrice(auction.minBidUnit)}</p>
              </div>
              <div>
                <span className="text-text-secondary">마감 시간</span>
                <p className="font-medium text-text-primary">{formatDateTime(auction.endAt)}</p>
              </div>
            </div>
          </Card>

          {auction.status === "COMPLETED" && auction.winningPrice && (
            <Card className="bg-primary-light border-primary">
              <p className="text-sm text-primary font-medium">
                낙찰가: {formatPrice(auction.winningPrice)}
              </p>
              {isWinner && (
                <div className="mt-2">
                  <p className="text-sm text-primary mb-2">축하합니다! 낙찰되었습니다.</p>
                  <Button size="sm" onClick={() => router.push(`/payments/${auction.id}`)}>
                    결제하기
                  </Button>
                </div>
              )}
            </Card>
          )}

          <div>
            <Link
              href={`/products/${auction.productId}`}
              className="text-sm text-primary hover:underline"
            >
              상품 상세 보기
            </Link>
          </div>

          <BidHistory bids={bids} />
        </div>

        {/* 오른쪽: 입찰 패널 (데스크톱) */}
        <div className="hidden lg:block space-y-4">
          <AuctionTimer remainingSeconds={remainingSeconds} />
          <BidPanel
            currentPrice={currentPrice}
            minBidUnit={auction.minBidUnit}
            instantPrice={auction.instantPrice}
            bidCount={bidCount}
            isActive={isActive && remainingSeconds > 0}
            connectionStatus={connectionStatus}
            onBid={placeBid}
            lastBidResult={lastBidResult}
            isPending={isPending}
            onReconnect={reconnect}
            instantBuyReservation={instantBuyReservation}
          />
        </div>
      </div>

      {/* 모바일 하단 고정 입찰 버튼 */}
      {isActive && remainingSeconds > 0 && !instantBuyReservation && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-bg border-t border-border lg:hidden z-40">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-text-secondary">현재가</p>
              <AnimatedPrice value={currentPrice} className="text-lg font-bold text-primary" />
            </div>
            <AuctionTimer remainingSeconds={remainingSeconds} />
          </div>
          <Button className="w-full" onClick={() => setIsBidSheetOpen(true)}>
            입찰하기
          </Button>
        </div>
      )}

      {/* 모바일 BottomSheet 입찰 패널 */}
      <BottomSheet
        isOpen={isBidSheetOpen}
        onClose={() => setIsBidSheetOpen(false)}
        title="입찰하기"
      >
        <BidPanel
          currentPrice={currentPrice}
          minBidUnit={auction.minBidUnit}
          instantPrice={auction.instantPrice}
          bidCount={bidCount}
          isActive={isActive && remainingSeconds > 0}
          connectionStatus={connectionStatus}
          onBid={(amount) => {
            placeBid(amount);
          }}
          lastBidResult={lastBidResult}
          isPending={isPending}
          onReconnect={reconnect}
          instantBuyReservation={instantBuyReservation}
        />
      </BottomSheet>
    </div>
    </>
  );
}
