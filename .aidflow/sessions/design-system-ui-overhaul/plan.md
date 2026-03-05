# 디자인 시스템 기반 UI/UX 전면 개편

## Background

eolma-web은 현재 Tailwind 기본 색상 클래스(`indigo-600`, `gray-*` 등)가 하드코딩되어 있고, 다크모드/PWA 미지원, 데스크톱 중심 레이아웃으로 되어 있다. 디자인 토큰 시스템(CSS 변수 + Tailwind v4 @theme)과 useTheme hook은 이미 구축 완료된 상태이므로, 이를 기반으로 모든 컴포넌트와 페이지를 토큰 기반으로 마이그레이션하고 당근/토스 스타일의 모바일 퍼스트 UI/UX로 전면 개편한다.

## Objective

모든 하드코딩 색상을 semantic 토큰으로 전환하고, light/dark 테마를 완전 지원하며, 모바일 퍼스트 레이아웃(BottomNav, 반응형)과 신규 common 컴포넌트(Card, Badge, Toast 등)를 도입하여 PWA/앱스토어 배포에 적합한 UI/UX를 완성한다.

## Requirements

### Functional Requirements
- FR-1: 모든 컴포넌트에서 하드코딩 색상 제거, semantic 토큰만 사용
- FR-2: light/dark 테마 전환이 모든 페이지에서 정상 동작
- FR-3: 모바일 하단 네비게이션(BottomNav) - 홈, 등록, 마이페이지
- FR-4: 데스크톱 Header 전체 네비게이션 + ThemeToggle
- FR-5: Card, Badge, Toast, Avatar, Tabs, BottomSheet, Skeleton 공통 컴포넌트
- FR-6: 모든 페이지 UI를 토큰 기반 + 모바일 퍼스트로 재설계
- FR-7: PWA manifest 설정

### Non-Functional Requirements
- NFR-1: `npm run build` 성공
- NFR-2: 모바일(375px) ~ 데스크톱(1280px) 전 뷰포트에서 깨지지 않는 레이아웃
- NFR-3: FOUC 없는 테마 전환

## Out of Scope
- 테스트 코드 작성 (향후 별도 세션)
- 서버 사이드 로직 변경
- API 변경
- 기능 추가/삭제 (순수 UI/UX 개편만)
- 토스페이먼츠 SDK 내부 UI 변경

## Technical Approach

이미 구축된 디자인 토큰 시스템을 활용:
- `src/styles/tokens/` - CSS 변수 (primitive + semantic, light/dark)
- `src/styles/theme.css` - Tailwind v4 @theme inline 매핑
- `src/hooks/useTheme.ts` - 테마 전환 hook
- 사용 가능한 유틸리티 클래스: `bg-primary`, `text-text-primary`, `border-border`, `shadow-card`, `bg-error-light` 등

### Affected Files

**신규 생성**:
- `src/components/common/Card.tsx`
- `src/components/common/Badge.tsx`
- `src/components/common/Toast.tsx`
- `src/components/common/Avatar.tsx`
- `src/components/common/Tabs.tsx`
- `src/components/common/BottomSheet.tsx`
- `src/components/common/Skeleton.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/layout/ThemeToggle.tsx`
- `src/lib/store/useToastStore.ts`
- `src/app/manifest.ts`

**수정**:
- `src/components/common/Button.tsx` - 토큰 마이그레이션
- `src/components/common/Input.tsx` - 토큰 마이그레이션
- `src/components/common/Select.tsx` - 토큰 마이그레이션
- `src/components/common/Textarea.tsx` - 토큰 마이그레이션
- `src/components/common/Modal.tsx` - 토큰 마이그레이션
- `src/components/common/Loading.tsx` - 토큰 마이그레이션
- `src/components/layout/Header.tsx` - 반응형 재설계 + 토큰
- `src/components/layout/Footer.tsx` - 토큰 마이그레이션
- `src/components/auction/AuctionCard.tsx` - Card/Badge 기반 재설계
- `src/components/auction/AuctionTimer.tsx` - 토큰 마이그레이션
- `src/components/auction/BidPanel.tsx` - 토큰 + 모바일 BottomSheet
- `src/components/auction/BidHistory.tsx` - 토큰 마이그레이션
- `src/components/product/ProductCard.tsx` - Card/Badge 기반 재설계
- `src/components/product/ProductForm.tsx` - 토큰 마이그레이션
- `src/components/product/ProductList.tsx` - 토큰 마이그레이션
- `src/components/auth/LoginForm.tsx` - 토스 스타일 재설계
- `src/components/auth/RegisterForm.tsx` - 토큰 마이그레이션
- `src/components/auth/SocialLoginButtons.tsx` - 토큰 마이그레이션
- `src/components/auth/AccountLinkModal.tsx` - 토큰 마이그레이션
- `src/components/payment/PaymentWidget.tsx` - 토큰 마이그레이션
- `src/app/layout.tsx` - BottomNav, ToastProvider 추가
- `src/app/page.tsx` - Tabs/Card/Badge 적용
- `src/app/auctions/[id]/page.tsx` - 토큰 + 모바일 대응
- `src/app/products/[id]/page.tsx` - 토큰 마이그레이션
- `src/app/products/new/page.tsx` - 토큰 마이그레이션
- `src/app/(auth)/login/page.tsx` - 토큰 마이그레이션
- `src/app/(auth)/register/page.tsx` - 토큰 마이그레이션
- `src/app/(auth)/auth/oauth/callback/page.tsx` - 토큰 마이그레이션
- `src/app/(auth)/auth/set-nickname/page.tsx` - 토큰 마이그레이션
- `src/app/mypage/page.tsx` - Avatar/Card 기반 재설계
- `src/app/mypage/layout.tsx` - 토큰 마이그레이션
- `src/app/mypage/products/page.tsx` - 토큰 마이그레이션
- `src/app/mypage/bids/page.tsx` - 토큰 마이그레이션
- `src/app/payments/[auctionId]/page.tsx` - Card 기반 재설계
- `src/app/payments/complete/page.tsx` - 토큰 마이그레이션

## Implementation Items

### Phase 1: Common 컴포넌트 개편 (병렬 단위 A)
- [x] 1-1: Button.tsx 토큰 마이그레이션 (indigo -> primary, gray -> semantic)
- [x] 1-2: Input.tsx, Select.tsx, Textarea.tsx 토큰 마이그레이션
- [x] 1-3: Modal.tsx 토큰 마이그레이션 (bg-white -> bg-bg-elevated, overlay)
- [x] 1-4: Loading.tsx 토큰 마이그레이션
- [x] 1-5: Card.tsx 신규 생성 (bg-bg-elevated, border, shadow-card, rounded-xl)
- [x] 1-6: Badge.tsx 신규 생성 (success/warning/error/info/neutral/primary variant)
- [x] 1-7: Toast.tsx + useToastStore.ts 신규 생성 (Zustand 기반 알림)
- [x] 1-8: Avatar.tsx 신규 생성 (이미지/이니셜, sm/md/lg)
- [x] 1-9: Tabs.tsx 신규 생성 (items + activeValue + onChange)
- [x] 1-10: BottomSheet.tsx 신규 생성 (모바일 바텀 시트)
- [x] 1-11: Skeleton.tsx 신규 생성 (로딩 스켈레톤)

### Phase 2: Layout 개편 (병렬 단위 B, Phase 1과 동시 진행 가능)
- [x] 2-1: BottomNav.tsx 신규 생성 (모바일 하단 네비, 당근/토스 스타일)
- [x] 2-2: Header.tsx 반응형 재설계 (모바일: 심플, 데스크톱: 풀 네비)
- [x] 2-3: ThemeToggle.tsx 신규 생성 (Sun/Moon 아이콘, useTheme)
- [x] 2-4: Footer.tsx 토큰 마이그레이션
- [x] 2-5: layout.tsx 최종 조립 (BottomNav, ToastProvider, pb-16 md:pb-0)
- [x] 2-6: PWA manifest.ts 생성 + 아이콘 placeholder

### Phase 3: 페이지 재설계 - Core (Phase 1,2 완료 후, 병렬 단위 C)
- [x] 3-1: 홈페이지 재설계 (Tabs 필터, AuctionCard -> Card/Badge, Skeleton)
- [x] 3-2: AuctionCard.tsx Card/Badge 기반 재설계
- [x] 3-3: 경매 상세 페이지 토큰 + 모바일 BottomSheet 입찰
- [x] 3-4: AuctionTimer.tsx, BidPanel.tsx, BidHistory.tsx 토큰 마이그레이션
- [x] 3-5: ProductCard.tsx Card/Badge 기반 재설계
- [x] 3-6: ProductForm.tsx, ProductList.tsx 토큰 마이그레이션
- [x] 3-7: 상품 상세/등록 페이지 토큰 마이그레이션

### Phase 4: 페이지 재설계 - Auth/MyPage/Payment (Phase 1,2 완료 후, 병렬 단위 D)
- [x] 4-1: LoginForm.tsx 토스 스타일 재설계
- [x] 4-2: RegisterForm.tsx 토큰 마이그레이션
- [x] 4-3: SocialLoginButtons.tsx, AccountLinkModal.tsx 토큰 마이그레이션
- [x] 4-4: 로그인/회원가입 페이지 토큰 마이그레이션
- [x] 4-5: OAuth 콜백, 닉네임 설정 페이지 토큰 마이그레이션
- [x] 4-6: 마이페이지 Avatar/Card/Tabs 기반 재설계
- [x] 4-7: 마이페이지 하위 페이지 (products, bids) 토큰 마이그레이션
- [x] 4-8: 결제 페이지 Card 기반 재설계
- [x] 4-9: 결제 완료 페이지 토큰 마이그레이션

### Phase 5: 최종 검증
- [x] 5-1: `npm run build` 성공 확인
- [x] 5-2: grep으로 하드코딩 색상 클래스 잔존 여부 확인
- [ ] 5-3: light/dark 테마 전환 전 페이지 확인

## Acceptance Criteria
- [x] AC-1: 모든 컴포넌트/페이지에서 `indigo-`, 하드코딩된 `gray-`, `green-`, `red-`, `yellow-` Tailwind 클래스가 없음
- [ ] AC-2: light/dark 테마 전환 시 모든 페이지가 정상 렌더링
- [ ] AC-3: 모바일(375px)에서 BottomNav 표시, Header 심플 모드
- [ ] AC-4: 데스크톱(1280px)에서 Header 풀 네비, Footer 표시
- [x] AC-5: `npm run build` 성공
- [x] AC-6: PWA manifest 로드 가능

## Notes
- Phase 1 + Phase 2는 병렬 진행 가능 (상호 독립)
- Phase 3 + Phase 4는 병렬 진행 가능 (상호 독립, Phase 1,2 완료 필요)
- 토스페이먼츠 SDK 내부 UI는 변경 불가, 래퍼 스타일만 토큰화
- 소셜 로그인 버튼의 브랜드 색상(Google #4285F4, Kakao #FEE500)은 예외적으로 유지 가능
