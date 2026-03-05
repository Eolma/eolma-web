/** 데스크톱 하단 푸터 (모바일에서는 BottomNav로 대체) */
export function Footer() {
  return (
    <footer className="hidden md:block bg-bg-secondary border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            얼마 - 중고 경매 플랫폼
          </p>
          <p className="text-xs text-text-tertiary">
            상품만 올리면, 시장이 가격을 정해주는 플랫폼
          </p>
        </div>
      </div>
    </footer>
  );
}
