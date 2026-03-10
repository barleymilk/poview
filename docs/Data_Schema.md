# POVIEW Data Schema

## 배경
- [ ] POVIEW의 핵심 차별화는 `키 기반 POV 계산`이므로, 일반 커머스 스키마에 치수/좌표 메타데이터가 추가되어야 한다.
- [ ] 특히 가구의 물리적 수치(Dimensions)가 정확히 구조화되지 않으면 `deltaEyeToTop`, `viewAngle`, `legClearance` 계산이 불가능하다.

## 목표
- [ ] User, Product, SimulationResult 중심의 엔티티를 타입 수준에서 정의한다.
- [ ] POV 계산에 필요한 가구 치수 필드를 누락 없이 설계한다.
- [ ] 엔티티 간 관계(1:N, N:1)와 계산 데이터의 생성 흐름을 명확히 한다.

## 범위
- [ ] MVP 도메인: 홈 오피스(책상/의자/수납)
- [ ] 타입 표기: TypeScript 스타일 인터페이스
- [ ] 단위: DB/API 저장은 사용자 키 `cm` 기준, 내부 계산은 selector를 통해 길이 `m`로 변환, 각도 `deg`, 금액 `KRW`

## 작업 단계
- [ ] 1) 공통 값 객체 정의(`Money`, `Vector3`, `MinMax`)
- [ ] 2) 핵심 엔티티 정의(`UserProfile`, `Product`, `SimulationInput`, `SimulationResult`)
- [ ] 3) 관계 및 인덱스 전략 정의
- [ ] 4) 샘플 JSON으로 직렬화 형태 검증

## 리스크
- [ ] GLB 원본 축/원점/스케일 불일치 시 치수 정확도가 무너질 수 있다.
- [ ] 치수 필드가 과소 설계되면 POV 알고리즘 확장이 어렵다.

## 검증 계획
- [ ] 5개 샘플 상품에 대해 필수 `dimensions` 필드 누락률 0%를 목표로 한다.
- [ ] 같은 입력에서 `SimulationResult`가 결정론적으로 동일한지 확인한다.
- [ ] 계산식(`deltaEyeToTopCm`, `viewAngleDeg`, `legClearanceCm`) 재현 테스트를 자동화한다.

## 1) Core Types

```ts
export type UUID = string;
export type ISODate = string;

export interface Money {
  currency: "KRW";
  amount: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface MinMax {
  min: number;
  max: number;
}
```

## 2) User Domain

```ts
export interface UserProfile {
  id: UUID;
  displayName?: string;
  heightCm: number; // UI 입력값(130~210)
  defaultMode: "standing" | "seated";
  budgetBand: "low" | "mid" | "high";
  budgetRangeKrw: MinMax;
  room: RoomProfile;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface RoomProfile {
  widthM: number;
  depthM: number;
  ceilingHeightM?: number;
}
```

## 3) Product Domain

```ts
export type ProductCategory = "desk" | "chair" | "storage" | "monitor-arm" | "accessory";

export interface Product {
  id: UUID;
  sku: string;
  name: string;
  category: ProductCategory;
  brand?: string;
  price: Money;
  tags: string[];
  dimensions: ProductDimensions;
  materials?: ProductMaterialSet;
  assets: ProductAsset;
  compatibility?: ProductCompatibility;
  createdAt: ISODate;
  updatedAt: ISODate;
}
```

### Product Materials (3D 시각 옵션)

```ts
export interface ProductMaterialSet {
  basePresetId: string;
  presets: ProductMaterialPreset[];
  meshBindings: MaterialMeshBinding[];
}

export interface ProductMaterialPreset {
  id: string; // e.g. "oak-black", "walnut-ivory"
  label: string;
  swatches: MaterialSwatch[];
}

export interface MaterialSwatch {
  slot: string; // e.g. "top", "leg", "seat"
  materialType: "wood" | "steel" | "fabric" | "leather" | "plastic" | "glass";
  baseColorHex: string; // e.g. "#C08A5B"
  roughness?: number;
  metalness?: number;
  normalScale?: number;
  textureUrl?: string;
}

export interface MaterialMeshBinding {
  slot: string; // swatch.slot 과 매핑
  meshNames: string[]; // GLB 내부 mesh 이름 목록
}
```

### Product Dimensions (POV 핵심)

```ts
export interface ProductDimensions {
  // 외곽 실치수(카탈로그/필터용)
  overall: {
    widthM: number;
    depthM: number;
    heightM: number;
  };

  // 모델 정합성(스케일/축 검증용)
  bbox: {
    min: Vector3;
    max: Vector3;
    size: Vector3; // max - min
  };

  // POV 계산용 수직 기준면
  referenceHeights: {
    topY: number; // 가구 상단 높이(m)
    workSurfaceY?: number; // 작업면 높이(m), 책상/수납 상판 등
    underY?: number; // 하부 유효 높이(m), 다리 공간 계산
    seatY?: number; // 의자 좌판 높이(m)
    backrestTopY?: number; // 의자 등받이 상단 높이(m)
  };

  // POV 계산용 수평 기준
  reachDepth?: {
    usableDepthM: number; // 실제 사용 가능한 깊이
    kneeInsetDepthM?: number; // 하부로 들어가는 깊이
  };

  // 단위/좌표계 메타
  coordinateMeta: {
    upAxis: "Y";
    unit: "m";
    origin: "model-center" | "floor-center" | "custom";
    normalized: boolean; // 스케일 정규화 여부
    normalizedScaleFactor?: number;
  };
}
```

### Product Asset

```ts
export interface ProductAsset {
  glbUrl: string;
  previewImageUrl: string;
  dracoCompressed: boolean;
  originalSizeKb?: number;
  compressedSizeKb?: number;
  lod?: {
    high?: string;
    medium?: string;
    low?: string;
  };
}
```

### Product Compatibility

```ts
export interface ProductCompatibility {
  recommendedUserHeightCm?: MinMax;
  recommendedDeskHeightCm?: MinMax; // chair 전용
  notes?: string[];
}
```

## 4) Simulation Domain

```ts
export interface SimulationInput {
  id: UUID;
  userId: UUID;
  productId: UUID;
  mode: "standing" | "seated";
  distanceToTargetM: number;
  // 필요 시 사용자 배치 좌표
  userPosition?: Vector3;
  createdAt: ISODate;
}

export interface SimulationResult {
  id: UUID;
  simulationInputId: UUID;
  userId: UUID;
  productId: UUID;
  camera: CameraSnapshot;
  metrics: FitMetrics;
  fitGrade: "good" | "conditional" | "not-recommended";
  fitScore: number; // 0~100
  scoringVersion: string; // e.g. "v1.0.0"
  warnings: string[];
  createdAt: ISODate;
}

export interface CameraSnapshot {
  eyeY: number;
  position: Vector3;
  lookAt: Vector3;
  fovDeg: number;
}

export interface FitMetrics {
  deltaEyeToTopCm: number;
  viewAngleDeg: number;
  legClearanceCm?: number;
  // 디버그/검증용 원시값
  topY: number;
  underY?: number;
  distanceToTargetM: number;
}
```

### fitGrade UI 매핑 (1:1)

| API Enum (`fitGrade`) | UI Badge (ko-KR) | Score Range |
|---|---|---|
| `good` | `적합` | `80~100` |
| `conditional` | `조건부 적합` | `60~79` |
| `not-recommended` | `비추천` | `0~59` |

## 5) Recommendation & Commerce Domain

```ts
export interface RecommendationSet {
  id: UUID;
  userId: UUID;
  simulationResultId: UUID;
  budgetBand: "low" | "mid" | "high";
  items: RecommendationItem[];
  totalPrice: Money;
  rationale: string[]; // 추천 이유(시선각/여유공간/예산 적합)
  createdAt: ISODate;
}

export interface RecommendationItem {
  productId: UUID;
  role: "required" | "optional";
  quantity: number;
}

export interface Cart {
  id: UUID;
  userId: UUID;
  items: CartItem[];
  totalPrice: Money;
  updatedAt: ISODate;
}

export interface CartItem {
  productId: UUID;
  quantity: number;
  selectedFromRecommendationSetId?: UUID;
}
```

## 6) Entity Relationship

```txt
UserProfile (1) ---- (N) SimulationInput
SimulationInput (1) ---- (1) SimulationResult
Product (1) ---- (N) SimulationInput
SimulationResult (1) ---- (N) RecommendationSet
RecommendationSet (1) ---- (N) RecommendationItem ---- (1) Product
UserProfile (1) ---- (1) Cart ---- (N) CartItem ---- (1) Product
```

## 7) Internal Metric Policy (단위 일관성 정책)

- [ ] DB/API 영속 레이어는 `heightCm`만 저장한다.
- [ ] 프론트엔드 상태도 `heightCm`만 저장하고, 계산 시 selector/getter에서 `heightM`를 파생한다.
- [ ] 모든 점수 산식과 사용자 적합성 계산의 기준 단위는 `cm`로 고정한다.
- [ ] 3D 렌더링 좌표와 씬 배치 계산은 `m`를 사용한다.
- [ ] UI 출력(여유 공간, 눈높이 차이)은 `cm` 변환 값을 사용하되, 원시 계산 값(`m`)도 디버그 로그에 유지한다.
- [ ] DB/API 필드명은 단위를 명시한다(`heightCm`, `distanceToTargetM`, `deltaEyeToTopCm`).
- [ ] 경계 값 검증은 정규화 이후(`m` 기준) 수행한다.

```ts
// FE selector 예시
export const selectHeightM = (state: { userProfile: { heightCm: number } }) =>
  state.userProfile.heightCm / 100;
```

## 8) POV 계산을 위한 Dimensions 필수 규칙

- [ ] 모든 `desk` 카테고리는 `referenceHeights.topY`, `referenceHeights.underY`, `referenceHeights.workSurfaceY`를 필수로 가진다.
- [ ] `chair` 카테고리는 `referenceHeights.seatY`, `referenceHeights.backrestTopY`를 필수로 가진다.
- [ ] `bbox.size.y`와 `overall.heightM`의 차이가 허용 오차(예: 2%)를 넘으면 검수 실패로 처리한다.
- [ ] `coordinateMeta.normalized`가 `false`인 상품은 시뮬레이션 대상에서 제외하거나 경고를 표시한다.
- [ ] `underY`가 없는 상품은 `legClearanceCm` 계산을 건너뛰고 "하부 치수 미제공" 경고를 노출한다.

## 9) Example JSON (Desk)

```json
{
  "id": "prd_desk_001",
  "sku": "DESK-1200-WOOD",
  "name": "홈오피스 데스크 1200",
  "category": "desk",
  "price": { "currency": "KRW", "amount": 189000 },
  "materials": {
    "basePresetId": "oak-black",
    "presets": [
      {
        "id": "oak-black",
        "label": "오크 상판 + 블랙 프레임",
        "swatches": [
          { "slot": "top", "materialType": "wood", "baseColorHex": "#C08A5B", "roughness": 0.65 },
          { "slot": "leg", "materialType": "steel", "baseColorHex": "#1F1F1F", "roughness": 0.35, "metalness": 0.8 }
        ]
      },
      {
        "id": "walnut-white",
        "label": "월넛 상판 + 화이트 프레임",
        "swatches": [
          { "slot": "top", "materialType": "wood", "baseColorHex": "#7A4E2D", "roughness": 0.62 },
          { "slot": "leg", "materialType": "steel", "baseColorHex": "#F5F5F5", "roughness": 0.4, "metalness": 0.7 }
        ]
      }
    ],
    "meshBindings": [
      { "slot": "top", "meshNames": ["desk_top", "desk_edge"] },
      { "slot": "leg", "meshNames": ["desk_leg_left", "desk_leg_right", "desk_frame"] }
    ]
  },
  "dimensions": {
    "overall": { "widthM": 1.2, "depthM": 0.6, "heightM": 0.72 },
    "bbox": {
      "min": { "x": -0.6, "y": 0, "z": -0.3 },
      "max": { "x": 0.6, "y": 0.72, "z": 0.3 },
      "size": { "x": 1.2, "y": 0.72, "z": 0.6 }
    },
    "referenceHeights": {
      "topY": 0.72,
      "workSurfaceY": 0.72,
      "underY": 0.68
    },
    "reachDepth": {
      "usableDepthM": 0.58,
      "kneeInsetDepthM": 0.22
    },
    "coordinateMeta": {
      "upAxis": "Y",
      "unit": "m",
      "origin": "floor-center",
      "normalized": true
    }
  },
  "assets": {
    "glbUrl": "https://cdn.poview.app/models/desk-1200.glb",
    "previewImageUrl": "https://cdn.poview.app/images/desk-1200.jpg",
    "dracoCompressed": true,
    "originalSizeKb": 5420,
    "compressedSizeKb": 1090
  }
}
```
