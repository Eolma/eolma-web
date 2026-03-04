# eolma-web Development Guide

## 서비스 개요

Next.js 기반 프론트엔드 웹 애플리케이션.

- 포트: 3000
- 프레임워크: Next.js 16 + React 19 + TypeScript
- 스타일링: Tailwind CSS 4
- 상태관리: Zustand 5
- 결제: @tosspayments/payment-widget-sdk

## 프로젝트 구조

```
src/
  app/                    -- Next.js App Router 페이지
    (auth)/login/         -- 로그인
    (auth)/register/      -- 회원가입
    products/new/         -- 상품 등록
    products/[id]/        -- 상품 상세
    auctions/             -- 경매 목록 (메인)
    auctions/[id]/        -- 경매 상세 (실시간 입찰)
    payments/[auctionId]/ -- 결제
    payments/complete/    -- 결제 완료
    mypage/               -- 마이페이지
    mypage/products/      -- 내 상품
    mypage/bids/          -- 내 입찰
  components/
    common/               -- Button, Input, Modal, Select, Loading 등
    layout/               -- Header, Footer, AuthInitializer
    auth/                 -- LoginForm, RegisterForm
    product/              -- ProductCard, ProductForm, ProductList
    auction/              -- AuctionCard, AuctionTimer, BidPanel, BidHistory
    payment/              -- PaymentWidget
  lib/
    api/                  -- API 클라이언트 모듈
      client.ts           -- HTTP 클라이언트 (fetch 기반, 토큰 자동 갱신)
      auth.ts             -- 인증 API
      products.ts         -- 상품 API
      auctions.ts         -- 경매 API
      payments.ts         -- 결제 API
    websocket/
      useAuctionSocket.ts -- WebSocket 경매 입찰 훅
    store/
      useAuthStore.ts     -- 인증 상태 관리 (Zustand)
    utils/
      token.ts            -- 토큰 저장/조회/삭제 유틸
      format.ts           -- 가격/날짜 포맷 유틸
  types/
    user.ts               -- 사용자 관련 타입
    product.ts            -- 상품 관련 타입 + 라벨 상수
    auction.ts            -- 경매/입찰 타입 + WebSocket 메시지 타입
    payment.ts            -- 결제 타입 + 상태 라벨
```

## API 클라이언트

`lib/api/client.ts`의 `apiClient<T>` 함수가 모든 API 호출을 담당:

- Base URL: `NEXT_PUBLIC_API_URL` 환경변수 (기본: `http://localhost:8080`)
- 자동 토큰 주입 (Authorization 헤더)
- Access Token 만료 시 자동 갱신 (Refresh Token 사용)
- 갱신 실패 시 로그인 페이지로 리다이렉트
- 에러 응답은 RFC 7807 ProblemDetail 형식 파싱

## WebSocket 실시간 입찰

`useAuctionSocket` 훅:
- 연결: `ws://localhost:8080/ws/auction/{id}?token={accessToken}`
- 자동 재연결: 3초 간격, 최대 10회
- 카운트다운 타이머: 남은 시간 1초마다 감소

**수신 메시지:**
- `BID_RESULT`: 입찰 결과 (성공/실패)
- `AUCTION_UPDATE`: 현재가, 입찰수, 남은 시간
- `AUCTION_CLOSED`: 경매 종료 (낙찰자, 낙찰가)
- `ERROR`: 에러 메시지

**송신 메시지:**
- `{ "type": "BID", "amount": number }`: 입찰

## 인증 상태 관리

`useAuthStore` (Zustand):
- `initialize()`: 앱 로드 시 토큰 확인 및 프로필 조회
- `login()`: 로그인 -> 토큰 저장 -> 프로필 조회
- `logout()`: API 로그아웃 -> 토큰 삭제
- `AuthInitializer` 컴포넌트: 앱 마운트 시 자동 초기화

토큰 저장: `localStorage` (`lib/utils/token.ts`)

## 결제 위젯

`PaymentWidget` 컴포넌트:
- TossPayments Payment Widget SDK 사용
- `orderId`, `amount`, `orderName` props
- 결제 성공 콜백 -> `/api/v1/payments/confirm` API 호출
- 성공 시 `/payments/complete` 페이지로 이동

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Gateway API URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8080` | WebSocket URL |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | - | TossPayments 클라이언트 키 |

## 개발 명령어

```bash
npm run dev     # 개발 서버 (포트 3000)
npm run build   # 프로덕션 빌드
npm run lint    # ESLint 실행
```

## 주의사항

- 모든 페이지는 `"use client"` (클라이언트 컴포넌트)
- API 호출 시 Gateway(8080)를 통해서만 접근 (직접 서비스 호출 금지)
- 타입 정의는 `src/types/`에 집중 관리
- 상태 라벨(한국어)은 각 타입 파일에 `*_LABELS` 상수로 정의
