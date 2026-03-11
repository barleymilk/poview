import type { FitGrade } from "./types";

export interface FitGradeUiMeta {
  labelKo: string;
  minScore: number;
  maxScore: number;
}

export const FIT_GRADE_UI_MAP: Record<FitGrade, FitGradeUiMeta> = {
  good: {
    labelKo: "적합",
    minScore: 80,
    maxScore: 100,
  },
  conditional: {
    labelKo: "조건부 적합",
    minScore: 60,
    maxScore: 79,
  },
  "not-recommended": {
    labelKo: "비추천",
    minScore: 0,
    maxScore: 59,
  },
};

export function fitGradeFromScore(score: number): FitGrade {
  if (score >= 80) {
    return "good";
  }

  if (score >= 60) {
    return "conditional";
  }

  return "not-recommended";
}
