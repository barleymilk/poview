"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseDeepLink, type DeepLinkState } from "@/src/domain/deep-link";
import { FIT_GRADE_UI_MAP } from "@/src/domain/fit-grade";
import { calculatePovScore } from "@/src/domain/pov-score";
import {
  readLocalProfile,
  writeLocalProfile,
  writeSimulationResult,
} from "@/src/domain/simulation-session";
import type { Product } from "@/src/domain/types";

const DEFAULT_STATE: DeepLinkState = {
  heightCm: 170,
  mode: "standing",
  distanceToTargetM: 0.8,
};

const SHARE_PRESETS: Record<string, DeepLinkState> = {
  "pov-desk-focus": {
    heightCm: 168,
    mode: "seated",
    distanceToTargetM: 0.65,
  },
  "pov-standing-wide": {
    heightCm: 182,
    mode: "standing",
    distanceToTargetM: 1.1,
  },
};

interface SimulatorClientProps {
  product: Product;
}

function generateSimulationId(): string {
  return `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function SimulatorClient({ product }: SimulatorClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialParsed = useMemo(() => {
    const localProfile = readLocalProfile();
    return parseDeepLink({
      query: new URLSearchParams(searchParams.toString()),
      defaultState: DEFAULT_STATE,
      localProfile,
      resolveShare: (share) => SHARE_PRESETS[share],
    });
  }, [searchParams]);

  const [heightCm, setHeightCm] = useState<number>(initialParsed.state.heightCm);
  const [mode, setMode] = useState<DeepLinkState["mode"]>(initialParsed.state.mode);
  const [distanceToTargetM, setDistanceToTargetM] = useState<number>(
    initialParsed.state.distanceToTargetM,
  );

  const score = useMemo(() => {
    return calculatePovScore({
      heightCm,
      mode,
      distanceToTargetM,
      topY: product.dimensions.referenceHeights.topY,
      underY: product.dimensions.referenceHeights.underY,
    });
  }, [heightCm, mode, distanceToTargetM, product]);

  const fitMeta = FIT_GRADE_UI_MAP[score.fitGrade];

  function handleRecommend() {
    const input: DeepLinkState = { heightCm, mode, distanceToTargetM };
    writeLocalProfile(input);

    const simulationId = generateSimulationId();
    writeSimulationResult({
      simulationId,
      productId: product.id,
      input,
      fitScore: score.finalScore,
      fitGrade: score.fitGrade,
      scoringVersion: score.scoringVersion,
      createdAt: new Date().toISOString(),
    });

    router.push(`/recommendations?simulationId=${simulationId}`);
  }

  return (
    <main>
      <h2>SimulatorPage</h2>
      <p>productId: {product.id}</p>
      <p>deep-link source: {initialParsed.source}</p>

      <div style={{ display: "grid", gap: 10, maxWidth: 360, marginTop: 16 }}>
        <label>
          heightCm
          <input
            type="number"
            min={130}
            max={210}
            value={heightCm}
            onChange={(event) => setHeightCm(Number(event.target.value))}
          />
        </label>

        <label>
          mode
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as DeepLinkState["mode"])}
          >
            <option value="standing">standing</option>
            <option value="seated">seated</option>
          </select>
        </label>

        <label>
          distanceToTargetM
          <input
            type="number"
            min={0.3}
            max={2}
            step={0.1}
            value={distanceToTargetM}
            onChange={(event) => setDistanceToTargetM(Number(event.target.value))}
          />
        </label>

        <button type="button" onClick={handleRecommend}>
          추천 보기
        </button>
      </div>

      <section style={{ marginTop: 20 }}>
        <h3>SimulationResult Preview</h3>
        <p>fitScore: {score.finalScore}</p>
        <p>
          fitGrade: {score.fitGrade} ({fitMeta.labelKo})
        </p>
        <p>scoringVersion: {score.scoringVersion}</p>
        <p>deltaEyeToTopCm: {score.metrics.deltaEyeToTopCm.toFixed(1)}</p>
        <p>viewAngleDeg: {score.metrics.viewAngleDeg.toFixed(1)}</p>
        <p>
          legClearanceCm:{" "}
          {score.metrics.legClearanceCm === undefined
            ? "N/A"
            : score.metrics.legClearanceCm.toFixed(1)}
        </p>
      </section>
    </main>
  );
}
