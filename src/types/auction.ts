export interface AuctionResponse {
  id: number;
  productId: number;
  sellerId: number;
  title: string;
  startingPrice: number;
  instantPrice: number | null;
  reservePrice: number | null;
  minBidUnit: number;
  currentPrice: number;
  bidCount: number;
  endType: string;
  maxBidCount: number | null;
  status: string;
  endAt: string;
  winnerId: number | null;
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
  bidderId: number;
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
}

export interface AuctionClosedMessage {
  type: "AUCTION_CLOSED";
  winnerId: number;
  winningPrice: number;
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
  | AuctionErrorMessage;

export const AUCTION_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "진행 중",
  COMPLETED: "낙찰",
  FAILED: "유찰",
  PENDING: "대기 중",
};
