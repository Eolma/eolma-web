import type {
  RegisterProductRequest,
  UpdateProductRequest,
  ProductResponse,
  ProductListResponse,
} from "@/types/product";
import { apiClient } from "./client";

export async function getProducts(params?: {
  page?: number;
  size?: number;
  category?: string;
  status?: string;
}): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params?.page != null) query.set("page", String(params.page));
  if (params?.size != null) query.set("size", String(params.size));
  if (params?.category) query.set("category", params.category);
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return apiClient<ProductListResponse>(`/api/v1/products${qs ? `?${qs}` : ""}`);
}

export async function getProduct(id: number): Promise<ProductResponse> {
  return apiClient<ProductResponse>(`/api/v1/products/${id}`);
}

export async function getMyProducts(params?: {
  page?: number;
  size?: number;
}): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params?.page != null) query.set("page", String(params.page));
  if (params?.size != null) query.set("size", String(params.size));
  const qs = query.toString();
  return apiClient<ProductListResponse>(`/api/v1/products/me${qs ? `?${qs}` : ""}`);
}

export async function registerProduct(req: RegisterProductRequest): Promise<ProductResponse> {
  return apiClient<ProductResponse>("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function updateProduct(
  id: number,
  req: UpdateProductRequest,
): Promise<ProductResponse> {
  return apiClient<ProductResponse>(`/api/v1/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(req),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  return apiClient<void>(`/api/v1/products/${id}`, {
    method: "DELETE",
  });
}

export async function activateProduct(id: number): Promise<ProductResponse> {
  return apiClient<ProductResponse>(`/api/v1/products/${id}/activate`, {
    method: "POST",
  });
}
