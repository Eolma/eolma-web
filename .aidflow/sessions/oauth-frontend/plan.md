# OAuth 소셜 로그인 프론트엔드 구현

## Background
백엔드에서 Google/Kakao OAuth 소셜 로그인 API가 구현되면, 프론트엔드에서 소셜 로그인 버튼, OAuth 콜백 처리, 계정 연결 모달, 닉네임 설정 페이지를 구현해야 한다.

## Objective
로그인/회원가입 페이지에 Google/Kakao 소셜 로그인 버튼을 추가하고, OAuth 콜백 처리 + 계정 연결 + 닉네임 설정 플로우를 구현한다. 기존 UI와 자연스럽게 어울리는 깔끔한 디자인.

## Requirements

### Functional Requirements
- FR-1: 로그인/회원가입 페이지에 Google, Kakao 소셜 로그인 버튼 표시
- FR-2: 소셜 버튼 클릭 시 해당 Provider 인가 페이지로 리다이렉트
- FR-3: OAuth 콜백 페이지에서 인가 코드를 백엔드에 전달하고 결과 처리
- FR-4: 신규 소셜 가입 시 닉네임 설정 페이지로 이동
- FR-5: 동일 이메일 다른 provider 존재 시 계정 연결 모달 표시 (기존 가입 방식 안내)
- FR-6: LOCAL 계정 연결 시 비밀번호 입력 필드 표시
- FR-7: 마이페이지에서 연결된 소셜 계정 목록 표시 + 새 소셜 연결 버튼
- FR-8: Zustand store에 OAuth 관련 메서드 추가

### Non-Functional Requirements
- NFR-1: Google 브랜드 가이드라인 준수 (버튼 디자인)
- NFR-2: Kakao 브랜드 가이드라인 준수 (#FEE500 배경색)
- NFR-3: 기존 Tailwind CSS 스타일링 패턴과 일관성 유지
- NFR-4: 콜백 처리 중 로딩 스피너 표시

## Out of Scope
- 소셜 계정 연결 해제 기능
- 백엔드 API 구현 (oauth-backend 세션에서 처리)

## Technical Approach

### OAuth 인가 URL (공식 문서 기반)
**Google:** `GET https://accounts.google.com/o/oauth2/v2/auth`
- params: client_id, redirect_uri, response_type=code, scope=openid email profile, state

**Kakao:** `GET https://kauth.kakao.com/oauth/authorize`
- params: client_id, redirect_uri, response_type=code, state

### 플로우
1. 소셜 버튼 클릭 -> window.location.href = getOAuthUrl(provider)
2. Provider 인가 후 -> /auth/oauth/callback?code=xxx&state=PROVIDER 로 리다이렉트
3. 콜백 페이지에서 code + provider를 백엔드 POST /api/v1/auth/oauth/login에 전달
4. 응답 분기:
   - tokens + nicknameRequired=false: 토큰 저장 -> "/" 이동
   - tokens + nicknameRequired=true: 토큰 저장 -> "/auth/set-nickname" 이동
   - linkInfo: AccountLinkModal 표시

### Affected Files

**타입 (수정):**
- `src/types/user.ts` - AuthProvider, OAuthLoginRequest, OAuthLinkRequest, AccountLinkRequired, OAuthLoginResponse, LinkedAccount 타입 추가

**OAuth 설정 (신규):**
- `src/lib/oauth/config.ts` - OAUTH_CONFIG, getOAuthUrl(provider)

**API 함수 (수정):**
- `src/lib/api/auth.ts` - oauthLogin, linkAccount, setNickname, getLinkedAccounts 추가

**상태 관리 (수정):**
- `src/lib/store/useAuthStore.ts` - oauthLogin, linkAccount, setNickname 메서드 추가

**컴포넌트 (신규):**
- `src/components/auth/SocialLoginButtons.tsx` - Google/Kakao 버튼 + "또는" 구분선
- `src/components/auth/AccountLinkModal.tsx` - 계정 연결 모달 (기존 Modal 재사용)

**페이지 (신규):**
- `src/app/(auth)/auth/oauth/callback/page.tsx` - OAuth 콜백 처리
- `src/app/(auth)/auth/set-nickname/page.tsx` - 닉네임 설정

**기존 UI (수정):**
- `src/components/auth/LoginForm.tsx` - 하단에 SocialLoginButtons 추가
- `src/components/auth/RegisterForm.tsx` - 하단에 SocialLoginButtons 추가
- `src/app/mypage/page.tsx` - 연결된 소셜 계정 섹션 추가

**환경 변수 (수정):**
- `.env.local` - NEXT_PUBLIC_GOOGLE_CLIENT_ID, NEXT_PUBLIC_KAKAO_CLIENT_ID, NEXT_PUBLIC_APP_URL

## Implementation Items
- [x] 1. 타입 정의: user.ts에 OAuth 관련 타입 추가
- [x] 2. OAuth 설정: lib/oauth/config.ts (getOAuthUrl 함수)
- [x] 3. API 함수: auth.ts에 oauthLogin, linkAccount, setNickname, getLinkedAccounts 추가
- [x] 4. Zustand store: useAuthStore에 OAuth 메서드 추가
- [x] 5. SocialLoginButtons 컴포넌트 (Google/Kakao 버튼)
- [x] 6. OAuth 콜백 페이지 (code 처리 + 분기 로직)
- [x] 7. AccountLinkModal 컴포넌트 (기존 Modal 재사용)
- [x] 8. 닉네임 설정 페이지
- [x] 9. LoginForm에 SocialLoginButtons 추가
- [x] 10. RegisterForm에 SocialLoginButtons 추가
- [x] 11. 마이페이지 소셜 계정 섹션
- [x] 12. .env.local 환경 변수 추가

## Acceptance Criteria
- [x] AC-1: 로그인/회원가입 페이지에 Google, Kakao 버튼이 표시됨
- [x] AC-2: 소셜 버튼 클릭 시 해당 Provider 인가 페이지로 이동
- [x] AC-3: 콜백 페이지에서 로딩 스피너 후 적절한 페이지로 리다이렉트
- [x] AC-4: 신규 소셜 가입 시 닉네임 설정 페이지 표시, 설정 후 메인으로 이동
- [x] AC-5: 기존 이메일 존재 시 계정 연결 모달에서 기존 가입 방식 안내
- [x] AC-6: LOCAL 연결 시 비밀번호 입력 -> 연결 성공 -> 메인으로 이동
- [x] AC-7: 마이페이지에서 연결된 소셜 계정 목록 확인 가능

## Notes
- oauth-backend 세션의 API가 완성되어야 실제 동작 테스트 가능
- 기존 컴포넌트 재사용: Modal, Input, Button, Loading
- state 파라미터에 provider명을 포함하여 콜백에서 provider 구분
- 환경 변수는 .env.local에 플레이스홀더만 추가 (실제 키는 사용자가 설정)
