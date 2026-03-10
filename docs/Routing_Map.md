# POVIEW Routing Map (Next.js App Router)

## 배경
- [ ] POVIEW는 `탐색 -> POV 검증 -> 추천 -> 구매` 흐름이 핵심이라 경로 구조가 UX 의도와 1:1로 매핑되어야 한다.
- [ ] App Router 기반으로 페이지 책임(데이터 조회, 상태 전달, 사용자 액션)을 명확히 분리해야 구현과 테스트가 쉬워진다.

## 목표
- [ ] 모든 라우트를 기능 단위로 정의하고, 각 페이지가 다루는 데이터와 액션을 명시한다.
- [ ] POV 시뮬레이션 결과가 추천/구매 단계로 끊김 없이 전달되도록 URL/상태 전략을 확정한다.
- [ ] MVP 범위(홈 오피스)에 맞는 최소 경로만 유지해 복잡도를 관리한다.

## 범위
- [ ] 기준: Next.js `app/` 디렉토리(App Router)
- [ ] 인증: 비로그인 가능(게스트 세션), 선택적 로그인 확장
- [ ] 도메인: 홈 오피스 카테고리 중심
- [ ] 라우트 그룹: 쇼핑 경험과 시뮬레이션 경험을 분리한다(`(shop)`, `(simulation)`)

## 작업 단계
- [ ] 1) 정적/동적 라우트 구분
- [ ] 2) 페이지별 읽기 데이터(Query)와 쓰기 액션(Command) 정의
- [ ] 3) 시뮬레이션 상태 전달 전략(session/local db) 고정
- [ ] 4) 예외 라우트(`loading`, `error`, `not-found`) 정의

## 리스크
- [ ] 시뮬레이션 상태를 URL에 과도하게 담으면 길이/보안/재현성 문제가 생길 수 있다.
- [ ] 동적 라우트 설계가 약하면 상품/세트 상세에서 캐시 무효화가 복잡해질 수 있다.

## 검증 계획
- [ ] 주요 8개 경로 E2E 스모크 테스트를 통과한다.
- [ ] `Product -> Simulator -> RecommendationPage -> Cart` 흐름에서 상태 유실 0건을 목표로 한다.

## App Router 디렉토리 제안

```txt
app/
  layout.tsx
  page.tsx
  (shop)/
    layout.tsx
    catalog/
      page.tsx
    product/
      [productId]/
        page.tsx
    recommendations/
      page.tsx
    cart/
      page.tsx
    checkout/
      page.tsx
  (simulation)/
    layout.tsx
    simulator/
      [productId]/
        page.tsx
  profile/
    page.tsx
  api/
    products/route.ts
    products/[productId]/route.ts
    simulation/route.ts
    recommendations/route.ts
```

## Route Group 설계 원칙

- [ ] `(shop)/layout.tsx`: 일반 GNB + 탐색 중심 UI(카테고리, 검색, 장바구니 진입)
- [ ] `(simulation)/layout.tsx`: 몰입형 레이아웃(최소 GNB, 화면 확장, 측정 패널 우선)
- [ ] URL은 유지한다(그룹명은 URL에 노출되지 않음). 즉 시뮬레이터 주소는 계속 `/simulator/[productId]`를 사용한다.
- [ ] 시뮬레이터에서 나갈 때만 일반 쇼핑 레이아웃으로 복귀한다.

## 페이지별 라우팅 맵

| Route | Page Role | Read Data | Write Action | Notes |
|---|---|---|---|---|
| `/` | 랜딩/진입 | featured products, category shortcuts | start session | CTA: `내 POV 설정` |
| `/catalog` | 카탈로그 탐색 | product list, filters, price ranges | save filter preset | 쿼리스트링: `?category=desk&budget=mid` |
| `/product/[productId]` | 상품 상세 | product detail, dimensions, asset metadata | bookmark product | CTA: `POV로 확인하기` |
| `/simulator/[productId]` | POV 시뮬레이션 | user profile, product dimensions, scene asset | run simulation, save simulation result | 핵심 계산 실행 페이지 |
| `/recommendations` | 세트 추천 비교 | simulation result by simulationId, budget profile, set candidates | select set, replace item | 시뮬 결과 기반 정렬 |
| `/cart` | 장바구니 | selected set/items, subtotal | update qty, remove item | 추천 세트 유지 |
| `/checkout` | 구매 확정 | cart summary, shipping/payment draft | place order | MVP는 mock 결제 허용 |
| `/profile` | 사용자 프로필 | heightCm, budget, room dimensions | update profile | POV 입력의 기준 원본 |

## 상태 전달 전략

- [ ] `userProfile`: 전역 상태 + 로컬 영속(`localStorage`)
- [ ] `simulationResult`: 서버 저장 우선(`simulationId` 반환), 클라이언트 임시 캐시 보조
- [ ] `recommendationInput`: `simulationId` 강제 전달을 기준으로 서버에서 재계산/조회
- [ ] URL에는 민감 데이터 대신 식별자 중심으로 포함 (`/recommendations?simulationId=...`)
- [ ] Deep Link 공유 시에는 POV 설정 일부를 쿼리로 허용하고, 개인 식별 정보는 제외한다.

## Deep Linking 설계

- [ ] 기본 공유 경로(권장): `/simulator/[productId]?share=abc123`
- [ ] 원시 파라미터 공유(옵트인): `/simulator/[productId]?heightCm=180&mode=seated&distanceToTargetM=0.6&preset=oak-black`
- [ ] 쿼리 스펙
- [ ] `share`: 서버 저장 공유 상태 식별자(기본)
- [ ] `heightCm`: 사용자 키(cm), `130~210` (옵트인)
- [ ] `mode`: `standing | seated`
- [ ] `distanceToTargetM`: 대상까지 거리(m), `0.3~2.0`
- [ ] `preset`: 재질/색상 프리셋 ID (옵트인)
- [ ] 파싱 우선순위: `share > raw query > localProfile > default`
- [ ] 유효성 실패 시 안전 기본값으로 폴백하고 URL을 정규화한다.
- [ ] 공유용 CTA 기본 동작: `현재 POV 공유` 클릭 시 `share` 기반 URL을 복사한다.
- [ ] 공유용 CTA 고급 옵션: 사용자가 명시적으로 동의한 경우에만 원시 파라미터 URL을 복사한다.

### share 파라미터 유효/무효 정의

- [ ] **유효**: `share` 쿼리 존재 + 서버에서 해당 식별자 조회 성공 → POV 설정(state) 반환
- [ ] **무효**: `share` 없음, 또는 조회 실패(404/만료/삭제), 또는 형식 불일치
- [ ] 구현: 파서는 `share` 존재 시 서버 검증 후, 성공 시 `share` 채택, 실패 시 다음 우선순위(raw query)로 폴백

### Deep Link 우선순위 테스트 케이스

- [ ] **케이스 A**: `share` 유효 + raw query 존재 → `share` 채택
- [ ] **케이스 B**: `share` 무효 + raw query 유효 → raw query 채택
- [ ] **케이스 C**: `share`/raw query 모두 없음 + localProfile 존재 → localProfile 채택
- [ ] **케이스 D**: 모두 없음/무효 → default 채택
- [ ] **케이스 E**: raw query 일부만 유효 → 유효 필드만 반영 + 나머지 폴백
- [ ] **케이스 F**: 파싱 결과 URL 정규화(불필요 파라미터 제거) 확인
- [ ] **케이스 G**: 개인정보 보호 검증(기본 공유 URL은 `share`만 노출, raw query 미포함)

## API 라우트 책임

- [ ] `GET /api/products`: 필터 기반 목록 조회
- [ ] `GET /api/products/:id`: 상세 + `dimensions` + `asset` 메타
- [ ] `POST /api/simulation`: 키/모드/거리 입력 -> POV 지표 계산 후 저장
- [ ] `POST /api/recommendations`: `simulationId + budget` 기반 세트 추천 반환

## 오류/로딩/예외 경로

- [ ] 각 세그먼트에 `loading.tsx`, `error.tsx`, `not-found.tsx`를 둔다.
- [ ] 에셋 로딩 실패 시 `/simulator/[productId]`에서 2D 스펙 뷰 폴백을 제공한다.
- [ ] 프로필 미입력 시 `/profile`로 유도 후 원래 경로로 리다이렉트한다.
