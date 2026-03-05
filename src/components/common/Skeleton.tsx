interface SkeletonProps {
  /** 너비 (Tailwind 클래스, 예: "w-full", "w-32") */
  width?: string;
  /** 높이 (Tailwind 클래스, 예: "h-4", "h-48") */
  height?: string;
  /** 원형 스켈레톤 (아바타 등) */
  circle?: boolean;
  className?: string;
}

export function Skeleton({
  width = "w-full",
  height = "h-4",
  circle = false,
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse bg-bg-tertiary
        ${circle ? "rounded-full" : "rounded-md"}
        ${width} ${height}
        ${className}
      `}
    />
  );
}

/** 카드 형태의 스켈레톤 프리셋 */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-bg-elevated border border-border rounded-xl p-4 space-y-3 ${className}`}>
      {/* 이미지 영역 */}
      <Skeleton height="h-40" />
      {/* 제목 */}
      <Skeleton width="w-3/4" height="h-5" />
      {/* 부제 */}
      <Skeleton width="w-1/2" height="h-4" />
      {/* 가격 */}
      <div className="flex justify-between items-center pt-2">
        <Skeleton width="w-24" height="h-5" />
        <Skeleton width="w-16" height="h-6" />
      </div>
    </div>
  );
}
