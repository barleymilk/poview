import type { Mode } from "./types";

export interface DeepLinkState {
  heightCm: number;
  mode: Mode;
  distanceToTargetM: number;
}

export type DeepLinkSource = "share" | "raw-query" | "local-profile" | "default";

export interface ParseDeepLinkInput {
  query: URLSearchParams;
  defaultState: DeepLinkState;
  localProfile?: Partial<DeepLinkState>;
  resolveShare?: (share: string) => DeepLinkState | undefined;
}

export interface ParseDeepLinkResult {
  source: DeepLinkSource;
  state: DeepLinkState;
}

function toNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

function isValidMode(value: string | null): value is Mode {
  return value === "standing" || value === "seated";
}

function withValidation(
  baseState: DeepLinkState,
  patch?: Partial<DeepLinkState>,
): DeepLinkState {
  if (!patch) {
    return baseState;
  }

  return {
    heightCm:
      patch.heightCm !== undefined && patch.heightCm >= 130 && patch.heightCm <= 210
        ? patch.heightCm
        : baseState.heightCm,
    mode: patch.mode && isValidMode(patch.mode) ? patch.mode : baseState.mode,
    distanceToTargetM:
      patch.distanceToTargetM !== undefined &&
      patch.distanceToTargetM >= 0.3 &&
      patch.distanceToTargetM <= 2.0
        ? patch.distanceToTargetM
        : baseState.distanceToTargetM,
  };
}

function parseRawQuery(query: URLSearchParams): Partial<DeepLinkState> | undefined {
  const rawPatch: Partial<DeepLinkState> = {};
  let hasAnyValid = false;

  const heightCm = toNumber(query.get("heightCm"));
  if (heightCm !== undefined && heightCm >= 130 && heightCm <= 210) {
    rawPatch.heightCm = heightCm;
    hasAnyValid = true;
  }

  const mode = query.get("mode");
  if (isValidMode(mode)) {
    rawPatch.mode = mode;
    hasAnyValid = true;
  }

  const distanceToTargetM = toNumber(query.get("distanceToTargetM"));
  if (
    distanceToTargetM !== undefined &&
    distanceToTargetM >= 0.3 &&
    distanceToTargetM <= 2.0
  ) {
    rawPatch.distanceToTargetM = distanceToTargetM;
    hasAnyValid = true;
  }

  return hasAnyValid ? rawPatch : undefined;
}

export function parseDeepLink(input: ParseDeepLinkInput): ParseDeepLinkResult {
  const share = input.query.get("share");
  if (share && input.resolveShare) {
    const sharedState = input.resolveShare(share);
    if (sharedState) {
      return {
        source: "share",
        state: withValidation(input.defaultState, sharedState),
      };
    }
  }

  const rawPatch = parseRawQuery(input.query);
  if (rawPatch) {
    return {
      source: "raw-query",
      state: withValidation(input.defaultState, rawPatch),
    };
  }

  if (input.localProfile) {
    return {
      source: "local-profile",
      state: withValidation(input.defaultState, input.localProfile),
    };
  }

  return {
    source: "default",
    state: input.defaultState,
  };
}
