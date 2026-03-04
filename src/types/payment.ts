export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface PaymentResponse {
  id: number;
  auctionId: number;
  productId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  status: string;
  tossPaymentKey: string | null;
  tossOrderId: string;
  paymentMethod: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  failureReason: string | null;
  deadlineAt: string;
  createdAt: string;
  updatedAt: string;
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "결제 대기",
  CONFIRMED: "결제 완료",
  CANCELLED: "취소",
  EXPIRED: "기한 만료",
  REFUNDED: "환불",
};
