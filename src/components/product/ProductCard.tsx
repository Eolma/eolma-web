"use client";

import Link from "next/link";
import type { ProductResponse } from "@/types/product";
import { CATEGORY_LABELS, CONDITION_LABELS, PRODUCT_STATUS_LABELS } from "@/types/product";
import { formatPrice, formatRelativeTime } from "@/lib/utils/format";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";

interface ProductCardProps {
  product: ProductResponse;
}

/** 상품 상태 -> Badge variant 매핑 */
const STATUS_BADGE_VARIANT: Record<string, "success" | "primary" | "error" | "warning" | "neutral"> = {
  DRAFT: "neutral",
  ACTIVE: "success",
  IN_AUCTION: "primary",
  SOLD: "warning",
  CANCELLED: "error",
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Card noPadding interactive className="overflow-hidden h-full">
        {/* 이미지 영역 */}
        <div className="aspect-[4/3] bg-bg-tertiary relative">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <img
              src={product.imageUrls[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-tertiary">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* 상태 뱃지 */}
          <div className="absolute top-2 left-2">
            <Badge variant={STATUS_BADGE_VARIANT[product.status] || "neutral"}>
              {PRODUCT_STATUS_LABELS[product.status] || product.status}
            </Badge>
          </div>
        </div>

        {/* 정보 영역 */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-primary">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-text-secondary">{CATEGORY_LABELS[product.category] || product.category}</span>
            <span className="text-xs text-text-tertiary">|</span>
            <span className="text-xs text-text-secondary">{CONDITION_LABELS[product.conditionGrade] || product.conditionGrade}</span>
          </div>
          <p className="text-base font-bold text-text-primary mt-2">
            {formatPrice(product.startingPrice)}
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {formatRelativeTime(product.createdAt)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
