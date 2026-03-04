"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/product/ProductForm";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Loading } from "@/components/common/Loading";

export default function NewProductPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">상품 등록</h1>
      <ProductForm />
    </div>
  );
}
