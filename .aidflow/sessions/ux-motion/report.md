# ux-motion - Report

## Summary
framer-motion 기반 마이크로 인터랙션 시스템 구축. 페이지 전환 fade+slide, 가격 롤링 애니메이션, BottomSheet 드래그 제스처, 버튼 ripple 효과, 스켈레톤 crossfade 전환을 구현했다.

## Plan Completion
### Phase 1: 기반 설정
- [x] 1-1: framer-motion 설치 (이미 설치됨)
- [x] 1-2: globals.css에 ripple @keyframes, prefers-reduced-motion (이미 존재)

### Phase 2: 핵심 컴포넌트
- [x] 2-1: AnimatedPrice 컴포넌트 생성
- [x] 2-2: PageTransition 래퍼 컴포넌트 생성
- [x] 2-3: Button.tsx에 ripple 효과 추가
- [x] 2-4: BottomSheet.tsx 드래그 제스처 + 닫힘 애니메이션

### Phase 3: 페이지 적용
- [x] 3-1: layout.tsx에 PageTransition 적용
- [x] 3-2: BidPanel, AuctionCard, 경매 상세 페이지에 AnimatedPrice 적용
- [x] 3-3: 홈/경매 목록 페이지에 스켈레톤 전환 AnimatePresence 적용

### Phase 4: 검증
- [x] 4-1: npm run build 성공
- [x] 4-2: 스모크 테스트

## Changed Files
| File | Change Type | Description |
|------|-------------|-------------|
| src/components/common/AnimatedPrice.tsx | new | 자릿수별 롤링 애니메이션 가격 컴포넌트 |
| src/components/common/PageTransition.tsx | new | pathname 기반 페이지 전환 래퍼 (fade+slide) |
| src/components/common/Button.tsx | modified | 클릭 좌표 기반 ripple 효과 추가 (ghost variant 제외) |
| src/components/common/BottomSheet.tsx | modified | framer-motion 드래그 제스처, 열림/닫힘 애니메이션 적용 |
| src/app/layout.tsx | modified | PageTransition 래퍼 추가 |
| src/components/auction/BidPanel.tsx | modified | 현재 최고가에 AnimatedPrice 적용 |
| src/components/auction/AuctionCard.tsx | modified | 카드 현재가에 AnimatedPrice 적용 |
| src/app/auctions/[id]/page.tsx | modified | 모바일 하단 현재가에 AnimatedPrice 적용 |
| src/app/page.tsx | modified | 스켈레톤 -> 콘텐츠 crossfade AnimatePresence 적용 |
| src/app/auctions/page.tsx | modified | 스켈레톤 -> 콘텐츠 crossfade AnimatePresence 적용 |

## Key Decisions
- framer-motion이 이미 package.json에 설치되어 있어 별도 설치 불필요
- globals.css에 ripple keyframe과 prefers-reduced-motion이 이미 존재하여 재활용
- BottomSheet는 variants 패턴으로 리팩토링하여 외부 컨테이너도 exit 애니메이션 지원
- ripple 효과는 CSS @keyframes 방식 (framer-motion 미사용) - 경량화 목적
- AnimatedPrice는 formatPrice 결과를 문자 단위로 분리하여 숫자만 애니메이션 적용

## Issues & Observations
- 리뷰에서 BottomSheet의 exit 애니메이션 미동작 이슈 발견 -> 외부 div를 motion.div + variants 패턴으로 수정
- layout.tsx 들여쓰기 불일치 수정
- 빌드 시 `location is not defined` 경고가 있으나, 이는 기존 코드(useAuctionSocket 등)의 SSR 이슈로 이번 세션과 무관

## Duration
- Started: 2026-03-05T09:47:46.776Z
- Completed: 2026-03-05 (current)
- Commits: 아직 커밋 전
