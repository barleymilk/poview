# POVIEW Analytics Event Schema

## 배경

- [ ] RecommendationPage(`/recommendations`)의 사용자 행동 추적이 추천 효과 검증과 개선에 필수이다.
- [ ] 이벤트 네이밍과 속성 스키마 일관성이 분석 데이터 신뢰도를 보장한다.

## 목표

- [ ] RecommendationPage 관련 이벤트 스키마를 확정한다.
- [ ] 구현/분석 팀 간 계약 문서로 활용한다.
- [ ] 다른 화면 이벤트 추가 시 본 스키마 규칙을 확장 적용한다.

## 범위

- [ ] 화면: `RecommendationPage`
- [ ] 경로: `/recommendations`
- [ ] 도메인: 홈 오피스 MVP (추천 세트 비교/선택/장바구니 진입)

## 네이밍 규칙

- [ ] 형식: `domain_object_action` (snake_case)
- [ ] RecommendationPage 공통 접두사: `recommendation_`

## 필수 이벤트

| 이벤트명 | 트리거 시점 | 필수 속성 |
|----------|-------------|-----------|
| `recommendation_page_viewed` | `/recommendations` 진입 시 | simulation_id, scoring_version, fit_grade, fit_score, budget_band, route_path |
| `recommendation_set_compared` | 추천 세트 2개를 비교 UI에서 **나란히 노출한 상태**로 전환된 시점(탭/슬라이드 등) | simulation_id, scoring_version, fit_grade, fit_score, budget_band, route_path |
| `recommendation_set_selected` | 사용자가 특정 세트 선택 시 | simulation_id, scoring_version, fit_grade, fit_score, budget_band, route_path |
| `recommendation_item_replaced` | 세트 내 아이템 교체 시 | simulation_id, scoring_version, fit_grade, fit_score, budget_band, route_path |
| `recommendation_proceeded_to_cart` | 장바구니로 진행 클릭 시 | simulation_id, scoring_version, fit_grade, fit_score, budget_band, route_path |

## 필수 공통 속성

| 속성명 | 타입 | 설명 | RecommendationPage 허용값 |
|--------|------|------|---------------------------|
| `simulation_id` | string (UUID) | 시뮬레이션 결과 식별자 | - |
| `scoring_version` | string | 점수 산식 버전 (SemVer) | - |
| `fit_grade` | string | 적합 등급 | `good` \| `conditional` \| `not-recommended` |
| `fit_score` | number | 적합 점수 (0~100) | - |
| `budget_band` | string | 예산 구간 | `low` \| `mid` \| `high` |
| `route_path` | string | 이벤트 발생 시 경로 | `/recommendations` (고정) |

## 이벤트별 추가 속성 (선택)

| 이벤트명 | 추가 속성 | 설명 |
|----------|-----------|------|
| `recommendation_set_selected` | `set_id` | 선택된 RecommendationSet의 UUID |
| `recommendation_item_replaced` | `set_id`, `replaced_product_id`, `replacement_product_id` | 교체 전후 상품 식별자 |

## 리스크

- [ ] 이벤트 이름/속성이 코드와 문서에서 분리되면 분석 데이터 일관성이 깨질 수 있다.
- [ ] 구현 시 본 스키마를 단일 소스로 참조해야 한다.

## 검증 계획

- [ ] PR 체크리스트: recommendation 이벤트 발송 시 스키마 검증 통과
- [ ] analytics SDK 래퍼에서 필수 속성 누락 시 개발 환경에서 경고 출력
- [ ] **구현 시 권장**: 이벤트 페이로드가 필수 속성을 만족하는지 검증하는 유닛 테스트(스키마 검증) 추가. 예: 각 이벤트별 mock payload → 필수 키 존재·타입 검사
