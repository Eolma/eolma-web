"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/common/Button";
import type { ProductResponse } from "@/types/product";
import { CATEGORY_LABELS, CONDITION_LABELS, PRODUCT_STATUS_LABELS, END_TYPE_LABELS } from "@/types/product";
import { getProduct, activateProduct, deleteProduct } from "@/lib/api/products";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const id = Number(params.id);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, router]);

  if (loading || !product) return <Loading />;

  const isOwner = user?.id === product.sellerId;

  async function handleActivate() {
    setActionLoading(true);
    try {
      const updated = await activateProduct(product!.id);
      setProduct(updated);
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("상품을 삭제하시겠습니까?")) return;
    setActionLoading(true);
    try {
      await deleteProduct(product!.id);
      router.push("/mypage/products");
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 이미지 */}
        <div>
          {product.imageUrls.length > 0 ? (
            <div className="space-y-3">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                {failedImages.has(0) ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">이미지를 불러올 수 없습니다</span>
                  </div>
                ) : (
                  <img
                    src={product.imageUrls[0]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={() => setFailedImages((prev) => new Set(prev).add(0))}
                  />
                )}
              </div>
              {product.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.imageUrls.slice(1).map((url, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {failedImages.has(i + 1) ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">불러올 수 없음</span>
                        </div>
                      ) : (
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={() => setFailedImages((prev) => new Set(prev).add(i + 1))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
              이미지 없음
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="space-y-4">
          <div>
            <span className="text-xs text-gray-500">
              {PRODUCT_STATUS_LABELS[product.status]}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{product.title}</h1>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">카테고리</span>
              <p className="font-medium">{CATEGORY_LABELS[product.category]}</p>
            </div>
            <div>
              <span className="text-gray-500">상품 상태</span>
              <p className="font-medium">{CONDITION_LABELS[product.conditionGrade]}</p>
            </div>
            <div>
              <span className="text-gray-500">시작가</span>
              <p className="font-medium">{formatPrice(product.startingPrice)}</p>
            </div>
            {product.instantPrice && (
              <div>
                <span className="text-gray-500">즉시 구매가</span>
                <p className="font-medium">{formatPrice(product.instantPrice)}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">최소 입찰 단위</span>
              <p className="font-medium">{formatPrice(product.minBidUnit)}</p>
            </div>
            <div>
              <span className="text-gray-500">마감 조건</span>
              <p className="font-medium">{END_TYPE_LABELS[product.endType]}: {product.endValue}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">상품 설명</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="text-xs text-gray-400">
            등록일: {formatDateTime(product.createdAt)}
          </div>

          {isOwner && product.status === "DRAFT" && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleActivate} loading={actionLoading} className="flex-1">
                경매 등록
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={actionLoading}>
                삭제
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
