# 피드백 & 상태 표현 개선

## Background

현재 eolma-web은 사용자에게 시스템 상태를 충분히 전달하지 못한다. 입찰 후 서버 응답까지 피드백이 없고(Optimistic UI 부재), 토스트가 layout에 마운트되어 있지 않아 실제로 표시되지 않으며, 상품 등록 폼의 진행 상태를 알 수 없고, 네트워크/WebSocket 연결 상태도 불투명하다. 사용자가 시스템의 현재 상태를 항상 인지할 수 있도록 피드백 시스템을 전면 개선한다.

## Objective

Optimistic UI, 토스트 시스템 정상화 및 개선, 폼 진행률 표시, 네트워크 상태 배너, WebSocket 연결 상태 시각화를 구현하여 사용자에게 즉각적이고 명확한 피드백을 제공한다.

## Requirements

### Functional Requirements
- FR-1: 입찰 시 서버 응답 전에 즉시 UI 반영 (Optimistic Update), 실패 시 롤백
- FR-2: 토스트를 하단 중앙으로 이동, 스와이프 dismiss, 액션 버튼, duration 파라미터화
- FR-3: 상품 등록 폼에 필수 필드 완성도 기반 progress bar 표시
- FR-4: 오프라인/온라인 전환 시 상단 배너로 네트워크 상태 알림
- FR-5: WebSocket 연결 상태를 connected/connecting/reconnecting/failed 4단계로 시각화

### Non-Functional Requirements
- NFR-1: `npm run build` 성공
- NFR-2: Optimistic UI 롤백은 500ms 이내 완료
- NFR-3: 토스트 애니메이션은 framer-motion 사용

## Out of Scope
- 폼 자동 저장 (draft)
- 서비스 워커 기반 오프라인 캐싱
- 에러 바운더리 리팩토링

## Technical Approach

### Optimistic UI (FR-1)
- `useAuctionSocket.ts`의 `placeBid` 함수 수정
- `placeBid()` 호출 직후 `currentPrice`, `bidCount`를 낙관적으로 업데이트
- 이전 값을 `previousState` ref에 보관
- `BID_RESULT` 수신 시:
  - `ACCEPTED`: 서버 값으로 정확히 동기화 (낙관적 값 유지 또는 보정)
  - `REJECTED`: `previousState`로 롤백
- `BidPanel`에 `isPending` state 추가: 입찰 전송 ~ 응답 수신까지 버튼 로딩 상태

### 토스트 개선 (FR-2)
- `Toast.tsx` 전면 리팩토링:
  - 위치: `fixed bottom-20 left-1/2 -translate-x-1/2` (모바일 BottomNav 위)
  - framer-motion `AnimatePresence` + `motion.div`로 진입/퇴장 애니메이션
  - 스와이프 dismiss: `drag="x"` + `onDragEnd` velocity 체크
  - 최대 3개 스택 표시
- `useToastStore.ts` 개선:
  - `addToast(type, message, options?)` - duration 파라미터(기본 3000ms)
  - `action` 옵션: `{ label: string, onClick: () => void }` 액션 버튼
  - 최대 토스트 개수 제한 (3개, 초과 시 가장 오래된 것 제거)
- `layout.tsx`에 `<ToastProvider />` 추가 (현재 누락 상태)

### 폼 진행률 (FR-3)
- `FormProgress` 컴포넌트 신규 생성
- 필수 필드 7개 기준 완성도 계산: title, description, category, conditionGrade, startingPrice, endType, endValue
- 선택 필드 보너스: imageUrls(+10%), instantPrice(+5%), reservePrice(+5%)
- 상단 고정 progress bar (0~100%)
- 섹션별 완성 체크 아이콘: "기본 정보", "경매 설정", "이미지"

### 네트워크 상태 (FR-4)
- `useNetworkStatus` 커스텀 훅 신규 생성
- `navigator.onLine` + `online`/`offline` 이벤트 리스너
- `NetworkBanner` 컴포넌트: 오프라인 시 상단 고정 빨간 배너 "인터넷 연결이 끊어졌습니다"
- 복구 시 2초간 녹색 배너 "연결이 복구되었습니다" 후 자동 소멸
- `layout.tsx`에 추가

### WebSocket 연결 상태 시각화 (FR-5)
- `useAuctionSocket.ts` 수정:
  - `isConnected` boolean → `connectionStatus` enum 변환
  - `"connected" | "connecting" | "reconnecting" | "failed"` 4단계
  - `reconnectAttempts`를 useState로 승격 (현재 useRef)
  - MAX_RECONNECT_ATTEMPTS 초과 시 `"failed"` 상태
- `ConnectionIndicator` 컴포넌트 신규 생성:
  - 녹색 dot: connected
  - 노란색 dot + pulse: connecting/reconnecting (시도 횟수 표시)
  - 빨간색 dot: failed + "재연결" 버튼
- BidPanel의 기존 "서버 연결 중..." 배너를 ConnectionIndicator로 교체

### Affected Files

**신규 생성**:
- `src/hooks/useNetworkStatus.ts` - 네트워크 상태 감지 훅
- `src/components/common/NetworkBanner.tsx` - 오프라인/온라인 배너
- `src/components/common/FormProgress.tsx` - 폼 진행률 컴포넌트
- `src/components/auction/ConnectionIndicator.tsx` - WebSocket 상태 표시

**수정**:
- `src/components/common/Toast.tsx` - 전면 리팩토링 (위치, 애니메이션, 스와이프)
- `src/lib/store/useToastStore.ts` - duration, action, 최대 개수 관리
- `src/lib/websocket/useAuctionSocket.ts` - Optimistic UI + connectionStatus enum
- `src/components/auction/BidPanel.tsx` - isPending 상태, ConnectionIndicator 적용
- `src/components/product/ProductForm.tsx` - FormProgress 적용
- `src/app/layout.tsx` - ToastProvider 추가, NetworkBanner 추가
- `src/app/auctions/[id]/page.tsx` - Optimistic UI 연동

## Implementation Items

### Phase 1: 토스트 시스템 정상화
- [x] 1-1: layout.tsx에 ToastProvider 추가 (현재 누락 수정)
- [x] 1-2: useToastStore 개선 (duration, action, maxCount)
- [x] 1-3: Toast.tsx 리팩토링 (하단 중앙, framer-motion, 스와이프 dismiss)

### Phase 2: 상태 감지 시스템
- [x] 2-1: useNetworkStatus 훅 생성
- [x] 2-2: NetworkBanner 컴포넌트 생성, layout.tsx에 적용
- [x] 2-3: useAuctionSocket connectionStatus enum 리팩토링
- [x] 2-4: ConnectionIndicator 컴포넌트 생성, BidPanel에 적용

### Phase 3: Optimistic UI
- [x] 3-1: useAuctionSocket placeBid에 낙관적 업데이트 + 롤백 로직
- [x] 3-2: BidPanel에 isPending 상태 추가

### Phase 4: 폼 진행률
- [x] 4-1: FormProgress 컴포넌트 생성
- [x] 4-2: ProductForm에 FormProgress 적용

### Phase 5: 검증
- [x] 5-1: npm run build 확인
- [x] 5-2: 스모크 테스트 (토스트 표시, 네트워크 끊김, 입찰 Optimistic, 폼 진행률)

## Acceptance Criteria
- [x] AC-1: 입찰 버튼 클릭 즉시 가격이 변경되고, 실패 시 원래 값으로 돌아감
- [x] AC-2: 토스트가 하단 중앙에 표시되고 좌우 스와이프로 닫을 수 있음
- [x] AC-3: 토스트에 액션 버튼이 표시될 수 있음 (예: "취소" 버튼)
- [x] AC-4: 상품 등록 폼 상단에 진행률 바가 표시되고 필드 입력에 따라 증가함
- [x] AC-5: 인터넷 연결이 끊기면 상단에 빨간 배너가 표시됨
- [x] AC-6: WebSocket 연결 상태가 컬러 dot으로 시각화됨
- [x] AC-7: npm run build 성공

## Notes
- 토스트가 현재 layout.tsx에 마운트되지 않은 버그 발견 → Phase 1에서 최우선 수정
- Optimistic UI는 동시 입찰 시 race condition 주의: 서버 응답의 currentPrice가 항상 최종 진실
- NetworkBanner는 SSR과 충돌 가능 → `typeof window !== 'undefined'` 가드 필요
- connectionStatus enum으로 변환 시 기존 `isConnected` prop을 쓰는 곳 모두 마이그레이션 필요
- framer-motion은 ux-motion 세션에서 설치
