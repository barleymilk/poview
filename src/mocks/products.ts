import type { Product } from "@/src/domain/types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "desk-1200-wood",
    sku: "DESK-1200-WOOD",
    name: "홈오피스 데스크 1200",
    category: "desk",
    brand: "POVIEW HOME",
    price: { currency: "KRW", amount: 189000 },
    tags: ["desk", "home-office"],
    dimensions: {
      overall: { widthM: 1.2, depthM: 0.6, heightM: 0.72 },
      bbox: {
        min: { x: -0.6, y: 0, z: -0.3 },
        max: { x: 0.6, y: 0.72, z: 0.3 },
        size: { x: 1.2, y: 0.72, z: 0.6 },
      },
      referenceHeights: {
        topY: 0.72,
        workSurfaceY: 0.72,
        underY: 0.68,
      },
      reachDepth: {
        usableDepthM: 0.58,
        kneeInsetDepthM: 0.22,
      },
      coordinateMeta: {
        upAxis: "Y",
        unit: "m",
        origin: "floor-center",
        normalized: true,
      },
    },
    materials: {
      basePresetId: "oak-black",
      presets: [
        {
          id: "oak-black",
          label: "오크 상판 + 블랙 프레임",
          swatches: [
            {
              slot: "top",
              materialType: "wood",
              baseColorHex: "#C08A5B",
              roughness: 0.65,
            },
            {
              slot: "leg",
              materialType: "steel",
              baseColorHex: "#1F1F1F",
              roughness: 0.35,
              metalness: 0.8,
            },
          ],
        },
      ],
      meshBindings: [
        { slot: "top", meshNames: ["desk_top", "desk_edge"] },
        { slot: "leg", meshNames: ["desk_leg_left", "desk_leg_right", "desk_frame"] },
      ],
    },
    assets: {
      glbUrl: "https://cdn.poview.app/models/desk-1200.glb",
      previewImageUrl: "https://cdn.poview.app/images/desk-1200.jpg",
      dracoCompressed: true,
      originalSizeKb: 5420,
      compressedSizeKb: 1090,
    },
    createdAt: "2026-03-11T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
  {
    id: "desk-1400-pro",
    sku: "DESK-1400-PRO",
    name: "POVIEW 프로 데스크 1400",
    category: "desk",
    brand: "POVIEW HOME",
    price: { currency: "KRW", amount: 269000 },
    tags: ["desk", "wide"],
    dimensions: {
      overall: { widthM: 1.4, depthM: 0.7, heightM: 0.74 },
      bbox: {
        min: { x: -0.7, y: 0, z: -0.35 },
        max: { x: 0.7, y: 0.74, z: 0.35 },
        size: { x: 1.4, y: 0.74, z: 0.7 },
      },
      referenceHeights: {
        topY: 0.74,
        workSurfaceY: 0.74,
        underY: 0.69,
      },
      reachDepth: {
        usableDepthM: 0.66,
        kneeInsetDepthM: 0.24,
      },
      coordinateMeta: {
        upAxis: "Y",
        unit: "m",
        origin: "floor-center",
        normalized: true,
      },
    },
    materials: {
      basePresetId: "walnut-white",
      presets: [
        {
          id: "walnut-white",
          label: "월넛 상판 + 화이트 프레임",
          swatches: [
            {
              slot: "top",
              materialType: "wood",
              baseColorHex: "#7A4E2D",
              roughness: 0.62,
            },
            {
              slot: "leg",
              materialType: "steel",
              baseColorHex: "#F5F5F5",
              roughness: 0.4,
              metalness: 0.7,
            },
          ],
        },
      ],
      meshBindings: [
        { slot: "top", meshNames: ["desk1400_top", "desk1400_edge"] },
        { slot: "leg", meshNames: ["desk1400_leg_l", "desk1400_leg_r", "desk1400_frame"] },
      ],
    },
    assets: {
      glbUrl: "https://cdn.poview.app/models/desk-1400.glb",
      previewImageUrl: "https://cdn.poview.app/images/desk-1400.jpg",
      dracoCompressed: true,
      originalSizeKb: 6510,
      compressedSizeKb: 1320,
    },
    createdAt: "2026-03-11T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
  {
    id: "chair-ergo-lite",
    sku: "CHAIR-ERGO-LITE",
    name: "에르고 체어 라이트",
    category: "chair",
    brand: "POVIEW HOME",
    price: { currency: "KRW", amount: 149000 },
    tags: ["chair", "ergonomic"],
    dimensions: {
      overall: { widthM: 0.63, depthM: 0.62, heightM: 1.08 },
      bbox: {
        min: { x: -0.315, y: 0, z: -0.31 },
        max: { x: 0.315, y: 1.08, z: 0.31 },
        size: { x: 0.63, y: 1.08, z: 0.62 },
      },
      referenceHeights: {
        topY: 1.08,
        seatY: 0.46,
        backrestTopY: 1.08,
      },
      reachDepth: {
        usableDepthM: 0.44,
      },
      coordinateMeta: {
        upAxis: "Y",
        unit: "m",
        origin: "floor-center",
        normalized: true,
      },
    },
    materials: {
      basePresetId: "graphite-mesh",
      presets: [
        {
          id: "graphite-mesh",
          label: "그래파이트 메시",
          swatches: [
            {
              slot: "seat",
              materialType: "fabric",
              baseColorHex: "#3B3F46",
              roughness: 0.85,
            },
            {
              slot: "frame",
              materialType: "steel",
              baseColorHex: "#262A30",
              roughness: 0.35,
              metalness: 0.75,
            },
          ],
        },
      ],
      meshBindings: [
        { slot: "seat", meshNames: ["chair_seat", "chair_backrest"] },
        { slot: "frame", meshNames: ["chair_base", "chair_arm_l", "chair_arm_r"] },
      ],
    },
    assets: {
      glbUrl: "https://cdn.poview.app/models/chair-ergo-lite.glb",
      previewImageUrl: "https://cdn.poview.app/images/chair-ergo-lite.jpg",
      dracoCompressed: true,
      originalSizeKb: 4880,
      compressedSizeKb: 980,
    },
    createdAt: "2026-03-11T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
];

export function getProductById(productId: string): Product | undefined {
  return MOCK_PRODUCTS.find((product) => product.id === productId);
}
