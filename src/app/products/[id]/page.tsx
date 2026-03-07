"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import type { ProductResponse } from "@/types/product";
import { CATEGORY_LABELS, CONDITION_LABELS, PRODUCT_STATUS_LABELS, END_TYPE_LABELS } from "@/types/product";
import { getProduct, activateProduct, deleteProduct } from "@/lib/api/products";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ImageGallery } from "@/components/common/ImageGallery";

/** 상품 상태 -> Badge variant 매핑 */
const STATUS_BADGE_VARIANT: Record<string, "success" | "primary" | "error" | "warning" | "neutral"> = {
  DRAFT: "neutral",
  ACTIVE: "success",
  IN_AUCTION: "primary",
  SOLD: "warning",
  CANCELLED: "error",
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 이미지 영역 */}
        <div>
          <ImageGallery images={product.imageUrls ?? []} alt={product.title} />
        </div>

        {/* 상품 정보 */}
        <div className="space-y-4">
          <div>
            <Badge variant={STATUS_BADGE_VARIANT[product.status] || "neutral"}>
              {PRODUCT_STATUS_LABELS[product.status]}
            </Badge>
            <h1 className="text-xl font-bold text-text-primary mt-2">{product.title}</h1>
          </div>

          <Card>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-text-secondary">카테고리</span>
                <p className="font-medium text-text-primary">{CATEGORY_LABELS[product.category]}</p>
              </div>
              <div>
                <span className="text-text-secondary">상품 상태</span>
                <p className="font-medium text-text-primary">{CONDITION_LABELS[product.conditionGrade]}</p>
              </div>
              <div>
                <span className="text-text-secondary">시작가</span>
                <p className="font-medium text-text-primary">{formatPrice(product.startingPrice)}</p>
              </div>
              {product.instantPrice && (
                <div>
                  <span className="text-text-secondary">즉시 구매가</span>
                  <p className="font-medium text-text-primary">{formatPrice(product.instantPrice)}</p>
                </div>
              )}
              <div>
                <span className="text-text-secondary">최소 입찰 단위</span>
                <p className="font-medium text-text-primary">{formatPrice(product.minBidUnit)}</p>
              </div>
              <div>
                <span className="text-text-secondary">마감 조건</span>
                <p className="font-medium text-text-primary">
                  {END_TYPE_LABELS[product.endType]}
                  {product.durationHours && ` / ${product.durationHours}시간`}
                  {product.maxBidCount && ` / ${product.maxBidCount}회`}
                </p>
              </div>
            </div>
          </Card>

          {/* 상품 설명 */}
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-2">상품 설명</h3>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{product.description}</p>
          </Card>

          <div className="text-xs text-text-tertiary">
            등록일: {formatDateTime(product.createdAt)}
          </div>

          {/* 소유자 액션 버튼 */}
          {isOwner && product.status === "DRAFT" && (
            <div className="flex gap-3 pt-2">
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
