"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Select } from "@/components/common/Select";
import { Textarea } from "@/components/common/Textarea";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CONDITION_GRADES,
  CONDITION_LABELS,
  END_TYPES,
  END_TYPE_LABELS,
} from "@/types/product";
import type { RegisterProductRequest } from "@/types/product";
import { registerProduct, activateProduct } from "@/lib/api/products";
import { ApiException } from "@/lib/api/client";

export function ProductForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [conditionGrade, setConditionGrade] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [instantPrice, setInstantPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [minBidUnit, setMinBidUnit] = useState("1000");
  const [endType, setEndType] = useState("TIME");
  const [endValue, setEndValue] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  function addImageUrl() {
    if (imageUrlInput.trim() && imageUrls.length < 10) {
      setImageUrls([...imageUrls, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  }

  function removeImageUrl(index: number) {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent, activate: boolean) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const req: RegisterProductRequest = {
      title,
      description,
      category,
      conditionGrade,
      startingPrice: Number(startingPrice),
      instantPrice: instantPrice ? Number(instantPrice) : null,
      reservePrice: reservePrice ? Number(reservePrice) : null,
      minBidUnit: Number(minBidUnit),
      endType,
      endValue,
      imageUrls,
    };

    try {
      const product = await registerProduct(req);
      if (activate) {
        await activateProduct(product.id);
      }
      router.push(`/products/${product.id}`);
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.detail);
      } else {
        setError("상품 등록에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <Input
        label="제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="상품 제목을 입력하세요"
        maxLength={200}
        required
      />

      <Textarea
        label="설명"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="상품 설명을 입력하세요"
        rows={5}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="카테고리"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="선택하세요"
          options={CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
          required
        />
        <Select
          label="상품 상태"
          value={conditionGrade}
          onChange={(e) => setConditionGrade(e.target.value)}
          placeholder="선택하세요"
          options={CONDITION_GRADES.map((g) => ({ value: g, label: `${g}급 - ${CONDITION_LABELS[g]}` }))}
          required
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">경매 설정</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="시작가 (원)"
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            placeholder="10000"
            min="0"
            required
          />
          <Input
            label="즉시 구매가 (원, 선택)"
            type="number"
            value={instantPrice}
            onChange={(e) => setInstantPrice(e.target.value)}
            placeholder="선택사항"
            min="0"
          />
          <Input
            label="최저가 (원, 선택)"
            type="number"
            value={reservePrice}
            onChange={(e) => setReservePrice(e.target.value)}
            placeholder="선택사항"
            min="0"
          />
          <Input
            label="최소 입찰 단위 (원)"
            type="number"
            value={minBidUnit}
            onChange={(e) => setMinBidUnit(e.target.value)}
            min="100"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Select
            label="마감 조건"
            value={endType}
            onChange={(e) => { setEndType(e.target.value); setEndValue(""); }}
            options={END_TYPES.map((t) => ({ value: t, label: END_TYPE_LABELS[t] }))}
          />
          {endType === "TIME" ? (
            <Select
              label="경매 시간"
              value={endValue}
              onChange={(e) => setEndValue(e.target.value)}
              placeholder="선택하세요"
              options={[
                { value: "6", label: "6시간" },
                { value: "12", label: "12시간" },
                { value: "24", label: "24시간 (1일)" },
                { value: "48", label: "48시간 (2일)" },
                { value: "72", label: "72시간 (3일)" },
                { value: "168", label: "168시간 (7일)" },
              ]}
              required
            />
          ) : (
            <Input
              label="최대 입찰 횟수"
              type="number"
              value={endValue}
              onChange={(e) => setEndValue(e.target.value)}
              placeholder="예: 50"
              min="1"
              required
            />
          )}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">이미지 URL</h3>
        <div className="flex gap-2 mb-3">
          <Input
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="이미지 URL을 입력하세요"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addImageUrl();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addImageUrl} className="shrink-0 whitespace-nowrap">
            추가
          </Button>
        </div>
        {imageUrls.length > 0 && (
          <div className="space-y-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm text-gray-600 truncate flex-1">{url}</span>
                <button
                  type="button"
                  onClick={() => removeImageUrl(i)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">최대 10장</p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          loading={loading}
          onClick={(e) => handleSubmit(e, false)}
          className="flex-1"
        >
          임시 저장
        </Button>
        <Button
          type="button"
          loading={loading}
          onClick={(e) => handleSubmit(e, true)}
          className="flex-1"
        >
          경매 등록
        </Button>
      </div>
    </form>
  );
}
