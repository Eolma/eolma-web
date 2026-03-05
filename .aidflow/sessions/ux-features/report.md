# ux-features - Report

## Summary
편의 기능 5종(이미지 갤러리 뷰어, 가격 프리셋 버튼, 공유하기, 찜 기능, 히어로 캐러셀)을 구현하여 사용성과 시각적 완성도를 높였다.

## Plan Completion
### Phase 1: 입찰 편의 기능
- [x] 1-1: BidPanel에 가격 프리셋 버튼 (+1,000/+5,000/+10,000/+50,000) 추가
- [x] 1-2: ShareButton 컴포넌트 생성 + 경매 상세 페이지에 적용

### Phase 2: 이미지 갤러리
- [x] 2-1: ImageGallery 컴포넌트 생성 (메인 + 썸네일)
- [x] 2-2: ImageLightbox 컴포넌트 생성 (전체화면 + 핀치 줌 + 스와이프)
- [x] 2-3: 상품 상세 페이지에 ImageGallery 적용

### Phase 3: 찜 기능
- [x] 3-1: useWishlistStore 생성 (Zustand persist)
- [x] 3-2: WishlistButton 컴포넌트 생성 (Heart 토글 + bounce)
- [x] 3-3: AuctionCard, 경매 상세 페이지에 WishlistButton 적용

### Phase 4: 히어로 캐러셀
- [x] 4-1: HeroCarousel 컴포넌트 생성 (자동 슬라이드 + 수동 스와이프)
- [x] 4-2: 홈 페이지에 HeroCarousel 적용

### Phase 5: 검증
- [x] 5-1: npm run build 확인
- [x] 5-2: 스모크 테스트 (갤러리, 프리셋, 공유, 찜, 캐러셀)

**완료율: 11/11 (100%)**

## Changed Files
| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/common/ImageGallery.tsx` | new | 메인 이미지 + 썸네일 리스트, 클릭 시 라이트박스 |
| `src/components/common/ImageLightbox.tsx` | new | 전체화면 오버레이, 핀치 줌, 스와이프, 키보드 내비게이션 |
| `src/components/common/ShareButton.tsx` | new | Web Share API + clipboard 폴백 공유 버튼 |
| `src/components/auction/WishlistButton.tsx` | new | Heart 토글 + bounce 애니메이션, 이벤트 전파 차단 |
| `src/components/auction/HeroCarousel.tsx` | new | 인기 경매 자동 슬라이드 캐러셀 (4초 간격) |
| `src/lib/store/useWishlistStore.ts` | new | Zustand persist 기반 찜 상태 관리, API stub 준비 |
| `src/components/auction/BidPanel.tsx` | modified | 가격 프리셋 버튼 4종 추가 |
| `src/components/auction/AuctionCard.tsx` | modified | WishlistButton 추가 |
| `src/app/products/[id]/page.tsx` | modified | ImageGallery 적용, 기존 인라인 이미지 코드 제거 |
| `src/app/auctions/[id]/page.tsx` | modified | ShareButton, WishlistButton 추가 |
| `src/app/page.tsx` | modified | HeroCarousel 히어로 섹션 하단에 추가 |

## Key Decisions
- 핀치 줌은 외부 라이브러리 없이 touch 이벤트 기반 직접 구현 (SPEC.md 준수)
- 찜 데이터는 Zustand persist로 localStorage 저장, `syncWithServer()` stub으로 백엔드 전환 준비
- 캐러셀 데이터는 기존 `getAuctions` API 재사용, bidCount 기준 클라이언트 정렬
- 라이트박스 열릴 때 body overflow hidden으로 배경 스크롤 차단

## Issues & Observations
- Review에서 미사용 state(`dragX`), body 스크롤 미잠금, 라이트박스 인덱스 매핑 오류 3건 발견 후 수정
- 다른 세션(ux-motion 등)에서 BidPanel이 LongPressButton/ConnectionIndicator 등으로 변경된 상태였음. 프리셋 버튼은 해당 구조 위에 자연스럽게 추가됨
- `useNetworkStatus.ts`에서 빌드 에러가 있었으나 재빌드 시 해소 (다른 세션 작업물, race condition 추정)

## Duration
- Started: 2026-03-05T09:47:48.147Z
- Completed: 2026-03-05T12:20:00.000Z (approx)
- Commits: 0 (커밋 대기 중)
