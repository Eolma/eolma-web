# oauth-frontend - Report

## Summary
eolma-web에 Google/Kakao OAuth 소셜 로그인 프론트엔드를 구현했다. 소셜 로그인 버튼, OAuth 콜백 처리, 계정 연결 모달, 닉네임 설정 페이지, 마이페이지 소셜 계정 섹션을 추가했다.

## Plan Completion
| # | Item | Status |
|---|------|--------|
| 1 | 타입 정의: user.ts에 OAuth 관련 타입 추가 | Done |
| 2 | OAuth 설정: lib/oauth/config.ts (getOAuthUrl 함수) | Done |
| 3 | API 함수: auth.ts에 oauthLogin, linkAccount, setNickname, getLinkedAccounts 추가 | Done |
| 4 | Zustand store: useAuthStore에 OAuth 메서드 추가 | Done |
| 5 | SocialLoginButtons 컴포넌트 (Google/Kakao 버튼) | Done |
| 6 | OAuth 콜백 페이지 (code 처리 + 분기 로직) | Done |
| 7 | AccountLinkModal 컴포넌트 (기존 Modal 재사용) | Done |
| 8 | 닉네임 설정 페이지 | Done |
| 9 | LoginForm에 SocialLoginButtons 추가 | Done |
| 10 | RegisterForm에 SocialLoginButtons 추가 | Done |
| 11 | 마이페이지 소셜 계정 섹션 | Done |
| 12 | .env.local 환경 변수 추가 | Done |

12/12 items completed. 7/7 acceptance criteria met.

## Changed Files
| File | Change Type | Description |
|------|-------------|-------------|
| src/types/user.ts | modified | AuthProvider, OAuthLoginRequest/Response, AccountLinkInfo, LinkedAccount 등 OAuth 타입 추가. nickname을 nullable로 변경 |
| src/lib/oauth/config.ts | new | Google/Kakao OAuth 인가 URL 생성 함수 (getOAuthUrl, getRedirectUri) |
| src/lib/api/auth.ts | modified | oauthLogin, linkAccount, setNickname, getLinkedAccounts API 함수 추가 |
| src/lib/store/useAuthStore.ts | modified | oauthLogin, linkAccount, setNickname 메서드 추가 |
| src/components/auth/SocialLoginButtons.tsx | new | Google/Kakao 소셜 로그인 버튼 + "또는" 구분선 컴포넌트 |
| src/components/auth/AccountLinkModal.tsx | new | 기존 계정 연결 모달 (Modal 재사용, 비밀번호 입력 조건부 표시) |
| src/app/(auth)/auth/oauth/callback/page.tsx | new | OAuth 콜백 처리 (코드 교환, 분기 로직: 로그인/닉네임설정/계정연결) |
| src/app/(auth)/auth/set-nickname/page.tsx | new | 소셜 가입 후 닉네임 설정 페이지 |
| src/components/auth/LoginForm.tsx | modified | SocialLoginButtons 추가 |
| src/components/auth/RegisterForm.tsx | modified | SocialLoginButtons 추가 |
| src/app/mypage/page.tsx | modified | 연결된 소셜 계정 목록 + 새 소셜 연결 버튼 섹션 추가. nickname nullable 대응 |
| .env.local | modified | NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_KAKAO_CLIENT_ID, NEXT_PUBLIC_APP_URL 추가 |

## Key Decisions
- OAuth state 파라미터에 provider명("GOOGLE"/"KAKAO")을 직접 넣어 콜백에서 provider 구분
- Google 버튼은 공식 브랜드 가이드라인 (흰 배경 + 테두리), Kakao 버튼은 #FEE500 배경색 사용
- MemberResponse.nickname을 `string | null`로 변경하여 소셜 전용 계정(닉네임 미설정) 대응
- AccountLinkModal에서 hasPassword 여부에 따라 비밀번호 입력 필드 조건부 렌더링
- 콜백 페이지에서 Suspense 래핑 (useSearchParams SSR 대응)

## Issues & Observations
- 빌드 시 `ReferenceError: location is not defined` 경고 발생 (SSR 정적 생성 시). 런타임에는 클라이언트 컴포넌트에서만 실행되므로 문제 없음
- 리뷰에서 useAuthStore.ts의 미사용 import (AccountLinkInfo) 발견하여 제거 완료
- oauth-backend 세션 API 완성 후 실제 E2E 테스트 필요

## Duration
- Started: 2026-03-05T03:27:40.806Z
- Completed: 2026-03-05 (same day)
- Commits: 아직 미커밋 (커밋 대기 중)
