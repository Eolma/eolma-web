# eolma-web

## Overview

"얼마"는 중고 경매 플랫폼의 웹 프론트엔드다. 상품을 올리면 시장이 가격을 정해주는 컨셉으로, 상품 등록 -> 경매 -> 낙찰 -> 결제 워크플로우를 제공한다. PWA 및 앱스토어 배포를 목표로 하며, 모바일과 데스크톱 모두를 대상으로 한다.

## Tech Stack

| Category | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16 (App Router) | SSR/SSG, 파일 기반 라우팅, metadata API |
| UI | React 19 | 최신 Concurrent 기능, Server Components |
| Language | TypeScript 5 | 타입 안전성 |
| Styling | Tailwind CSS v4 | CSS-first 접근, @theme inline 디렉티브 |
| State | Zustand 5 | 경량 클라이언트 상태 관리 |
| Font | Pretendard | 한국어 최적화, 가독성 |
| Icons | lucide-react | 트리쉐이킹, 일관된 아이콘 세트 |
| Payment | @tosspayments/payment-widget-sdk | 토스페이먼츠 결제 위젯 |

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router (페이지, 레이아웃)
│   ├── globals.css         # 디자인 토큰 import + 글로벌 스타일
│   ├── layout.tsx          # 루트 레이아웃 (폰트, 테마, 네비게이션)
│   ├── manifest.ts         # PWA manifest
│   └── {route}/            # 페이지별 디렉토리
├── styles/                 # 디자인 토큰 시스템
│   ├── tokens/
│   │   ├── colors.css      # primitive 색상 팔레트
│   │   ├── semantic.css    # semantic 토큰 (light/dark)
│   │   ├── typography.css  # 타이포그래피 스케일
│   │   └── spacing.css     # spacing, radius, shadow
│   └── theme.css           # @theme inline (Tailwind v4 매핑)
├── components/             # UI 컴포넌트
│   ├── common/             # 범용 컴포넌트 (Button, Card, Badge 등)
│   ├── layout/             # 레이아웃 컴포넌트 (Header, BottomNav, Footer)
│   ├── auction/            # 경매 도메인 컴포넌트
│   ├── product/            # 상품 도메인 컴포넌트
│   ├── auth/               # 인증 도메인 컴포넌트
│   └── payment/            # 결제 도메인 컴포넌트
├── hooks/                  # 커스텀 훅 (useTheme 등)
├── lib/                    # 유틸리티, API 클라이언트
│   ├── api/                # API 클라이언트 + 도메인별 API 함수
│   ├── store/              # Zustand 스토어
│   ├── utils/              # 포맷팅, 토큰 관리 등
│   ├── oauth/              # OAuth 설정
│   └── websocket/          # WebSocket 훅
└── types/                  # TypeScript 타입 정의
```

### Key Abstractions

- **API Client** (`lib/api/client.ts`): 토큰 자동 갱신, 에러 타입화(ApiException), 401 재시도 로직
- **Auth Store** (`lib/store/useAuthStore.ts`): Zustand 기반 인증 상태, 로그인/로그아웃/토큰 관리
- **Design Tokens** (`styles/tokens/`): CSS 변수 기반 2계층 토큰 (primitive -> semantic)

### Module Boundaries

- **페이지 -> 도메인 컴포넌트 -> common 컴포넌트** 방향으로만 의존
- common 컴포넌트는 도메인 로직을 포함하지 않음
- API 호출은 `lib/api/` 함수를 통해서만 수행
- 상태 관리는 Zustand 스토어(`lib/store/`)를 통해 중앙화

## Design System

### Color System

2계층 토큰 구조: primitive(원색) -> semantic(의미)

**Primary**: Deep Purple 계열 (#7c3aed)
- 신뢰감 + 세련됨 + 묵직함을 전달하는 브랜드 컬러

**Primitive 팔레트**:
```
purple-50: #faf5ff ~ purple-950: #2e1065
gray-50: #f9fafb ~ gray-950: #030712
green, red, yellow, blue 계열 (상태 표현용)
```

**Semantic 토큰**:
| Token | Light | Dark | 용도 |
|-------|-------|------|------|
| `--color-primary` | purple-600 (#7c3aed) | purple-400 (#c084fc) | CTA, 강조, 브랜드 |
| `--color-bg` | #ffffff | #0f0f14 | 기본 배경 |
| `--color-bg-secondary` | gray-50 | #1a1a24 | 보조 배경 |
| `--color-text-primary` | gray-900 | gray-100 | 본문 텍스트 |
| `--color-text-secondary` | gray-500 | gray-400 | 보조 텍스트 |
| `--color-border` | gray-200 | #2d2d44 | 기본 테두리 |
| `--color-success` | green-600 | green-400 | 성공 상태 |
| `--color-error` | red-600 | red-400 | 에러 상태 |
| `--color-warning` | amber-600 | amber-400 | 경고 상태 |

### Theme System

- CSS 변수 + `data-theme` 속성으로 light/dark 전환
- FOUC 방지: `layout.tsx`의 `<head>`에 인라인 스크립트로 테마 선적용
- `useTheme` hook: light/dark/system 3가지 모드, localStorage 영속
- Tailwind v4 `@theme inline`으로 CSS 변수를 유틸리티 클래스로 매핑

### Typography

- **Font Family**: Pretendard Variable (한글 + 라틴)
- **Scale**: Tailwind 기본 스케일 사용 (text-xs ~ text-4xl)
- **Weight**: normal(400), medium(500), semibold(600), bold(700)
- **Page Title**: text-2xl font-bold
- **Section Title**: text-lg font-semibold
- **Body**: text-sm 또는 text-base
- **Caption**: text-xs text-text-secondary

### Spacing & Radius

- **Spacing**: Tailwind 기본 스케일 (4px 단위)
- **Border Radius**: sm(6px), md(8px), lg(12px), xl(16px), 2xl(24px), full
- **Shadow**: sm, md, lg, card (테마별 투명도 조절)

## Component Conventions

### Naming

- **파일명**: PascalCase (`AuctionCard.tsx`)
- **컴포넌트명**: PascalCase (`export function AuctionCard`)
- **Props 인터페이스**: `{ComponentName}Props`
- **상수**: UPPER_SNAKE_CASE (`AUCTION_STATUS_LABELS`)
- **Hook**: camelCase, `use` prefix (`useTheme`)

### Props Pattern

```tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}
```

- HTML 기본 속성은 extends로 상속
- 커스텀 props는 optional, 기본값 제공
- variant/size 패턴으로 스타일 변형

### Styling Rules

- **Tailwind 유틸리티 클래스만 사용** (CSS modules, styled-components 사용 금지)
- **하드코딩 색상 금지**: `bg-indigo-600` 대신 `bg-primary` 사용
- **semantic 토큰 우선**: `text-gray-500` 대신 `text-text-secondary` 사용
- **variant 스타일은 Record<string, string> 객체**로 관리
- **조건부 클래스**: 템플릿 리터럴 또는 삼항 연산자 사용 (clsx/cn 미사용)

### Component Structure

```tsx
"use client"; // 클라이언트 컴포넌트에만

import { ... } from "react";
import { ... } from "@/components/...";

interface ComponentProps { ... }

export function Component({ prop1, prop2 = defaultValue }: ComponentProps) {
  // state, hooks
  // handlers
  // return JSX
}
```

## Responsive Design

### Strategy: Mobile-First

모바일 뷰포트를 기본으로 설계하고, 브레이크포인트로 확장한다.

### Breakpoints (Tailwind 기본)

| Name | Width | Target |
|------|-------|--------|
| (default) | 0px~ | 모바일 |
| `sm` | 640px~ | 큰 모바일/작은 태블릿 |
| `md` | 768px~ | 태블릿 |
| `lg` | 1024px~ | 데스크톱 |
| `xl` | 1280px~ | 큰 데스크톱 |

### Layout Patterns

- **모바일**: BottomNav (하단 네비게이션), 심플 Header
- **데스크톱**: Header 전체 네비게이션, Footer
- **Content Width**: `max-w-7xl mx-auto px-4` (기본), 페이지에 따라 max-w-2xl~5xl
- **Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

## Error Handling

### Strategy

- **Route-level**: Next.js App Router의 `error.tsx` 파일 컨벤션 활용
- **Global**: `app/global-error.tsx`로 루트 에러 핸들링
- **API 에러**: `ApiException` 클래스로 타입화, 컴포넌트에서 에러 상태로 표시
- **Form 에러**: 컴포넌트 로컬 state로 관리, 필드별 에러 메시지
- **Toast**: 사용자에게 즉각적인 피드백 (성공/실패 알림)

### Error Display

- API 실패: 인라인 에러 메시지 (`bg-error-light text-error rounded-lg`)
- 페이지 에러: error.tsx fallback UI + reset 버튼
- 네트워크 에러: Toast 알림

## Testing

### Strategy (향후 도입)

| Type | Tool | Target |
|------|------|--------|
| Unit/Component | Vitest + React Testing Library | common 컴포넌트, hooks, utils |
| E2E | Playwright | 주요 사용자 시나리오 (로그인, 경매 입찰, 결제) |

- 테스트 파일 위치: `__tests__/` 디렉토리 또는 `*.test.tsx` co-location
- async Server Component는 E2E로 테스트

## Constraints

### Performance
- Next.js Image 컴포넌트(`next/image`) 사용 권장
- 페이지별 Suspense boundary로 로딩 상태 관리
- 불필요한 `"use client"` 지양

### Security
- 토큰은 localStorage 저장 (httpOnly cookie 전환 검토)
- API 키/시크릿은 서버 사이드에서만 사용
- `.env.local`은 절대 커밋하지 않음

### Anti-patterns (금지사항)
- Tailwind 기본 색상 클래스 직접 사용 (`bg-indigo-600` 등) -> semantic 토큰 사용
- CSS modules, styled-components, inline style 사용
- common 컴포넌트에 도메인 로직 포함
- `any` 타입 사용
- 외부 UI 라이브러리 (shadcn, MUI, Chakra 등) 도입
- console.log를 프로덕션 코드에 남기기
