# 마이크로 인터랙션 & 모션 시스템

## Background

현재 eolma-web의 애니메이션은 Tailwind `active:scale-[0.97]`, `animate-pulse`, 커스텀 `@keyframes slideIn/slideUp` 수준에 머물러 있다. 페이지 전환은 즉시 교체, BottomSheet는 닫힘 애니메이션 없이 unmount, 가격 변동은 정적 텍스트 교체, 스켈레톤에서 콘텐츠 전환도 즉시 교체된다. framer-motion을 도입하여 전반적인 모션 시스템을 구축한다.

## Objective

framer-motion 기반으로 페이지 전환, 가격 롤링, BottomSheet 드래그 제스처, 버튼 ripple, 스켈레톤 전환 애니메이션을 구현하여 네이티브 앱 수준의 인터랙션 품질을 달성한다.

## Requirements

### Functional Requirements
- FR-1: 페이지 전환 시 fade + 미세 slide 애니메이션 적용
- FR-2: 실시간 가격 변동 시 숫자가 롤링/플립 애니메이션으로 전환
- FR-3: BottomSheet를 터치 드래그로 열기/닫기 가능 (velocity 기반 snap)
- FR-4: 버튼 클릭 시 클릭 지점에서 ripple 효과 확산
- FR-5: 스켈레톤에서 실제 콘텐츠로 crossfade 전환

### Non-Functional Requirements
- NFR-1: `npm run build` 성공
- NFR-2: light/dark 테마 정상 동작 유지
- NFR-3: 모션 성능 - 60fps 유지 (transform/opacity만 애니메이션)
- NFR-4: `prefers-reduced-motion` 미디어 쿼리 존중

## Out of Scope
- 카드 리스트 stagger 진입 (A.4 - 이번 세션 미선택)
- Lottie/SVG 애니메이션
- 서버 사이드 로직 변경
- 기존 컴포넌트 기능 변경

## Technical Approach

### 라이브러리
- `framer-motion` 설치 (AnimatePresence, motion, useDragControls)

### 페이지 전환 (FR-1)
- `layout.tsx`의 `<main>` 내부에 `PageTransition` 래퍼 컴포넌트 추가
- `AnimatePresence` + `motion.div`로 key={pathname} 기반 전환
- 효과: `opacity: 0→1`, `y: 8→0`, duration 0.2s

### 가격 롤링 (FR-2)
- `AnimatedPrice` 컴포넌트 신규 생성
- 각 자릿수를 개별 `motion.span`으로 분리
- 숫자 변경 시 `y` 방향 슬라이드 전환 (이전 숫자 위로 사라지고 새 숫자 아래서 올라옴)
- 적용 대상: `BidPanel.tsx:59` (현재 최고가), `AuctionCard.tsx:40-41` (카드 현재가), `page.tsx:196-198` (모바일 하단 현재가)

### BottomSheet 드래그 (FR-3)
- 현재 `BottomSheet.tsx` 리팩토링
- `motion.div` + `drag="y"` + `dragConstraints` + `onDragEnd` velocity 체크
- 닫힘 애니메이션 추가: `isOpen` 전환 시 `AnimatePresence` exitBeforeEnter
- 임계값: 150px 이상 드래그 또는 velocity > 500px/s 시 닫기

### 버튼 Ripple (FR-4)
- `Button.tsx`에 ripple 로직 추가
- `onClick` 이벤트에서 클릭 좌표 계산 → 절대위치 `span` 확장 애니메이션
- `overflow-hidden` + `position: relative` 추가
- CSS `@keyframes ripple` 사용 (scale 0→4, opacity 1→0)

### 스켈레톤 전환 (FR-5)
- 목록 페이지(`page.tsx`, `auctions/page.tsx`)에서 loading 조건부 렌더링에 `AnimatePresence` 적용
- 스켈레톤: `exit={{ opacity: 0 }}`, 콘텐츠: `initial={{ opacity: 0 }} animate={{ opacity: 1 }}`

### Affected Files

**신규 생성**:
- `src/components/common/AnimatedPrice.tsx` - 가격 롤링 컴포넌트
- `src/components/common/PageTransition.tsx` - 페이지 전환 래퍼

**수정**:
- `package.json` - framer-motion 의존성 추가
- `src/app/layout.tsx` - PageTransition 래퍼 추가
- `src/components/common/Button.tsx` - ripple 효과 추가
- `src/components/common/BottomSheet.tsx` - 드래그 제스처 + AnimatePresence
- `src/components/auction/BidPanel.tsx` - AnimatedPrice 적용
- `src/components/auction/AuctionCard.tsx` - AnimatedPrice 적용
- `src/app/auctions/[id]/page.tsx` - AnimatedPrice 적용 + 모바일 현재가
- `src/app/page.tsx` - 스켈레톤 전환 AnimatePresence
- `src/app/auctions/page.tsx` - 스켈레톤 전환 AnimatePresence
- `src/app/globals.css` - ripple keyframe 추가

## Implementation Items

### Phase 1: 기반 설정
- [x] 1-1: framer-motion 설치
- [x] 1-2: globals.css에 ripple @keyframes, prefers-reduced-motion 미디어 쿼리 추가

### Phase 2: 핵심 컴포넌트
- [x] 2-1: AnimatedPrice 컴포넌트 생성 (자릿수별 롤링 애니메이션)
- [x] 2-2: PageTransition 래퍼 컴포넌트 생성
- [x] 2-3: Button.tsx에 ripple 효과 추가
- [x] 2-4: BottomSheet.tsx 드래그 제스처 + 닫힘 애니메이션 리팩토링

### Phase 3: 페이지 적용
- [x] 3-1: layout.tsx에 PageTransition 적용
- [x] 3-2: BidPanel, AuctionCard, 경매 상세 페이지에 AnimatedPrice 적용
- [x] 3-3: 홈/경매 목록 페이지에 스켈레톤 전환 AnimatePresence 적용

### Phase 4: 검증
- [x] 4-1: npm run build 성공 확인
- [x] 4-2: 각 애니메이션 동작 스모크 테스트

## Acceptance Criteria
- [x] AC-1: 페이지 이동 시 fade+slide 전환 애니메이션이 보임
- [x] AC-2: 실시간 입찰로 가격 변동 시 숫자가 롤링 애니메이션으로 전환됨
- [x] AC-3: BottomSheet를 터치 드래그로 아래로 끌어 닫을 수 있음
- [x] AC-4: 버튼 클릭 시 클릭 지점에서 ripple이 확산됨
- [x] AC-5: 스켈레톤 → 콘텐츠 전환 시 crossfade 됨
- [x] AC-6: npm run build 성공

## Notes
- SPEC.md Anti-patterns에 "외부 UI 라이브러리 도입 금지"가 있으나, framer-motion은 UI 라이브러리가 아닌 모션 라이브러리이므로 예외 적용
- AnimatedPrice는 `formatPrice` 유틸과 조합하여 사용 (원 단위 포맷팅 후 자릿수 분리)
- BottomSheet 드래그는 모바일에서만 활성화 (md 이상에서는 Modal 모드이므로 드래그 불필요)
- ripple 효과는 `ghost` variant에서는 적용하지 않는 것이 자연스러움
