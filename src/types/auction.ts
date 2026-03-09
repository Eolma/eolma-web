export interface AuctionResponse {
  id: number;
  productId: number;
  sellerId: string;
  title: string;
  startingPrice: number;
  instantPrice: number | null;
  instantBuyLockPercent: number | null;
  instantBuyLocked: boolean;
  reservePrice: number | null;
  minBidUnit: number;
  currentPrice: number;
  bidCount: number;
  endType: string;
  maxBidCount: number | null;
  status: string;
  endAt: string;
  winnerId: string | null;
  winningPrice: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionListResponse {
  content: AuctionResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface BidHistoryResponse {
  id: number;
  auctionId: number;
  bidderId: string;
  amount: number;
  bidType: string;
  status: string;
  createdAt: string;
}

// WebSocket 메시지 타입
export interface BidMessage {
  type: "BID";
  amount: number;
}

export interface BidResultMessage {
  type: "BID_RESULT";
  status: string;
  message?: string;
  currentPrice: number;
  bidCount: number;
  nextMinBid: number;
}

export interface AuctionUpdateMessage {
  type: "AUCTION_UPDATE";
  currentPrice: number;
  bidCount: number;
  remainingSeconds: number;
  status: string;
  viewerCount?: number;
  bidderNickname?: string;
}

export interface AuctionClosedMessage {
  type: "AUCTION_CLOSED";
  winnerId: string;
  winningPrice: number;
  status: string;
}

export interface InstantBuyReservedMessage {
  type: "INSTANT_BUY_RESERVED";
  auctionId: number;
  price: number;
  expiresAt: string;
}

export interface InstantBuyStartedMessage {
  type: "INSTANT_BUY_STARTED";
  buyerId: string;
  expiresAt: string;
  status: string;
}

export interface InstantBuyCancelledMessage {
  type: "INSTANT_BUY_CANCELLED";
  status: string;
}

export interface InstantBuyLockedMessage {
  type: "INSTANT_BUY_LOCKED";
  status: string;
}

export interface AuctionErrorMessage {
  type: "ERROR";
  code: string;
  message: string;
}

export type AuctionWebSocketMessage =
  | BidResultMessage
  | AuctionUpdateMessage
  | AuctionClosedMessage
  | InstantBuyReservedMessage
  | InstantBuyStartedMessage
  | InstantBuyCancelledMessage
  | InstantBuyLockedMessage
  | AuctionErrorMessage;

export const AUCTION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "진행 중",
  PENDING_INSTANT_BUY: "즉시구매 진행 중",
  COMPLETED: "낙찰",
  FAILED: "유찰",
  PENDING: "대기 중",
};
