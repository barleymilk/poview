import { fitGradeFromScore } from "./fit-grade";
import type { FitGrade, Mode } from "./types";
import { centimetersToMeters, metersToCentimeters } from "./unit";

export const SCORING_VERSION = "v1.0.0";

const STANDING_EYE_RATIO = 0.93;
const SEATED_EYE_RATIO = 0.67;
const SEATED_KNEE_RATIO = 0.3;
const SHOE_ALLOWANCE_M = 0.02;
const RECOMMENDED_MIN_DEG = -35;
const RECOMMENDED_MAX_DEG = -10;
const IDEAL_DELTA_CM = -25;

export interface PovScoreInput {
  heightCm: number;
  mode: Mode;
  distanceToTargetM: number;
  topY?: number;
  underY?: number;
}

export interface PovScoreBreakdown {
  angleScore: number;
  clearanceScore: number;
  deltaScore: number;
}

export interface PovScoreOutput {
  fitGrade: FitGrade;
  finalScore: number;
  scoringVersion: string;
  metrics: {
    deltaEyeToTopCm: number;
    viewAngleDeg: number;
    legClearanceCm?: number;
  };
  scoreBreakdown: PovScoreBreakdown;
  warnings: string[];
}

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveEyeY(heightCm: number, mode: Mode): number {
  const ratio = mode === "standing" ? STANDING_EYE_RATIO : SEATED_EYE_RATIO;
  const rawEyeY = centimetersToMeters(heightCm) * ratio;
  return clamp(0.9, 1.95, rawEyeY);
}

function resolveAngleScore(viewAngleDeg: number): number {
  const angleDeviationDeg = Math.max(
    RECOMMENDED_MIN_DEG - viewAngleDeg,
    0,
    viewAngleDeg - RECOMMENDED_MAX_DEG,
  );
  return clamp(0, 100, 100 - 10 * angleDeviationDeg);
}

function resolveClearanceScore(legClearanceCm?: number): number {
  if (legClearanceCm === undefined) {
    return 50;
  }

  if (legClearanceCm >= 8) {
    return 100;
  }

  if (legClearanceCm >= 4) {
    return 70 + ((legClearanceCm - 4) / 4) * 30;
  }

  if (legClearanceCm >= 0) {
    return (legClearanceCm / 4) * 70;
  }

  return 0;
}

function resolveDeltaScore(deltaEyeToTopCm: number): number {
  const deltaDeviationCm = Math.abs(deltaEyeToTopCm - IDEAL_DELTA_CM);
  return clamp(0, 100, 100 - deltaDeviationCm * 2.5);
}

export function calculatePovScore(input: PovScoreInput): PovScoreOutput {
  const topY = input.topY ?? 0.72;
  const eyeY = resolveEyeY(input.heightCm, input.mode);
  const deltaEyeToTopM = topY - eyeY;
  const deltaEyeToTopCm = metersToCentimeters(deltaEyeToTopM);
  const viewAngleDeg =
    (Math.atan2(deltaEyeToTopM, input.distanceToTargetM) * 180) / Math.PI;

  let legClearanceCm: number | undefined;
  const warnings: string[] = [];

  if (input.underY !== undefined) {
    const kneeY = centimetersToMeters(input.heightCm) * SEATED_KNEE_RATIO + SHOE_ALLOWANCE_M;
    legClearanceCm = metersToCentimeters(input.underY - kneeY);
  } else {
    warnings.push("하부 치수 미제공");
  }

  const angleScore = resolveAngleScore(viewAngleDeg);
  const clearanceScore = resolveClearanceScore(legClearanceCm);
  const deltaScore = resolveDeltaScore(deltaEyeToTopCm);
  const weightedScore = 0.4 * angleScore + 0.4 * clearanceScore + 0.2 * deltaScore;
  const finalScore = Math.round(clamp(0, 100, weightedScore));
  const fitGrade = fitGradeFromScore(finalScore);

  return {
    fitGrade,
    finalScore,
    scoringVersion: SCORING_VERSION,
    metrics: {
      deltaEyeToTopCm,
      viewAngleDeg,
      legClearanceCm,
    },
    scoreBreakdown: {
      angleScore,
      clearanceScore,
      deltaScore,
    },
    warnings,
  };
}
