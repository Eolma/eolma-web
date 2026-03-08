import type { ConfirmPaymentRequest, PaymentResponse } from "@/types/payment";
import { apiClient } from "./client";

export async function getPaymentByAuction(auctionId: number): Promise<PaymentResponse> {
  return apiClient<PaymentResponse>(`/api/v1/payments/auction/${auctionId}`);
}

export async function confirmPayment(req: ConfirmPaymentRequest): Promise<PaymentResponse> {
  return apiClient<PaymentResponse>("/api/v1/payments/confirm", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function cancelPayment(id: string): Promise<PaymentResponse> {
  return apiClient<PaymentResponse>(`/api/v1/payments/${id}/cancel`, {
    method: "POST",
  });
}

export async function getMyPayments(params?: {
  page?: number;
  size?: number;
}): Promise<{ content: PaymentResponse[]; totalElements: number; totalPages: number; hasNext: boolean }> {
  const query = new URLSearchParams();
  if (params?.page != null) query.set("page", String(params.page));
  if (params?.size != null) query.set("size", String(params.size));
  const qs = query.toString();
  return apiClient(`/api/v1/payments/me${qs ? `?${qs}` : ""}`);
}

export async function getPayment(id: string): Promise<PaymentResponse> {
  return apiClient<PaymentResponse>(`/api/v1/payments/${id}`);
}
