# POVIEW

> Status: **Ready for Run** (M1 핵심 흐름 구현 진행)

POVIEW(포뷰)는 가구/인테리어 쇼핑에서 발생하는 사이즈 미스와 구매 불확실성을 줄이기 위한 웹 서비스입니다.  
핵심은 **사용자 키(Height) 기반 1인칭 POV 시뮬레이션**으로, 제품이 실제 사용자의 시점에서 어떻게 보이고 얼마나 맞는지 수치로 검증하는 데 있습니다.

## 프로젝트 목적

- 온라인 가구 쇼핑의 정보 비대칭 해소(실물감 부족, 치수 판단 어려움)
- 구매 전 의사결정 정확도 향상(적합성 수치 + 예산 기반 추천)
- FE 포트폴리오 관점의 설계/구현/검증 역량 증명

## 개발자 온보딩

- 현재 저장소 상태: `/simulator/[productId] -> /recommendations` 핵심 흐름 동작 구현 완료
- 실행 커맨드: 즉시 사용 가능
- Windows 권장 런타임 매니저: `volta` (대안: `nvm-windows`)

### 실행 커맨드

```bash
# 의존성 설치
npm install

# 런타임 정책 검증(Node/npm 버전)
npm run check:runtime

# 개발 서버 실행
npm run dev

# 린트 실행
npm run lint

# 테스트 실행
npm run test

# 프로덕션 빌드
npm run build
```

- 온보딩 체크리스트:
  - Node.js `20.11.x` 고정 사용
  - 패키지 매니저 `npm 10.2.x` 고정 사용
  - Windows는 `volta`로 Node/npm 버전을 고정하고 `volta pin node@20.11.1 npm@10.2.0` 적용
- 환경변수: 현재 스프린트 범위에서는 불필요
  - `docs/ImplementationPlan.md`의 Lock-in 규칙 확인 후 구현 시작

- 버전 고정 강제/검증 최소 기준(스캐폴딩 시 즉시 적용):
  - 루트에 `.nvmrc` 추가(`20.11.1`)
  - `package.json`에 `engines` 명시 (`node: 20.11.x`, `npm: 10.2.x`)
  - CI preflight에서 Node/npm 버전 검증(`node -v`, `npm -v`)
  - 로컬 preflight 스크립트(`npm run check:runtime`)로 버전 불일치 시 실패 처리

## MVP 범위

- 도메인: **홈 오피스(Desk-terior)** 카테고리 집중
- 기능:
  - 사용자 프로필 입력(`heightCm`, 예산, 공간 정보)
  - POV 시뮬레이션(키 기반 시점 반영)
  - 적합성 피드백(눈높이 차이, 시선각, 하부 여유 공간)
  - 예산 구간별 추천 세트
- 제외:
  - 전 카테고리 확장
  - 실시간 물리 시뮬레이션
  - 소셜/커뮤니티 중심 기능

## 핵심 차별화

- **디지털 트윈 기반 체험형 커머스**
- **키 기반 1인칭 POV**
- **수치 기반 적합성 판단**
  - `deltaEyeToTopCm`
  - `viewAngleDeg`
  - `legClearanceCm`

## 라우팅 요약 (Next.js App Router)

- `/` : 홈
- `/catalog` : 카탈로그
- `/product/[productId]` : 상품 상세
- `/simulator/[productId]` : POV 시뮬레이션
- `/recommendations` : 추천 화면 (`RecommendationPage`)
- `/cart` : 장바구니
- `/checkout` : mock 결제(개발/검증용)
- `/profile` : 사용자 프로필

Deep Link 정책:
- 기본 공유: `share` 기반 URL (`/simulator/[productId]?share=...`)
- 원시 파라미터 공유: 옵트인
- raw query 스펙(옵트인): `heightCm(130~210)`, `mode(standing|seated)`, `distanceToTargetM(0.3~2.0)`, `preset`
- 파싱 우선순위: `share > raw query > localProfile > default`
- 상세 규칙: `docs/Routing_Map.md`의 `Deep Linking 설계` 섹션 참조

## 데이터/계산 정책 요약

- `SimulationResult`에 `scoringVersion` 필수 저장
- 점수 산식/적합성 계산 기준 단위: **cm 고정**
- 3D 렌더링/좌표/씬 배치 단위: **m**
- 사용자 키 저장 단위: `heightCm` (DB/API, FE state)
- 산식은 결정론 보장(같은 입력 -> 같은 결과)
- 구현 시 검증 연결:
  - CI에서 `check:runtime`으로 Node/npm 버전 정책 강제
  - 테스트에서 deep link 우선순위/단위 변환/scoringVersion 회귀 검증

## 문서 인덱스

- 전략: `docs/ProductStrategy.md`
- 아이디어 검증: `docs/IdeaEvaluation.md`
- UI 흐름: `docs/UI_Flow.md`
- 라우팅 설계: `docs/Routing_Map.md`
- 컴포넌트 구조(Atomic): `docs/Component_Hierarchy.md`
- POV 로직 명세: `docs/POV_Logic_Spec.md`
- 데이터 스키마: `docs/Data_Schema.md`
- 단위 정책 테스트 명세: `docs/Unit_Policy_Test_Spec.md`
- Analytics 이벤트 스키마: `docs/Analytics_Event_Schema.md`
- 구현 계획(Lock-in): `docs/ImplementationPlan.md`

## 현재 상태 (업데이트 규칙 포함)

- 마지막 업데이트: `2026-03-11`
- 현재 마일스톤: `M1 - 핵심 사용자 흐름(/simulator -> /recommendations) 구현 진행`
- 다음 마일스톤: `M2 - API 라우트/서버 저장/추천 로직 고도화`
- 유지 규칙: 스프린트/릴리즈 변경 또는 핵심 설계 변경(라우팅/단위 정책/산식/deep link) 시 이 섹션을 반드시 갱신한다.

