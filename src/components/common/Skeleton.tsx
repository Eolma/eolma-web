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

/** 카드 형태의 스켈레톤 프리셋 (AuctionCard 구조 매칭) */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-bg-secondary rounded-xl p-4 space-y-3 ${className}`}>
      {/* 제목 + 뱃지 */}
      <div className="flex justify-between items-center">
        <Skeleton width="w-3/5" height="h-5" />
        <Skeleton width="w-14" height="h-5" className="rounded-md" />
      </div>
      {/* 가격 */}
      <div className="flex justify-between items-baseline">
        <Skeleton width="w-12" height="h-3" />
        <Skeleton width="w-24" height="h-6" />
      </div>
      {/* 부가 정보 */}
      <div className="flex gap-3 pt-1">
        <Skeleton width="w-16" height="h-3" />
        <Skeleton width="w-28" height="h-3" />
      </div>
    </div>
  );
}
