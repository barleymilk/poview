import type { DeepLinkState } from "./deep-link";
import type { FitGrade } from "./types";

export const LOCAL_PROFILE_STORAGE_KEY = "poview.localProfile";
export const SIMULATION_RESULTS_STORAGE_KEY = "poview.simulationResults";

export interface StoredSimulationResult {
  simulationId: string;
  productId: string;
  input: DeepLinkState;
  fitScore: number;
  fitGrade: FitGrade;
  scoringVersion: string;
  createdAt: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readLocalProfile(): Partial<DeepLinkState> | undefined {
  if (!isBrowser()) {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILE_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    return JSON.parse(raw) as Partial<DeepLinkState>;
  } catch {
    return undefined;
  }
}

export function writeLocalProfile(profile: DeepLinkState): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(LOCAL_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function readSimulationResult(
  simulationId: string,
): StoredSimulationResult | undefined {
  if (!isBrowser()) {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(SIMULATION_RESULTS_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as Record<string, StoredSimulationResult>;
    return parsed[simulationId];
  } catch {
    return undefined;
  }
}

export function writeSimulationResult(result: StoredSimulationResult): void {
  if (!isBrowser()) {
    return;
  }

  let existing: Record<string, StoredSimulationResult> = {};
  try {
    const raw = window.localStorage.getItem(SIMULATION_RESULTS_STORAGE_KEY);
    existing = raw ? (JSON.parse(raw) as Record<string, StoredSimulationResult>) : {};
  } catch {
    existing = {};
  }

  existing[result.simulationId] = result;
  window.localStorage.setItem(SIMULATION_RESULTS_STORAGE_KEY, JSON.stringify(existing));
}
