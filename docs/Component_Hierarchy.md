# POVIEW Component Hierarchy (Atomic Design)

## 배경
- [ ] POVIEW는 3D 시뮬레이션, 상품 탐색, 추천 UI가 결합된 구조라 컴포넌트 경계가 명확해야 유지보수가 쉽다.
- [ ] 포트폴리오 관점에서 재사용 가능한 설계(Atomic Design) 자체가 설계 역량의 근거가 된다.

## 목표
- [ ] 원자 단위부터 페이지 단위까지 계층을 명확히 정의한다.
- [ ] 시뮬레이션 UI와 커머스 UI를 분리해 변경 영향 범위를 최소화한다.
- [ ] 상태 소유권(전역/로컬)을 컴포넌트 계층에 맞춰 고정한다.

## 범위
- [ ] 프론트엔드 구조: `Atoms -> Molecules -> Organisms -> Templates -> Pages`
- [ ] MVP 범위: 홈 오피스 카테고리, POV 시뮬레이터, 예산 추천

## 작업 단계
- [ ] 1) Atom 정의 -> 2) Molecule 조합 -> 3) Organism 단위 기능 묶음 -> 4) Template 레이아웃 -> 5) Page 매핑
- [ ] 전역 상태(`userProfile`, `simulationResult`, `cart`)와 로컬 상태(`viewMode`, `selectedSku`)를 분리한다.
- [ ] 3D 캔버스와 UI 오버레이를 느슨하게 결합한다(이벤트 기반).

## 리스크
- [ ] Organism이 비대해지면 재사용성이 떨어지고 테스트 난이도가 증가한다.
- [ ] 3D 상태와 UI 상태가 강결합되면 디버깅 비용이 커진다.

## 검증 계획
- [ ] 신규 기능 추가 시 Atom/Molecule 수정 없이 Organism 조합으로 해결 가능한지 점검한다.
- [ ] 페이지 2개 이상에서 재사용되는 컴포넌트 비율을 추적한다.
- [ ] 시뮬레이터 변경 시 커머스 화면 회귀 이슈가 없는지 확인한다.

## Atomic Design 계층

### Atoms
- [ ] `Button`, `IconButton`, `Input`, `NumberInput`, `Select`, `Badge`, `Tag`, `Chip`
- [ ] `PriceText`, `MetricText`, `ProgressBar`, `Skeleton`, `Tooltip`
- [ ] `Panel`, `Divider`, `ModalBase`, `Toast`

### Molecules
- [ ] `HeightInputField`(키 입력 + 단위 + 유효성)
- [ ] `BudgetRangeField`(슬라이더 + 금액 표시)
- [ ] `DimensionMetricCard`(높이/폭/깊이 + 적합 배지)
- [ ] `ProductCard`(썸네일 + 가격 + 핵심 스펙 + CTA)
- [ ] `FilterGroup`(카테고리/예산/사이즈)
- [ ] `KpiInline`(FPS, LCP, 모델 용량 지표)

### Organisms
- [ ] `HeaderNav`, `ProfileSetupPanel`, `CatalogFilterSidebar`
- [ ] `ProductGrid`, `ProductSpecPanel`
- [ ] `POVCanvasViewport`(Three.js 캔버스 래퍼)
- [ ] `POVControlPanel`(시점 모드/높이 표시/토글)
- [ ] `FitFeedbackPanel`(여유 공간, 시선각, 경고)
- [ ] `RecommendationSetPanel`(저/중/고 예산 세트 비교)
- [ ] `CartSummaryPanel`, `CheckoutForm`

### Templates
- [ ] `MainShopTemplate`(헤더 + 필터 + 콘텐츠)
- [ ] `SimulationTemplate`(좌측 3D 캔버스 + 우측 피드백 패널)
- [ ] `CheckoutTemplate`(주문 정보 + 결제 정보)

### Pages
- [ ] `HomePage`
- [ ] `CatalogPage`
- [ ] `ProductDetailPage`
- [ ] `POVSimulatorPage`
- [ ] `RecommendationPage`
- [ ] `CartPage`
- [ ] `CheckoutPage`
- [ ] `MyProfilePage`

## 상태 관리 경계
- [ ] 전역 상태: `userProfile(heightCm, budget, roomSize)`, `simulation(sceneId, cameraMode, measuredMetrics)`, `cart(items, totalPrice)`
- [ ] 페이지 상태: 현재 필터, 정렬, 선택 SKU
- [ ] 로컬 상태: 패널 열림/닫힘, 토글 상태, 임시 입력값

## 조합 예시
- [ ] `POVSimulatorPage`
- [ ] `SimulationTemplate`
- [ ] `POVCanvasViewport` + `POVControlPanel` + `FitFeedbackPanel`
- [ ] `FitFeedbackPanel` 내부는 `DimensionMetricCard`와 `MetricText`로 구성
