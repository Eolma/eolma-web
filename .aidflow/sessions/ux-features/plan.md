# 편의 기능 & 시각적 풍부함

## Background

현재 eolma-web은 핵심 기능 위주로 구현되어 있어 편의 기능이 부족하다. 상품 이미지 클릭 시 확대가 안 되고, 입찰 가격은 직접 타이핑해야 하며, 경매 공유/찜 기능이 없고, 홈 히어로 섹션은 텍스트만 있다. 사용자 편의를 높이는 기능과 시각적 풍부함을 추가한다.

## Objective

이미지 갤러리 뷰어, 가격 프리셋 버튼, 공유하기, 찜 기능, 히어로 섹션 캐러셀을 구현하여 사용성과 시각적 완성도를 높인다.

## Requirements

### Functional Requirements
- FR-1: 상품 이미지 클릭 시 전체화면 갤러리 뷰어 (핀치 줌 + 스와이프)
- FR-2: 입찰 시 +1,000 / +5,000 / +10,000 / +50,000 프리셋 버튼
- FR-3: 경매 상세 페이지에서 Web Share API로 공유 (미지원 시 URL 복사 폴백)
- FR-4: 경매 찜하기 (프론트엔드 Zustand + 백엔드 API 연동 준비)
- FR-5: 홈 히어로 섹션에 핫 경매 캐러셀 (자동 슬라이드 + 수동 스와이프)

### Non-Functional Requirements
- NFR-1: `npm run build` 성공
- NFR-2: 이미지 뷰어에서 60fps 유지 (하드웨어 가속)
- NFR-3: 찜 데이터는 로컬 + API 이중 저장 (API 우선, 폴백으로 로컬)

## Out of Scope
- 이미지 편집/크롭
- 찜 목록 별도 페이지 (향후 마이페이지에 추가)
- 추천 알고리즘
- SNS별 딥링크 공유

## Technical Approach

### 이미지 갤러리 뷰어 (FR-1)
- `ImageGallery` 컴포넌트 신규 생성
  - 메인 이미지 + 하단 썸네일 리스트
  - 썸네일 클릭으로 메인 이미지 교체
  - 메인 이미지 클릭 시 전체화면 라이트박스 모드
- `ImageLightbox` 컴포넌트 신규 생성
  - 전체화면 오버레이 (`fixed inset-0 z-[60] bg-black`)
  - 좌우 스와이프로 이미지 전환 (framer-motion `drag="x"`)
  - 핀치 줌: touch 이벤트로 scale 계산 (두 손가락 거리 기반)
  - 닫기: 상단 X 버튼 또는 아래로 드래그
- 적용 대상: `products/[id]/page.tsx` (이미 이미지 표시 로직 있음)
- 경매 상세에는 이미지가 없으므로 미적용 (AuctionResponse에 imageUrls 없음)

### 가격 프리셋 버튼 (FR-2)
- `BidPanel.tsx`에 프리셋 버튼 그룹 추가
- 4개 버튼: +1,000 / +5,000 / +10,000 / +50,000
- 동작: `setBidAmount(String(Number(bidAmount) + preset))` (현재 입력값에 누적)
- 스타일: `ghost` variant 버튼, 가로 스크롤 가능한 flex 레이아웃
- 프리셋 적용 후 입력값이 `nextMinBid`보다 작으면 `nextMinBid`로 보정

### 공유하기 (FR-3)
- `ShareButton` 컴포넌트 신규 생성
- `navigator.share` 지원 시: `{ title, text, url }` 네이티브 공유
- 미지원 시: `navigator.clipboard.writeText(url)` + 토스트 "링크가 복사되었습니다"
- 경매 상세 페이지 상단에 공유 아이콘 버튼 배치 (Share2 lucide 아이콘)

### 찜 기능 (FR-4)
- `useWishlistStore.ts` Zustand 스토어 신규 생성:
  - `wishlist: Set<number>` (경매 ID)
  - `toggleWishlist(auctionId)` / `isWishlisted(auctionId)`
  - 로컬 저장: Zustand persist 미들웨어 (localStorage)
  - API 연동 준비: `syncWithServer()` 메서드 stub (백엔드 완성 후 활성화)
- `WishlistButton` 컴포넌트 신규 생성:
  - Heart / HeartFilled 아이콘 토글
  - 탭 시 bounce 애니메이션 (framer-motion scale spring)
  - `e.preventDefault()` + `e.stopPropagation()` (Link 내부 클릭 방지)
- 적용 대상: `AuctionCard.tsx` 우상단, `auctions/[id]/page.tsx` 상단

### 히어로 캐러셀 (FR-5)
- `HeroCarousel` 컴포넌트 신규 생성
- 데이터: `getAuctions({ status: "ACTIVE", size: 5 })`로 인기 경매 fetch
  - 정렬: bidCount 높은 순 (현재 API에 sort 파라미터 없으면 클라이언트 정렬)
- UI: 풀 블리드 배경, 경매 제목 + 현재가 + 입찰 수 + CTA "입찰하기"
- 자동 슬라이드: 4초 간격, 하단 dot indicator
- 수동 스와이프: framer-motion `drag="x"` + snap
- 기존 히어로 텍스트("얼마에 살 수 있을까?") 유지, 아래에 캐러셀 배치

### Affected Files

**신규 생성**:
- `src/components/common/ImageGallery.tsx` - 메인 이미지 + 썸네일
- `src/components/common/ImageLightbox.tsx` - 전체화면 라이트박스
- `src/components/common/ShareButton.tsx` - 공유 버튼
- `src/components/auction/WishlistButton.tsx` - 찜 버튼
- `src/components/auction/HeroCarousel.tsx` - 히어로 캐러셀
- `src/lib/store/useWishlistStore.ts` - 찜 상태 관리

**수정**:
- `src/components/auction/BidPanel.tsx` - 프리셋 버튼 추가
- `src/components/auction/AuctionCard.tsx` - WishlistButton 추가
- `src/app/products/[id]/page.tsx` - ImageGallery 적용
- `src/app/auctions/[id]/page.tsx` - ShareButton, WishlistButton 추가
- `src/app/page.tsx` - HeroCarousel 추가

## Implementation Items

### Phase 1: 입찰 편의 기능
- [ ] 1-1: BidPanel에 가격 프리셋 버튼 (+1,000/+5,000/+10,000/+50,000) 추가
- [ ] 1-2: ShareButton 컴포넌트 생성 + 경매 상세 페이지에 적용

### Phase 2: 이미지 갤러리
- [ ] 2-1: ImageGallery 컴포넌트 생성 (메인 + 썸네일)
- [ ] 2-2: ImageLightbox 컴포넌트 생성 (전체화면 + 핀치 줌 + 스와이프)
- [ ] 2-3: 상품 상세 페이지에 ImageGallery 적용

### Phase 3: 찜 기능
- [ ] 3-1: useWishlistStore 생성 (Zustand persist)
- [ ] 3-2: WishlistButton 컴포넌트 생성 (Heart 토글 + bounce)
- [ ] 3-3: AuctionCard, 경매 상세 페이지에 WishlistButton 적용

### Phase 4: 히어로 캐러셀
- [ ] 4-1: HeroCarousel 컴포넌트 생성 (자동 슬라이드 + 수동 스와이프)
- [ ] 4-2: 홈 페이지에 HeroCarousel 적용

### Phase 5: 검증
- [ ] 5-1: npm run build 확인
- [ ] 5-2: 스모크 테스트 (갤러리, 프리셋, 공유, 찜, 캐러셀)

## Acceptance Criteria
- [ ] AC-1: 상품 이미지 클릭 시 전체화면 갤러리가 열리고 스와이프/줌 가능
- [ ] AC-2: 입찰 패널에 프리셋 버튼이 표시되고 클릭 시 금액이 증가함
- [ ] AC-3: 공유 버튼 클릭 시 네이티브 공유 또는 URL 복사 실행
- [ ] AC-4: 하트 버튼으로 경매를 찜할 수 있고 새로고침 후에도 유지됨
- [ ] AC-5: 홈 상단에 인기 경매 캐러셀이 자동 슬라이드됨
- [ ] AC-6: npm run build 성공

## Notes
- 이미지 갤러리 핀치 줌은 외부 라이브러리 없이 직접 구현 (SPEC.md 외부 UI 라이브러리 금지)
- 찜 기능은 프론트엔드 localStorage만으로 동작하되, 백엔드 API가 준비되면 자연스럽게 전환 가능하도록 Store에 API 호출 포인트를 stub으로 준비
- 캐러셀은 기존 경매 목록 API를 재사용 (별도 "인기 경매" API 불필요)
- AuctionCard에 WishlistButton 추가 시, 전체 카드가 Link로 감싸져 있으므로 이벤트 전파 차단 필수
- framer-motion은 ux-motion 세션에서 설치
