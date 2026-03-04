"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProductList } from "@/components/product/ProductList";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/common/Button";
import type { ProductResponse } from "@/types/product";
import { getMyProducts } from "@/lib/api/products";

export default function MyProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const data = await getMyProducts({ page, size: 12 });
        setProducts(data.content);
        setHasNext(data.hasNext);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 상품</h1>
        <Link href="/products/new">
          <Button>상품 등록</Button>
        </Link>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <>
          <ProductList products={products} />
          <div className="flex justify-center gap-3 mt-8">
            <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              이전
            </Button>
            <span className="flex items-center text-sm text-gray-500">{page + 1} 페이지</span>
            <Button variant="secondary" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
              다음
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
