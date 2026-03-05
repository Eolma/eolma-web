# 프론트엔드 QA Round 4 버그 수정

## #4 [HIGH] mypage 하위 경로 인증 가드 미적용

**현상**: `/mypage`는 인증 가드 있지만 `/mypage/products`, `/mypage/bids`는 비로그인 접근 가능
**원인**: 각 하위 페이지에서 인증 상태 확인 로직 없음
**파일**: `src/app/mypage/bids/page.tsx`, `src/app/mypage/products/page.tsx`

### 구현
- [x] `src/app/mypage/layout.tsx` 생성 — mypage 그룹 공통 레이아웃에서 인증 가드 적용
  - `useAuthStore`의 `isAuthenticated`, `isLoading` 확인
  - 미인증 시 로그인 안내 + 로그인 링크 표시 (mypage/page.tsx와 동일 패턴)
  - 인증 완료 시 children 렌더링

## #5 [MEDIUM] 입찰 후 입찰 이력 자동 갱신

**현상**: 입찰 성공 후 입찰 이력 목록에 새 입찰이 반영 안 됨, 새로고침 필요
**원인**: `auctions/[id]/page.tsx`에서 WebSocket BID_RESULT 수신 시 bid history를 re-fetch하지 않음
**파일**: `src/app/auctions/[id]/page.tsx`

### 구현
- [x] `lastMessage`가 `BID_RESULT` + `ACCEPTED`일 때 `getBidHistory(id)` 재호출하여 `bids` 상태 업데이트

## #6 [MEDIUM] 입찰가 기본값이 최소 입찰가가 아닌 10,000원

**현상**: 최소 입찰가 960,000원인데 기본값 10,000원
**원인**: `BidPanel.tsx`에서 `useState(String(nextMinBid))`로 초기화하지만, `currentPrice` prop이 처음에 0이라 `nextMinBid = 0 + minBidUnit`이 됨. 이후 currentPrice가 업데이트돼도 state가 갱신 안 됨
**파일**: `src/components/auction/BidPanel.tsx`

### 구현
- [x] `currentPrice` 변경 시 `bidAmount`를 `nextMinBid`로 자동 갱신하는 `useEffect` 추가

## #7 [MEDIUM] 로그아웃 후 인증 필요 페이지에서 리다이렉트 없음

**현상**: `/mypage/bids`에서 로그아웃 → URL 그대로 유지
**원인**: `logout()` 함수가 상태만 초기화하고 리다이렉트하지 않음. 인증 가드가 없어서 페이지가 빈 상태로 남음
**해결**: #4의 layout.tsx 인증 가드로 자동 해결 — 로그아웃 시 isAuthenticated=false → 가드가 로그인 안내 표시

### 구현
- [x] #4 구현으로 자동 해결 확인. 추가로 Header의 로그아웃 버튼에서 홈으로 리다이렉트 추가 검토

## #9 [LOW] 상품 상세 이미지 깨짐

**현상**: `/products/1` 이미지 영역에 alt 텍스트만 표시
**원인**: imageUrls에 저장된 URL이 접근 불가능한 주소 (데이터/인프라 이슈일 가능성)
**파일**: `src/app/products/[id]/page.tsx`

### 구현
- [x] 이미지 로드 실패 시 fallback UI 표시 (onError 핸들러 추가)
