# POVIEW POV Logic Spec

## 배경
- [ ] POVIEW의 핵심 기능은 사용자 키 데이터를 1인칭 시점과 치수 피드백으로 변환해 구매 판단 정확도를 높이는 것이다.
- [ ] 단순 카메라 높이 변경만으로는 가치가 약하므로, 가구 높이와 사용자 눈높이의 상관관계를 수치로 설명해야 한다.

## 목표
- [ ] 입력(키/공간/가구 치수) -> 카메라 좌표 -> 적합성 지표까지 일관된 계산 규칙을 정의한다.
- [ ] 사용자가 "왜 이 가구가 맞다/안 맞다"를 숫자로 이해할 수 있게 한다.
- [ ] FE에서 실시간으로 계산 가능한 경량 알고리즘으로 설계한다.

## 범위
- [ ] 좌표계: Three.js 기준 `Y-up`, 단위는 `m`로 통일
- [ ] 대상 가구: 홈 오피스 중심(책상/의자/수납)
- [ ] 출력: 눈높이 차이, 시선각, 하부 여유 공간, 적합 등급
- [ ] 정책: DB/API와 FE 상태에는 `heightCm`만 저장하고, 계산 직전 selector/getter에서 `heightM`를 파생한다.
- [ ] 정책: 모든 점수 산식과 사용자 적합성 계산의 기준 단위는 `cm`로 고정한다.
- [ ] 정책: 3D 렌더링 좌표/카메라/씬 배치 계산은 `m`를 사용한다.

## 작업 단계
- [ ] 1) 입력 정규화 -> 2) 사용자 인체 추정치 계산 -> 3) 카메라 좌표 계산 -> 4) 가구 메트릭 계산 -> 5) UI 피드백 변환
- [ ] 수치 기준은 초기값으로 두고 사용자 테스트 결과로 보정한다.

## 리스크
- [ ] 인체 비율은 개인차가 커서 절대 정확도 오해가 발생할 수 있다.
- [ ] GLB 모델의 기준점/스케일 오류가 메트릭 오차로 직결된다.
- [ ] 카메라 FOV/거리 차이가 체감 왜곡을 유발할 수 있다.

## 검증 계획
- [ ] 동일 시나리오에서 계산 결과가 매번 같은지 결정론 테스트를 수행한다.
- [ ] 수치 라벨(눈높이 차이/시선각/여유 공간)이 사용자 이해에 도움되는지 소규모 테스트로 검증한다.
- [ ] 인체 비율 상수를 조정해 오차 체감이 줄어드는지 A/B로 확인한다.

## 1. 입력 스펙

### 사용자 입력
- [ ] `heightCm`: 사용자 키(cm), 저장 기준값, 범위 `130~210`
- [ ] `mode`: `standing | seated`
- [ ] `distanceToTargetM`: 사용자 시점에서 대상 가구까지 수평 거리(m)

### 가구 입력(모델 메타데이터)
- [ ] `topY`: 가구 상단 높이(m)
- [ ] `underY`: 가구 하부 유효 높이(m, 책상 하판 하단 등)
- [ ] `depthM`: 가구 깊이(m)
- [ ] `bbox`: 모델 바운딩박스(스케일 검증용)

## 2. 인체 비율 상수(초기값)

- [ ] `standingEyeRatio = 0.93`
- [ ] `seatedEyeRatio = 0.67`
- [ ] `seatedKneeRatio = 0.30`
- [ ] `shoeAllowanceM = 0.02`

참고: 초기값은 일반 성인 비율 기반 근사치이며, 추후 사용자 테스트 결과로 보정한다.

## 3. 카메라 좌표 계산

### 정규화 규칙
- [ ] 계산 시작 전에 `heightCm`에서 `heightM`를 파생해 계산 컨텍스트를 만든다.
- [ ] 변환식: `heightM = heightCm / 100`
- [ ] `heightCm` 경계 검증(130~210) 후 변환한다.

### 눈높이 계산
- [ ] `eyeY = heightM * standingEyeRatio` (standing)
- [ ] `eyeY = heightM * seatedEyeRatio` (seated)

### 카메라 좌표
- [ ] `camera.position.y = eyeY`
- [ ] `camera.position.xz`는 현재 사용자 배치점 기준
- [ ] 대상 가구 중심점을 `lookAt`으로 설정

### 안전 클램프
- [ ] `eyeY`는 `[0.9, 1.95]` 범위로 클램프(비정상 입력 방지)

## 4. 가구 높이-눈높이 상관관계 지표

### 4.1 눈높이 차이(Delta Height)
- [ ] 내부 원시값: `deltaEyeToTopM = topY - eyeY`
- [ ] UI 노출값: `deltaEyeToTopCm = deltaEyeToTopM * 100`
- [ ] 의미: 가구 상단이 눈높이보다 얼마나 위/아래인지
- [ ] 해석:
- [ ] `deltaEyeToTopCm > +15`: 상단이 눈보다 높아 올려다봄 구간
- [ ] `-15 <= deltaEyeToTopCm <= +15`: 눈높이 근접 구간
- [ ] `deltaEyeToTopCm < -15`: 상단이 눈보다 낮아 내려다봄 구간

### 4.2 시선각(View Angle)
- [ ] `viewAngleDeg = atan2(topY - eyeY, distanceToTargetM) * (180 / PI)`
- [ ] 의미: 대상 상단을 보기 위해 고개가 필요한 각도
- [ ] 책상 작업 기준 권장 구간(초기): `-35deg ~ -10deg`
- [ ] 구간 밖이면 `주의` 표시(목 부담 가능성 안내)

### 4.3 하부 여유 공간(Desk Clearance)
- [ ] `kneeY = (heightM * seatedKneeRatio) + shoeAllowanceM`
- [ ] 내부 원시값: `legClearanceM = underY - kneeY`
- [ ] UI 노출값: `legClearanceCm = legClearanceM * 100`
- [ ] 해석:
- [ ] `>= 8cm`: 여유
- [ ] `4~8cm`: 타이트
- [ ] `< 4cm`: 간섭 위험

## 5. 적합도 등급 로직

- [ ] `score = w1 * angleScore + w2 * clearanceScore + w3 * deltaScore`
- [ ] 기본 가중치: `w1=0.4`, `w2=0.4`, `w3=0.2`
- [ ] 정규화 규칙: 모든 서브스코어는 `clamp(0, 100)`으로 고정한다.
- [ ] 권장 반올림: 소수점 둘째 자리까지 유지 후 최종 점수만 정수 반올림한다.
- [ ] `finalScore = round(score)`
- [ ] 결과:
- [ ] `finalScore >= 80`: 적합 (`good`)
- [ ] `60 <= finalScore <= 79`: 조건부 적합 (`conditional`)
- [ ] `finalScore < 60`: 비추천 (`not-recommended`)

### 5.1 angleScore 산식 (시선각)
- [ ] 기준 구간: `recommendedMinDeg=-35`, `recommendedMaxDeg=-10`
- [ ] 편차 계산:
- [ ] `angleDeviationDeg = max(recommendedMinDeg - viewAngleDeg, 0, viewAngleDeg - recommendedMaxDeg)`
- [ ] 점수 계산(1도 벗어날 때 10점 감점):
- [ ] `angleScore = clamp(0, 100, 100 - (10 * angleDeviationDeg))`
- [ ] 예시: `viewAngleDeg=-22` -> `angleDeviationDeg=0` -> `angleScore=100`
- [ ] 예시: `viewAngleDeg=-7` -> `angleDeviationDeg=3` -> `angleScore=70`

### 5.2 clearanceScore 산식 (하부 여유)
- [ ] 기준 여유: `targetClearanceCm=8`, 최소 허용: `minClearanceCm=4`
- [ ] 계산식:
- [ ] `legClearanceCm`가 없으면 `clearanceScore=50`(중립) + warning 부여
- [ ] `legClearanceCm >= 8` -> `clearanceScore=100`
- [ ] `4 <= legClearanceCm < 8` -> `clearanceScore = 70 + ((legClearanceCm - 4) / 4) * 30`
- [ ] `0 <= legClearanceCm < 4` -> `clearanceScore = (legClearanceCm / 4) * 70`
- [ ] `legClearanceCm < 0` -> `clearanceScore=0`

### 5.3 deltaScore 산식 (눈높이 차이)
- [ ] 기준값: `idealDeltaCm=-25`(책상 상단이 눈높이보다 25cm 낮은 상태를 이상으로 간주)
- [ ] 허용 편차: `allowedDeviationCm=10`
- [ ] 편차 계산: `deltaDeviationCm = abs(deltaEyeToTopCm - idealDeltaCm)`
- [ ] 점수 계산:
- [ ] `deltaScore = clamp(0, 100, 100 - (deltaDeviationCm * 2.5))`
- [ ] 의미: 이상점에서 1cm 벗어날 때 2.5점 감점, 40cm 이상 벗어나면 0점

### 5.4 결정론 보장 규칙
- [ ] 같은 입력(`heightCm`, `mode`, `distanceToTargetM`, `topY`, `underY`)은 항상 같은 `finalScore`를 반환해야 한다.
- [ ] 계산 경로에서 난수/시간 의존 로직 사용 금지.
- [ ] 버전 변경 시 `scoringVersion`을 증가시키고 결과와 함께 저장한다.

### 5.5 scoringVersion 규칙 (SemVer)

- [ ] 형식: `vMAJOR.MINOR.PATCH` (예: `v1.0.0`)
- [ ] 저장 위치: `SimulationResult.scoringVersion` (필수)
- [ ] 증가 규칙:
  - [ ] 산식 구조/가중치/임계값 변경 → `MAJOR` 증가
  - [ ] 계산 결과 영향 없는 내부 최적화/리팩터링 → 버전 유지
  - [ ] 문구/주석/로그만 변경 → 버전 유지
  - [ ] 동작 동일성 보장 보완(오차 허용 범위 조정 등) → `MINOR` 증가
  - [ ] 오타/비기능 수정 → `PATCH` 증가
- [ ] 릴리스 전 검증: 동일 입력셋에 대해 이전 버전 대비 diff 리포트 생성

점수화 목적은 추천 정렬용이며, 최종 UI는 반드시 원시 수치(각도/여유공간/눈높이차)를 함께 노출한다.
점수화 및 등급 계산의 길이 기준 단위는 `cm`로 고정한다. 내부 길이 원시값(`m`)은 계산 직전에 `cm`로 변환해 산식에 입력한다.

## 6. UI 피드백 규칙

- [ ] 카드 1: `눈높이 차이` -> `가구 상단이 눈높이보다 35cm 낮음`
- [ ] 카드 2: `시선각` -> `-22deg (권장 범위)`
- [ ] 카드 3: `하부 여유` -> `6cm (타이트)`
- [ ] 배지: `적합 | 조건부 적합 | 비추천`
- [ ] 툴팁: "본 수치는 모델 치수 기준 추정치이며 실제 체감과 차이가 있을 수 있음"

## 7. 수치 예시 (160cm 사용자, seated)

- [ ] 입력(UI): `heightCm=160`
- [ ] 정규화 입력(내부): `heightM=1.60`, `topY=0.72`, `underY=0.68`, `distanceToTargetM=0.6`
- [ ] 계산:
- [ ] `eyeY = 1.60 * 0.67 = 1.072m`
- [ ] `deltaEyeToTopM = 0.72 - 1.072 = -0.352m`
- [ ] `deltaEyeToTopCm = -35.2cm`
- [ ] `viewAngleDeg = atan2(-0.352, 0.6) ~= -30.4deg`
- [ ] `kneeY = (1.60 * 0.30) + 0.02 = 0.50m`
- [ ] `legClearanceM = 0.68 - 0.50 = 0.18m`
- [ ] `legClearanceCm = 18cm`
- [ ] 해석: 시선각은 권장 범위, 하부 여유는 충분 -> `적합`

## 8. FE Selector 권장 규칙

- [ ] 전역 상태에는 `heightCm`만 유지한다.
- [ ] POV 계산 모듈 진입 시 selector로 `heightM`를 파생한다.
- [ ] 계산 함수 시그니처는 `heightM`를 받도록 고정해 단위 혼선 가능성을 차단한다.

```ts
export const selectHeightM = (heightCm: number) => heightCm / 100;
```

- [ ] 단위 변환(`m -> cm`) 및 산식 결과값 검증을 위한 유닛 테스트 코드를 반드시 작성한다.
