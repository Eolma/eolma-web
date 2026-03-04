"use client";

import { ProductForm } from "@/components/product/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">상품 등록</h1>
      <ProductForm />
    </div>
  );
}
