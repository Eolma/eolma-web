import type { AuctionResponse, AuctionListResponse, BidHistoryResponse } from "@/types/auction";
import { apiClient } from "./client";

export async function getAuctions(params?: {
  page?: number;
  size?: number;
  status?: string;
}): Promise<AuctionListResponse> {
  const query = new URLSearchParams();
  if (params?.page != null) query.set("page", String(params.page));
  if (params?.size != null) query.set("size", String(params.size));
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return apiClient<AuctionListResponse>(`/api/v1/auctions${qs ? `?${qs}` : ""}`);
}

export async function getAuction(id: number): Promise<AuctionResponse> {
  return apiClient<AuctionResponse>(`/api/v1/auctions/${id}`);
}

export async function getBidHistory(auctionId: number): Promise<BidHistoryResponse[]> {
  const data = await apiClient<{ content: BidHistoryResponse[] }>(`/api/v1/auctions/${auctionId}/bids`);
  return data.content;
}

export async function getMyAuctions(params?: {
  page?: number;
  size?: number;
}): Promise<AuctionListResponse> {
  const query = new URLSearchParams();
  if (params?.page != null) query.set("page", String(params.page));
  if (params?.size != null) query.set("size", String(params.size));
  const qs = query.toString();
  return apiClient<AuctionListResponse>(`/api/v1/auctions/me${qs ? `?${qs}` : ""}`);
}
