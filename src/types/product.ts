export interface RegisterProductRequest {
  title: string;
  description: string;
  category: string;
  conditionGrade: string;
  startingPrice: number;
  instantPrice: number | null;
  reservePrice: number | null;
  minBidUnit: number;
  endType: string;
  durationHours: number | null;
  maxBidCount: number | null;
  imageUrls: string[];
}

export type UpdateProductRequest = RegisterProductRequest;

export interface ProductResponse {
  id: number;
  sellerId: number;
  title: string;
  description: string;
  category: string;
  conditionGrade: string;
  startingPrice: number;
  instantPrice: number | null;
  reservePrice: number | null;
  minBidUnit: number;
  endType: string;
  durationHours: number | null;
  maxBidCount: number | null;
  status: string;
  imageUrls: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  content: ProductResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export const CATEGORIES = [
  "ELECTRONICS",
  "FASHION",
  "HOME",
  "SPORTS",
  "BOOKS",
  "TOYS",
  "BEAUTY",
  "AUTO",
  "OTHER",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  ELECTRONICS: "전자기기",
  FASHION: "패션",
  HOME: "가구/인테리어",
  SPORTS: "스포츠/레저",
  BOOKS: "도서",
  TOYS: "취미/게임",
  BEAUTY: "뷰티",
  AUTO: "자동차",
  OTHER: "기타",
};

export const CONDITION_GRADES = ["NEW", "LIKE_NEW", "EXCELLENT", "GOOD", "FAIR", "POOR"] as const;

export const CONDITION_LABELS: Record<string, string> = {
  NEW: "미개봉/새상품",
  LIKE_NEW: "거의 새것",
  EXCELLENT: "매우 좋음",
  GOOD: "좋음",
  FAIR: "보통",
  POOR: "상태 나쁨",
};

export const END_TYPES = ["TIME", "BID_COUNT", "COMBINED"] as const;

export const END_TYPE_LABELS: Record<string, string> = {
  TIME: "시간제",
  BID_COUNT: "입찰횟수제",
  COMBINED: "복합",
};

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "임시저장",
  ACTIVE: "경매 대기",
  IN_AUCTION: "경매 중",
  SOLD: "판매 완료",
  CANCELLED: "취소됨",
};
