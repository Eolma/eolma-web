# UI 개성화: AI스러움 제거 (크림/무신사 스타일)

## Background

디자인 토큰 마이그레이션은 완료됐으나, 모든 컴포넌트가 동일한 rounded-xl + shadow-card + border 패턴을 반복하고, 인터랙션이 빈약하며, 타이포그래피 위계가 단조로워 "AI가 만든 전형적인 웹사이트"로 보인다. 크림/무신사 스타일의 대담하고 무게감 있는 UI로 개성을 부여한다.

## Objective

기능 추가 없이 CSS/컴포넌트 수정만으로, 시각적 균일성을 깨고 위계를 만들어 "사람이 디자인한 서비스"처럼 보이게 한다.

## Requirements

### Functional Requirements
- FR-1: 버튼/카드/탭에 촉감 있는 인터랙션 (active:scale, hover:translate)
- FR-2: 가격 텍스트에 시각적 무게감 (크기 확대, tabular-nums, 전용 강조)
- FR-3: 카드 스타일 변주 (리스트용/정보용/프로필용 구분)
- FR-4: 빈 상태에 아이콘 + 맥락 메시지 + CTA
- FR-5: Tabs를 크림 스타일 필 탭(pill tab)으로 변경
- FR-6: 홈페이지 상단에 간결한 히어로 영역 (배경색 구분 + 한줄 카피)
- FR-7: AuctionCard 제목 크기 상향 + 가격 강조 비율 조정

### Non-Functional Requirements
- NFR-1: `npm run build` 성공
- NFR-2: 기존 light/dark 테마 정상 동작 유지

## Out of Scope
- 로고 SVG/이미지 교체 (디자인 에셋 필요)
- Footer 법적 정보 보강 (기획 필요)
- 페이지 전환 애니메이션 (framer-motion 도입 필요)
- 일러스트/Lottie 도입 (에셋 필요)
- AuctionCard에 상품 이미지 추가 (API 구조 확인 필요)

## Technical Approach

크림/무신사의 핵심 디자인 특성:
- **볼드 타이포**: 가격/제목이 크고 두꺼움, 나머지는 작고 가벼움 -> 대비가 극명
- **미니멀 카드**: border나 shadow 없이 배경색 차이만으로 영역 구분, 또는 아예 카드 없이 리스트형
- **필 탭(pill tab)**: border-bottom 밑줄이 아닌 배경 채움 형태
- **누르는 촉감**: active:scale-[0.97~0.98]로 버튼/카드 클릭 시 살짝 줄어드는 효과
- **색상 절제**: primary를 남발하지 않고, 가격 등 핵심 정보에만 집중 사용

### Affected Files

**수정**:
- `src/components/common/Button.tsx` - active:scale, transition 개선
- `src/components/common/Card.tsx` - variant 추가 (flat/outlined/elevated), hover 개선
- `src/components/common/Badge.tsx` - 크기 미세 조정
- `src/components/common/Tabs.tsx` - pill 스타일로 변경
- `src/components/common/Skeleton.tsx` - 카드 스켈레톤 이미지 영역 제거 (실제 카드와 매칭)
- `src/components/auction/AuctionCard.tsx` - 타이포 위계 재조정, 카드 스타일 변경
- `src/app/page.tsx` - 히어로 섹션 추가, 빈 상태 개선
- `src/app/auctions/page.tsx` - 빈 상태 개선
- `src/styles/tokens/semantic.css` - accent 색상 추가 (가격용)
- `src/styles/theme.css` - accent 토큰 매핑 추가
- `src/app/globals.css` - 전역 인터랙션 스타일 추가 (tabular-nums 등)

## Implementation Items

### Phase 1: 기반 토큰 + 전역 인터랙션
- [x] 1-1: semantic.css에 accent 색상 토큰 추가 (가격 전용, 크림의 빨간 가격 느낌)
- [x] 1-2: theme.css에 accent 매핑 추가
- [x] 1-3: globals.css에 tabular-nums 유틸, 전역 active:scale 트랜지션 추가

### Phase 2: 공통 컴포넌트 개성화
- [x] 2-1: Button - active:scale-[0.97] 추가, transition 개선
- [x] 2-2: Card - variant 시스템 (flat: 배경만/outlined: 테두리만/elevated: 기존), hover에 translateY 추가
- [x] 2-3: Tabs - pill 스타일 (배경 채움, rounded-full, border 제거)
- [x] 2-4: AuctionCard - 제목 text-base, 가격 text-xl font-extrabold text-accent, 카드 flat variant

### Phase 3: 페이지 개성화
- [x] 3-1: 홈페이지 - 히어로 영역 (bg-bg-secondary 풀 블리드, 볼드 카피, 서브텍스트)
- [x] 3-2: 홈페이지/경매목록 - 빈 상태에 lucide 아이콘 + CTA 버튼 추가
- [x] 3-3: SkeletonCard를 실제 AuctionCard 구조에 맞게 조정

### Phase 4: 검증
- [x] 4-1: npm run build 성공
- [ ] 4-2: light/dark 테마 정상 동작 확인

## Acceptance Criteria
- [x] AC-1: 버튼 클릭 시 scale 효과 있음
- [x] AC-2: 경매 카드의 가격이 다른 텍스트보다 확연히 돋보임
- [x] AC-3: 탭이 pill 스타일로 표시됨
- [x] AC-4: 홈페이지에 히어로 영역 있음
- [x] AC-5: 빈 상태에 아이콘과 행동 유도 버튼 있음
- [x] AC-6: npm run build 성공

## Notes
- 기능 변경 없음, 순수 시각적 개선만
- accent 색상은 크림의 빨간 가격(#ef6253) 같은 느낌이되, 우리 브랜드(purple)와 조화되는 톤 사용
- Card variant 추가 시 기존 사용처(BidPanel, BidHistory 등)는 기본값으로 동작해야 함 (하위 호환)
