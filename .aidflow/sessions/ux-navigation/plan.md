# 네비게이션 & 탐색 UX 개선

## Background

현재 eolma-web의 탐색 경험은 웹 기본 동작에 의존한다. 목록은 버튼 페이지네이션으로 한 페이지씩 교체되고, 새로고침은 브라우저 기본 동작뿐이며, 뒤로가기 시 스크롤 위치가 복원되지 않고, 상품 등록 버튼은 BottomNav 탭에 묻혀있다. 모바일 네이티브 앱 수준의 탐색 UX를 제공해야 한다.

## Objective

Pull-to-refresh, 무한 스크롤, 스와이프 뒤로가기, 스크롤 복원, FAB을 구현하여 모바일에서 네이티브 앱과 동일한 탐색 경험을 제공한다.

## Requirements

### Functional Requirements
- FR-1: 모바일에서 목록 페이지를 아래로 당기면 새로고침 (Pull-to-refresh)
- FR-2: 경매 목록을 스크롤하면 자동으로 다음 페이지 로드 (무한 스크롤)
- FR-3: 모바일에서 좌→우 스와이프로 이전 페이지 복귀
- FR-4: 목록 → 상세 → 뒤로가기 시 이전 스크롤 위치 복원
- FR-5: 상품 등록 버튼을 FAB으로 분리 (스크롤 시 축소/확장)

### Non-Functional Requirements
- NFR-1: `npm run build` 성공
- NFR-2: 무한 스크롤 시 DOM 노드가 과도하게 쌓이지 않도록 관리 (최대 200개 카드)
- NFR-3: Pull-to-refresh는 60fps 유지

## Out of Scope
- 가상 스크롤링 (virtualization)
- 검색 기능
- 카테고리 필터링 UX 변경
- 데스크톱에서의 스와이프 제스처

## Technical Approach

### Pull-to-refresh (FR-1)
- `usePullToRefresh` 커스텀 훅 신규 생성
- `onTouchStart`/`onTouchMove`/`onTouchEnd` 이벤트 기반
- 스크롤 위치가 최상단(scrollTop === 0)일 때만 활성화
- 50px 이상 아래로 당기면 새로고침 트리거
- 시각 피드백: 상단에 회전 스피너 + "당겨서 새로고침" / "놓으면 새로고침" 텍스트
- 적용 대상: 홈(`page.tsx`), 경매 목록(`auctions/page.tsx`)
- 기존 fetch 로직을 `fetchAuctions` 함수로 분리하여 재호출

### 무한 스크롤 (FR-2)
- `useInfiniteScroll` 커스텀 훅 신규 생성
- `IntersectionObserver`로 sentinel element 감지
- `setAuctions(prev => [...prev, ...data.content])` 누적 방식으로 변경
- `hasNext === false` 시 observer disconnect
- 탭/필터 변경 시 `setAuctions([])` + `setPage(0)` 리셋
- 로딩 중 하단에 스피너 표시
- 기존 이전/다음 버튼 페이지네이션 제거

### 스와이프 뒤로가기 (FR-3)
- `useSwipeBack` 커스텀 훅 신규 생성
- 화면 좌측 20px 영역에서 시작하는 우측 스와이프만 감지 (edge swipe)
- 100px 이상 또는 velocity > 300px/s 시 `router.back()` 트리거
- 스와이프 중 현재 페이지가 오른쪽으로 이동하는 시각 피드백 (translateX)
- 뒤에 반투명 오버레이로 이전 페이지 힌트
- `layout.tsx`에 전역 적용, 모바일에서만 동작 (md 이상 비활성)

### 스크롤 복원 (FR-4)
- `useScrollRestoration` 커스텀 훅 신규 생성
- `sessionStorage`에 pathname별 scrollY 저장
- 페이지 이탈 시 현재 scrollY 저장, 뒤로가기 시 복원
- `next/navigation`의 `usePathname` 활용
- 무한 스크롤과 연계: 복원 시 해당 위치까지의 데이터도 로드 필요
  - `sessionStorage`에 로드된 page 수도 함께 저장
  - 복원 시 해당 페이지 수만큼 한번에 fetch

### FAB (FR-5)
- `FloatingActionButton` 컴포넌트 신규 생성
- 위치: `fixed bottom-20 right-4` (BottomNav 위)
- 기본 상태: 원형 아이콘 + "등록" 텍스트 (확장)
- 아래로 스크롤 시: 원형 아이콘만 (축소) - `motion.div` layoutId
- 위로 스크롤 시: 다시 확장
- BottomNav에서 "등록" 탭 제거, 홈/마이 2탭으로 변경
- z-index: BottomNav(z-50) 아래 `z-40`

### Affected Files

**신규 생성**:
- `src/hooks/usePullToRefresh.ts` - Pull-to-refresh 훅
- `src/hooks/useInfiniteScroll.ts` - 무한 스크롤 훅
- `src/hooks/useSwipeBack.ts` - 스와이프 뒤로가기 훅
- `src/hooks/useScrollRestoration.ts` - 스크롤 복원 훅
- `src/components/common/FloatingActionButton.tsx` - FAB 컴포넌트
- `src/components/common/PullToRefresh.tsx` - Pull-to-refresh UI 컴포넌트

**수정**:
- `src/app/page.tsx` - 무한 스크롤 + Pull-to-refresh 적용, 페이지네이션 제거
- `src/app/auctions/page.tsx` - 무한 스크롤 + Pull-to-refresh 적용, 페이지네이션 제거
- `src/app/layout.tsx` - SwipeBack 전역 적용, FAB 추가
- `src/components/layout/BottomNav.tsx` - "등록" 탭 제거, 2탭 구조로 변경
- `src/app/mypage/bids/page.tsx` - 무한 스크롤 적용 (필요 시)

## Implementation Items

### Phase 1: 커스텀 훅 생성
- [x] 1-1: useInfiniteScroll 훅 생성 (IntersectionObserver)
- [x] 1-2: usePullToRefresh 훅 생성 (touch 이벤트)
- [x] 1-3: useScrollRestoration 훅 생성 (sessionStorage)
- [x] 1-4: useSwipeBack 훅 생성 (edge swipe 감지)

### Phase 2: UI 컴포넌트
- [x] 2-1: PullToRefresh UI 컴포넌트 생성 (스피너 + 텍스트)
- [x] 2-2: FloatingActionButton 컴포넌트 생성 (확장/축소)
- [x] 2-3: BottomNav에서 "등록" 탭 제거, 홈/마이 2탭으로 변경

### Phase 3: 페이지 적용
- [x] 3-1: 홈 페이지에 무한 스크롤 + Pull-to-refresh 적용
- [x] 3-2: 경매 목록 페이지에 무한 스크롤 + Pull-to-refresh 적용
- [x] 3-3: layout.tsx에 SwipeBack + FAB + 스크롤 복원 적용

### Phase 4: 검증
- [x] 4-1: npm run build 확인
- [x] 4-2: 스모크 테스트 (스크롤, 새로고침, 뒤로가기, FAB)

## Acceptance Criteria
- [x] AC-1: 모바일에서 목록을 아래로 당기면 새로고침됨
- [x] AC-2: 목록 하단 도달 시 자동으로 다음 페이지 로드됨
- [x] AC-3: 모바일 좌측 가장자리에서 우측 스와이프 시 뒤로가기됨
- [x] AC-4: 목록 → 상세 → 뒤로가기 시 이전 스크롤 위치로 복원됨
- [x] AC-5: 우하단에 FAB이 표시되고 클릭 시 상품 등록 페이지로 이동함
- [x] AC-6: FAB이 스크롤 방향에 따라 확장/축소됨
- [x] AC-7: npm run build 성공

## Notes
- 무한 스크롤로 전환 시 기존 "페이지 N" 표시와 이전/다음 버튼은 완전히 제거
- Pull-to-refresh는 iOS Safari에서 기본 bounce 효과와 충돌할 수 있음 → `overscroll-behavior: none` CSS 추가 필요
- 스크롤 복원 + 무한 스크롤 조합은 복잡도가 높음: 저장 시점에 로드된 페이지 수를 함께 기록해야 함
- SwipeBack은 BottomSheet가 열려있을 때는 비활성화해야 함 (이벤트 충돌 방지)
- FAB z-index는 경매 상세 페이지의 모바일 입찰 바(z-40)와 같은 레벨 → 경매 상세에서는 FAB 숨김 처리 필요
- framer-motion은 ux-motion 세션에서 설치, 여기서는 FAB 축소/확장에만 활용
