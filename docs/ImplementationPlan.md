# POVIEW 구현 계획 (Lock-in)

## 배경
- [x] 현재 `docs` 명세는 구조적으로 정렬되었고, 구현 단계 진입 전에 계약성 규칙(버전/단위/링크/이벤트)을 고정할 필요가 있다.
- [x] 본 문서는 개발 중 해석 차이를 방지하기 위한 실행 기준 문서다.

## 목표
- [x] `scoringVersion`의 형식과 증가 규칙을 semver 기준으로 고정한다.
- [x] 단위 정책(`m -> cm`) 회귀 테스트를 필수화해 점수 산식 안정성을 보장한다.
- [x] deep link 파싱 우선순위(`share > raw query > localProfile > default`)를 테스트 케이스로 명문화한다.
- [x] `RecommendationPage`/`/recommendations`에 대한 analytics/event naming 표준을 확정한다.

## 범위
- [ ] 대상 문서/구현 영역: `POV_Logic_Spec`, `Data_Schema`, `Routing_Map`, 시뮬레이션 모듈, 라우트 파서, analytics 이벤트 스키마
- [ ] 대상 도메인: 홈 오피스 MVP (추천/시뮬레이션 플로우 중심)

## 작업 단계
- [x] 1) scoringVersion 규칙 확정 (SemVer) → `POV_Logic_Spec` §5.5, `Data_Schema` 참조
- [x] 필드 형식: `vMAJOR.MINOR.PATCH` (예: `v1.0.0`)
- [x] 저장 위치: `SimulationResult.scoringVersion` (필수)
- [x] 증가 규칙:
- [x] 산식 구조/가중치/임계값 변경 -> `MAJOR` 증가
- [x] 계산 결과 영향 없는 내부 최적화/리팩터링 -> 버전 유지
- [x] 문구/주석/로그만 변경 -> 버전 유지
- [x] 동작 동일성 보장 보완(오차 허용 범위 조정 등) -> `MINOR` 증가
- [x] 오타/비기능 수정 -> `PATCH` 증가
- [x] 릴리스 전 검증: 동일 입력셋에 대해 이전 버전 대비 diff 리포트 생성

- [x] 2) 단위 정책 회귀 테스트 정의 → `docs/Unit_Policy_Test_Spec.md`
- [x] 정책: 3D 좌표/렌더링은 `m`, 점수 산식/적합성 계산 입력은 `cm`
- [x] 필수 테스트 케이스:
- [x] `heightCm -> heightM` 변환 정확성(130, 160, 210)
- [x] `deltaEyeToTopM -> deltaEyeToTopCm`, `legClearanceM -> legClearanceCm` 변환 정확성
- [x] 경계값 테스트:
- [x] `heightCm` 하한/상한(130, 210), 하한 미만/상한 초과(129, 211) 검증
- [x] `distanceToTargetM` 하한/상한(0.3, 2.0) 및 폴백 동작
- [x] 등급 경계(59, 60, 79, 80) 스냅샷 테스트
- [x] 서브스코어 clamp 테스트(음수/100 초과 입력에서 0~100 보장)

- [x] 3) Deep Link 우선순위 테스트 케이스 명시 → `Routing_Map` Deep Linking 설계
- [x] 우선순위: `share > raw query > localProfile > default`
- [x] 케이스 A: `share` 유효 + raw query 존재 -> `share` 채택
- [x] 케이스 B: `share` 무효 + raw query 유효 -> raw query 채택
- [x] 케이스 C: `share/raw query` 모두 없음 + localProfile 존재 -> localProfile 채택
- [x] 케이스 D: 모두 없음/무효 -> default 채택
- [x] 케이스 E: raw query 일부만 유효 -> 유효 필드만 반영 + 나머지 폴백
- [x] 케이스 F: 파싱 결과 URL 정규화(불필요 파라미터 제거) 확인
- [x] 케이스 G: 개인정보 보호 검증(기본 공유 URL은 `share`만 노출)

- [x] 4) Recommendation analytics/event naming 표준 확정 → `docs/Analytics_Event_Schema.md`
- [x] 화면 명: `RecommendationPage`
- [x] 경로 명: `/recommendations`
- [x] 이벤트 네이밍 규칙: `domain_object_action` (snake_case)
- [x] 공통 접두사: `recommendation_`
- [x] 필수 이벤트:
- [x] `recommendation_page_viewed`
- [x] `recommendation_set_compared`
- [x] `recommendation_set_selected`
- [x] `recommendation_item_replaced`
- [x] `recommendation_proceeded_to_cart`
- [x] 필수 공통 속성:
- [x] `simulation_id`, `scoring_version`, `fit_grade`, `fit_score`, `budget_band`, `route_path`
- [x] route_path 허용값은 `/recommendations` 단일 고정

## 리스크
- [ ] scoringVersion 증가 규칙이 팀 내 합의 없이 변경되면 분석 일관성이 깨질 수 있다.
- [ ] 단위 테스트 미흡 시 산식 리팩터링 때 회귀가 잠복할 수 있다.
- [ ] deep link 파서와 라우트 정규화 로직이 분리 구현되면 우선순위 계약이 깨질 수 있다.
- [ ] 이벤트 이름/속성 스키마가 문서와 코드에서 분리되면 분석 데이터 신뢰도가 하락한다.

## 검증 계획
- [ ] PR 체크리스트에 아래 4개를 필수 항목으로 추가한다.
- [ ] `scoringVersion` 변경 근거(semver) 명시 여부
- [ ] 단위/경계값 테스트 통과 여부
- [ ] deep link 우선순위 테스트 통과 여부
- [ ] recommendation 이벤트 스키마 검증 통과 여부
- [ ] 스프린트 종료 시 `spec vs implementation` 갭 점검표를 업데이트한다.
