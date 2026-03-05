# design-system-ui-overhaul - Report

## Summary
eolma-web의 모든 하드코딩 색상을 semantic 디자인 토큰으로 전환하고, 모바일 퍼스트 레이아웃(BottomNav, 반응형 Header), 다크/라이트 테마, PWA manifest, 7개 신규 common 컴포넌트를 도입하여 UI/UX를 전면 개편했다.

## Plan Completion
### Phase 1: Common 컴포넌트 개편 - 11/11 완료
### Phase 2: Layout 개편 - 6/6 완료
### Phase 3: 페이지 재설계 Core - 7/7 완료
### Phase 4: 페이지 재설계 Auth/MyPage/Payment - 9/9 완료
### Phase 5: 최종 검증 - 2/3 완료
- 5-3 (light/dark 테마 전환 육안 확인)은 자동화 불가로 미체크

**전체: 35/36 항목 완료**

## Changed Files
| File | Change Type | Description |
|------|-------------|-------------|
| SPEC.md | new | 프로젝트 개발 표준 문서 |
| src/styles/tokens/colors.css | new | primitive 색상 팔레트 |
| src/styles/tokens/semantic.css | new | light/dark semantic 토큰 |
| src/styles/tokens/typography.css | new | 타이포그래피 토큰 |
| src/styles/tokens/spacing.css | new | spacing, radius, shadow 토큰 |
| src/styles/theme.css | new | Tailwind v4 @theme inline 매핑 |
| src/hooks/useTheme.ts | new | light/dark/system 테마 전환 hook |
| src/components/common/Card.tsx | new | 카드 컴포넌트 (Header/Body/Footer) |
| src/components/common/Badge.tsx | new | 상태 뱃지 (6 variants) |
| src/components/common/Toast.tsx | new | 토스트 알림 |
| src/components/common/Avatar.tsx | new | 아바타 (이미지/이니셜) |
| src/components/common/Tabs.tsx | new | 탭 네비게이션 |
| src/components/common/BottomSheet.tsx | new | 모바일 바텀 시트 |
| src/components/common/Skeleton.tsx | new | 로딩 스켈레톤 |
| src/components/layout/BottomNav.tsx | new | 모바일 하단 네비게이션 |
| src/components/layout/ThemeToggle.tsx | new | 테마 전환 버튼 |
| src/lib/store/useToastStore.ts | new | Zustand 기반 토스트 상태 |
| src/app/manifest.ts | new | PWA manifest |
| src/app/globals.css | modified | 토큰 import, 애니메이션 추가 |
| src/app/layout.tsx | modified | FOUC 방지, BottomNav, viewport |
| src/components/common/Button.tsx | modified | 토큰 마이그레이션 |
| src/components/common/Input.tsx | modified | 토큰 마이그레이션 |
| src/components/common/Select.tsx | modified | 토큰 마이그레이션 |
| src/components/common/Textarea.tsx | modified | 토큰 마이그레이션 |
| src/components/common/Modal.tsx | modified | 토큰 마이그레이션 |
| src/components/common/Loading.tsx | modified | 토큰 마이그레이션 |
| src/components/layout/Header.tsx | modified | 반응형 재설계 + 토큰 |
| src/components/layout/Footer.tsx | modified | 토큰 마이그레이션 |
| src/components/auction/AuctionCard.tsx | modified | Card/Badge 기반 재설계 |
| src/components/auction/AuctionTimer.tsx | modified | 토큰 마이그레이션 |
| src/components/auction/BidPanel.tsx | modified | Card 래핑, 토큰, Link 수정 |
| src/components/auction/BidHistory.tsx | modified | Card 래핑, 토큰 |
| src/components/product/ProductCard.tsx | modified | Card/Badge 기반 재설계 |
| src/components/product/ProductForm.tsx | modified | 토큰 마이그레이션 |
| src/components/product/ProductList.tsx | modified | 토큰 마이그레이션 |
| src/components/auth/LoginForm.tsx | modified | 토스 스타일 재설계 |
| src/components/auth/RegisterForm.tsx | modified | 토큰 마이그레이션 |
| src/components/auth/SocialLoginButtons.tsx | modified | 토큰 (브랜드 색상 예외) |
| src/components/auth/AccountLinkModal.tsx | modified | 토큰 마이그레이션 |
| src/components/payment/PaymentWidget.tsx | modified | 에러 메시지 토큰 |
| src/app/page.tsx | modified | Tabs/SkeletonCard 적용 |
| src/app/auctions/page.tsx | modified | Tabs/SkeletonCard 적용 |
| src/app/auctions/[id]/page.tsx | modified | Card/Badge/BottomSheet |
| src/app/products/[id]/page.tsx | modified | Card/Badge 적용 |
| src/app/products/new/page.tsx | modified | 토큰 마이그레이션 |
| src/app/(auth)/login/page.tsx | modified | 토큰 마이그레이션 |
| src/app/(auth)/register/page.tsx | modified | 토큰 마이그레이션 |
| src/app/(auth)/auth/oauth/callback/page.tsx | modified | 토큰 마이그레이션 |
| src/app/(auth)/auth/set-nickname/page.tsx | modified | 토큰 마이그레이션 |
| src/app/mypage/page.tsx | modified | Avatar/Card/Badge 재설계 |
| src/app/mypage/layout.tsx | modified | 토큰 마이그레이션 |
| src/app/mypage/products/page.tsx | modified | 토큰 마이그레이션 |
| src/app/mypage/bids/page.tsx | modified | 토큰 마이그레이션 |
| src/app/payments/[auctionId]/page.tsx | modified | Card 기반 재설계 |
| src/app/payments/complete/page.tsx | modified | 토큰 마이그레이션 |

## Key Decisions
- **Deep Purple (#7c3aed)** 브랜드 컬러 채택 - 신뢰감 + 세련됨
- **2계층 토큰 구조**: primitive(원색) -> semantic(의미) - Tailwind v4 @theme inline 매핑
- **FOUC 방지**: layout.tsx head에 인라인 스크립트로 data-theme 선적용
- **소셜 로그인 브랜드 색상**: Google/Kakao 색상은 예외적으로 하드코딩 유지
- **외부 UI 라이브러리 미사용**: 모든 common 컴포넌트 자체 구현

## Issues & Observations
### 리뷰에서 발견된 기존 코드 이슈 (이번 세션 범위 밖, 향후 수정 필요)
- page.tsx와 auctions/page.tsx 로직 중복
- 여러 페이지에서 API 에러 무시 (catch 블록 비어있음)
- `Number(params.id)` NaN 가드 미처리
- PaymentWidget의 하드코딩 테스트 키와 고정 CUSTOMER_KEY
- `<img>` 대신 `next/image` 사용 권장
- ProductForm에서 form onSubmit 미연결 (type="button" 사용)
- set-nickname 페이지에서 렌더링 중 router.replace() 호출

### 이번 세션에서 수정한 리뷰 이슈
- BidPanel.tsx: `<a>` -> `<Link>` 교체
- 경매 상세 BottomSheet: 입찰 후 즉시 닫힘 -> 결과 확인 가능하도록 수정

## Duration
- Started: 2026-03-05T08:42:47.812Z
- Completed: 2026-03-05 (세션 내 작업 완료)
- Commits: 8개 (6fefcd5 ~ 7213811)
