"use client";

import Link from "next/link";
import type { ProductResponse } from "@/types/product";
import { CATEGORY_LABELS, CONDITION_LABELS, PRODUCT_STATUS_LABELS } from "@/types/product";
import { formatPrice, formatRelativeTime } from "@/lib/utils/format";

interface ProductCardProps {
  product: ProductResponse;
}

export function ProductCard({ product }: ProductCardProps) {
  const statusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    ACTIVE: "bg-green-100 text-green-700",
    IN_AUCTION: "bg-indigo-100 text-indigo-700",
    SOLD: "bg-orange-100 text-orange-700",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-[4/3] bg-gray-100 relative">
          {product.imageUrls.length > 0 ? (
            <img
              src={product.imageUrls[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded-full ${statusColor[product.status] || "bg-gray-100"}`}>
            {PRODUCT_STATUS_LABELS[product.status] || product.status}
          </span>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{CATEGORY_LABELS[product.category] || product.category}</span>
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs text-gray-500">{CONDITION_LABELS[product.conditionGrade] || product.conditionGrade}</span>
          </div>
          <p className="text-base font-bold text-gray-900 mt-2">
            {formatPrice(product.startingPrice)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatRelativeTime(product.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
