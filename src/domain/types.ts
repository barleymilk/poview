export type UUID = string;
export type ISODate = string;
export type Mode = "standing" | "seated";
export type BudgetBand = "low" | "mid" | "high";
export type ProductCategory =
  | "desk"
  | "chair"
  | "storage"
  | "monitor-arm"
  | "accessory";

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

export interface RoomProfile {
  widthM: number;
  depthM: number;
  ceilingHeightM?: number;
}

export interface UserProfile {
  id: UUID;
  displayName?: string;
  heightCm: number;
  defaultMode: Mode;
  budgetBand: BudgetBand;
  budgetRangeKrw: MinMax;
  room: RoomProfile;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface ProductDimensions {
  overall: {
    widthM: number;
    depthM: number;
    heightM: number;
  };
  bbox: {
    min: Vector3;
    max: Vector3;
    size: Vector3;
  };
  referenceHeights: {
    topY: number;
    workSurfaceY?: number;
    underY?: number;
    seatY?: number;
    backrestTopY?: number;
  };
  reachDepth?: {
    usableDepthM: number;
    kneeInsetDepthM?: number;
  };
  coordinateMeta: {
    upAxis: "Y";
    unit: "m";
    origin: "model-center" | "floor-center" | "custom";
    normalized: boolean;
    normalizedScaleFactor?: number;
  };
}

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

export interface ProductCompatibility {
  recommendedUserHeightCm?: MinMax;
  recommendedDeskHeightCm?: MinMax;
  notes?: string[];
}

export interface Product {
  id: UUID;
  sku: string;
  name: string;
  category: ProductCategory;
  brand?: string;
  price: Money;
  tags: string[];
  dimensions: ProductDimensions;
  assets: ProductAsset;
  compatibility?: ProductCompatibility;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface SimulationInput {
  id: UUID;
  userId: UUID;
  productId: UUID;
  mode: Mode;
  distanceToTargetM: number;
  userPosition?: Vector3;
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
  topY: number;
  underY?: number;
  distanceToTargetM: number;
}

export type FitGrade = "good" | "conditional" | "not-recommended";

export interface SimulationResult {
  id: UUID;
  simulationInputId: UUID;
  userId: UUID;
  productId: UUID;
  camera: CameraSnapshot;
  metrics: FitMetrics;
  fitGrade: FitGrade;
  fitScore: number;
  scoringVersion: string;
  warnings: string[];
  createdAt: ISODate;
}
