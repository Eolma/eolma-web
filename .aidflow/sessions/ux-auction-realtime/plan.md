# 실시간 경매 UX 강화

## Background

현재 경매 상세 페이지의 실시간 UX는 최소한의 기능만 갖추고 있다. 입찰 성공 시 단순 배너 텍스트만 표시되고, 타이머 긴급 상태는 색상 변경만 있으며, 다른 사용자의 입찰은 BidHistory를 수동 확인해야 하고, 경매 종료 시 정적 카드만 표시된다. 실시간 경매의 흥분감과 몰입감을 극대화하기 위한 UX 개선이 필요하다.

## Objective

입찰 축하 효과, 타이머 심박, 실시간 피드, 롱프레스 확인, 참여자 수 표시, 종료 카운트다운, 상태 전환 애니메이션을 구현하여 경매 참여 경험을 극적으로 향상시킨다.

## Requirements

### Functional Requirements
- FR-1: 입찰 성공(ACCEPTED) 시 confetti 파티클 + 숫자 카운트업 축하 효과
- FR-2: 마감 60초 이하 시 타이머에 pulse 심박 효과, 30초 이하 시 더 빠른 심박
- FR-3: AUCTION_UPDATE 수신 시 "누군가 N원에 입찰" 슬라이드-인 피드 아이템 표시
- FR-4: 입찰 버튼에 롱프레스(500ms) 확인 패턴 적용 (프로그레스 링 시각 피드백)
- FR-5: 경매 상세 페이지에 실시간 참여자 수(viewerCount) 표시 UI 준비
- FR-6: 마지막 5초에 전체화면 카운트다운 오버레이 (3, 2, 1... 낙찰!)
- FR-7: AUCTION_CLOSED 수신 시 경매 상태가 시각적으로 전환 (grayscale + 낙찰 오버레이)

### Non-Functional Requirements
- NFR-1: `npm run build` 성공
- NFR-2: 실시간 피드는 최대 10개까지만 유지 (메모리 관리)
- NFR-3: 모션은 framer-motion 사용 (ux-motion 세션에서 설치)

## Out of Scope
- 백엔드 WebSocket 메시지 확장 (별도 백엔드 세션에서 진행)
- 소리/진동 피드백 (향후 별도 구현)
- 입찰 취소 기능

## Technical Approach

### 입찰 축하 효과 (FR-1)
- `BidCelebration` 컴포넌트 신규 생성
- canvas 기반 confetti 파티클 (경량 직접 구현, 라이브러리 미사용)
- `page.tsx`에서 `lastBidResult.status === "ACCEPTED"` 조건으로 트리거
- 2초 후 자동 소멸

### 타이머 심박 (FR-2)
- `AuctionTimer.tsx` 수정
- `remainingSeconds <= 60`: `animate-[heartbeat_1s_ease-in-out_infinite]`
- `remainingSeconds <= 30`: `animate-[heartbeat_0.5s_ease-in-out_infinite]`
- globals.css에 `@keyframes heartbeat` 추가 (scale 1→1.05→1)

### 실시간 입찰 피드 (FR-3)
- `BidFeed` 컴포넌트 신규 생성
- `page.tsx`에서 `lastMessage.type === "AUCTION_UPDATE"` 감지 시 피드 배열에 push
- 각 피드 아이템은 오른쪽에서 슬라이드-인 → 3초 후 페이드아웃
- 최대 10개 유지, FIFO

### 롱프레스 확인 (FR-4)
- `BidPanel.tsx`의 submit 버튼을 `LongPressButton` 컴포넌트로 교체
- `onPointerDown` 시작 → 500ms 타이머 → 완료 시 submit
- 원형 프로그레스 링(SVG circle stroke-dashoffset 애니메이션)으로 시각 피드백
- 중간에 손 떼면 취소

### 참여자 수 표시 UI (FR-5)
- `useAuctionSocket.ts`에 `viewerCount` state 추가 (기본값 null)
- `AUCTION_UPDATE` 메시지에 `viewerCount` 필드가 있으면 갱신
- `page.tsx`에서 viewerCount가 null이 아닐 때만 표시 (백엔드 준비 전까지 숨김)
- UI: `Eye` 아이콘 + "N명 참여 중"

### 종료 카운트다운 오버레이 (FR-6)
- `AuctionCountdown` 컴포넌트 신규 생성
- `remainingSeconds <= 5 && remainingSeconds > 0` 일 때 전체화면 오버레이
- 숫자가 크게 표시되며 scale + fade 애니메이션
- `remainingSeconds === 0` 시 "낙찰!" 텍스트 + 축하 효과

### 상태 전환 애니메이션 (FR-7)
- `page.tsx`에서 `AUCTION_CLOSED` 수신 시:
  - auction status를 로컬 state로 관리
  - 페이지 전체에 `grayscale` CSS filter 트랜지션
  - 낙찰 결과 오버레이 (낙찰자, 낙찰가 표시)
  - 본인이 낙찰자인 경우 "결제하기" CTA 강조

### Affected Files

**신규 생성**:
- `src/components/auction/BidCelebration.tsx` - confetti 축하 효과
- `src/components/auction/BidFeed.tsx` - 실시간 입찰 피드
- `src/components/auction/LongPressButton.tsx` - 롱프레스 확인 버튼
- `src/components/auction/AuctionCountdown.tsx` - 종료 카운트다운 오버레이

**수정**:
- `src/components/auction/AuctionTimer.tsx` - 심박 효과 추가
- `src/components/auction/BidPanel.tsx` - LongPressButton 적용
- `src/lib/websocket/useAuctionSocket.ts` - viewerCount state 추가
- `src/types/auction.ts` - AUCTION_UPDATE에 viewerCount 옵셔널 필드 추가
- `src/app/auctions/[id]/page.tsx` - 축하/피드/카운트다운/상태전환 통합
- `src/app/globals.css` - heartbeat keyframe 추가

## Implementation Items

### Phase 1: 기반 컴포넌트
- [x] 1-1: globals.css에 heartbeat keyframe 추가
- [x] 1-2: AuctionTimer 심박 효과 적용 (60초/30초 분기)
- [x] 1-3: LongPressButton 컴포넌트 생성 (SVG 프로그레스 링)

### Phase 2: 실시간 피드 & 축하
- [x] 2-1: BidCelebration 컴포넌트 생성 (canvas confetti)
- [x] 2-2: BidFeed 컴포넌트 생성 (슬라이드-인 피드)
- [x] 2-3: useAuctionSocket에 viewerCount state 추가, 타입 확장

### Phase 3: 종료 연출
- [x] 3-1: AuctionCountdown 오버레이 컴포넌트 생성
- [x] 3-2: 경매 종료 시 상태 전환 + grayscale 효과

### Phase 4: 통합 & 검증
- [x] 4-1: 경매 상세 페이지에 모든 컴포넌트 통합
- [x] 4-2: BidPanel에 LongPressButton 적용
- [x] 4-3: npm run build 확인
- [x] 4-4: 스모크 테스트 (입찰 성공/실패, 타이머, 종료 시나리오)

## Acceptance Criteria
- [x] AC-1: 입찰 성공 시 confetti 파티클이 화면에 표시됨
- [x] AC-2: 마감 60초 이하에서 타이머가 pulse 효과를 보임
- [x] AC-3: 다른 사용자 입찰 시 슬라이드-인 피드가 나타남
- [x] AC-4: 입찰 버튼을 500ms 이상 누르면 입찰이 실행됨 (짧게 누르면 취소)
- [x] AC-5: viewerCount 필드가 있을 때 참여자 수가 표시됨
- [x] AC-6: 마지막 5초에 전체화면 카운트다운이 표시됨
- [x] AC-7: 경매 종료 시 화면이 grayscale로 전환되며 낙찰 결과가 표시됨
- [x] AC-8: npm run build 성공

## Notes
- framer-motion은 ux-motion 세션에서 설치하므로, 이 세션은 ux-motion 이후 또는 동시 진행 시 package.json 충돌 주의
- confetti는 canvas-confetti 라이브러리 대신 직접 구현 (SPEC.md 외부 UI 라이브러리 금지 원칙 준수)
- B.11 viewerCount는 백엔드에서 AUCTION_UPDATE 메시지에 필드 추가 후 자동 동작하도록 설계
- 롱프레스 패턴은 즉시구매 버튼에도 동일하게 적용 (실수 방지 효과 극대화)
- AUCTION_UPDATE에 bidderNickname이 없으므로 피드는 "누군가 N원에 입찰" 형태로만 표시
