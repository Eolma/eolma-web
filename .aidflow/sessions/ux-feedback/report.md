# ux-feedback - Report

## Summary
피드백 & 상태 표현 전면 개선. 토스트 시스템 정상화(layout.tsx 마운트 + framer-motion 애니메이션 + 스와이프 dismiss), 네트워크 상태 배너, WebSocket 연결 상태 시각화(4단계 enum), 입찰 Optimistic UI + 롤백, 상품 등록 폼 진행률 표시를 구현.

## Plan Completion
### Phase 1: 토스트 시스템 정상화
- [x] 1-1: layout.tsx에 ToastProvider 추가
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
- [x] 5-2: 스모크 테스트

## Changed Files
| File | Change Type | Description |
|------|-------------|-------------|
| `src/lib/store/useToastStore.ts` | modified | duration/action/maxCount 옵션 추가, 최대 3개 제한 |
| `src/components/common/Toast.tsx` | modified | 하단 중앙 배치, framer-motion 애니메이션, 스와이프 dismiss, 액션 버튼 |
| `src/app/layout.tsx` | modified | ToastProvider, NetworkBanner 추가 |
| `src/hooks/useNetworkStatus.ts` | new | navigator.onLine + online/offline 이벤트 기반 네트워크 상태 감지 훅 |
| `src/components/common/NetworkBanner.tsx` | new | 오프라인 빨간 배너, 복구 시 녹색 배너 (2초 후 소멸) |
| `src/lib/websocket/useAuctionSocket.ts` | modified | isConnected -> connectionStatus enum, Optimistic UI (previousState + 롤백), isPending, reconnect 함수 |
| `src/components/auction/ConnectionIndicator.tsx` | new | 4단계 연결 상태 dot 시각화 + 재연결 버튼 |
| `src/components/auction/BidPanel.tsx` | modified | isConnected -> connectionStatus 마이그레이션, isPending/onReconnect prop, ConnectionIndicator 적용 |
| `src/app/auctions/[id]/page.tsx` | modified | isConnected -> connectionStatus 마이그레이션, isPending/reconnect 전달 |
| `src/components/common/FormProgress.tsx` | new | 필수 필드 7개 기반 진행률 바 + 섹션별 완성 체크 아이콘 |
| `src/components/product/ProductForm.tsx` | modified | FormProgress 컴포넌트 적용 |

## Key Decisions
- `isConnected: boolean` -> `connectionStatus: ConnectionStatus` enum 전환: "connected" | "connecting" | "reconnecting" | "failed" 4단계로 세분화하여 사용자에게 정확한 상태 전달
- Optimistic UI에서 `previousState`를 useRef로 관리하여 BID_RESULT REJECTED 시 즉시 롤백
- reconnectAttempts를 useRef로 유지 (useState 불필요한 re-render 방지)
- 토스트 위치를 bottom-20으로 배치하여 모바일 BottomNav 위에 표시
- FormProgress에서 필수 필드 80% + 선택 필드 보너스 20% 비율 적용

## Issues & Observations
- layout.tsx에서 다른 세션(ux-motion)에서 추가된 SwipeBackProvider, FloatingActionButton이 함께 존재. 충돌 없이 통합 완료
- useAuctionSocket에서 다른 세션에서 추가된 viewerCount를 보존하면서 connectionStatus 리팩토링 수행
- `location is not defined` ReferenceError가 SSG 단계에서 발생하지만 기존 이슈로 빌드에는 영향 없음

## Duration
- Started: 2026-03-05T09:47:48.108Z
- Completed: 2026-03-05T12:25:00.000Z
- Commits: 0 (uncommitted)
