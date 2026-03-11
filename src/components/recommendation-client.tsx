"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FIT_GRADE_UI_MAP } from "@/src/domain/fit-grade";
import { readSimulationResult } from "@/src/domain/simulation-session";
import { MOCK_PRODUCTS } from "@/src/mocks/products";

interface RecommendationSetCard {
  id: string;
  title: string;
  score: number;
  budgetBand: "low" | "mid" | "high";
  itemIds: string[];
}

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildRecommendationSets(baseScore: number): RecommendationSetCard[] {
  const firstDesk = MOCK_PRODUCTS.find((item) => item.category === "desk");
  const secondDesk = MOCK_PRODUCTS.filter((item) => item.category === "desk")[1];
  const chair = MOCK_PRODUCTS.find((item) => item.category === "chair");

  if (!firstDesk || !secondDesk || !chair) {
    return [];
  }

  const sets: RecommendationSetCard[] = [
    {
      id: "set-focus-balanced",
      title: "집중형 밸런스 세트",
      score: clamp(0, 100, baseScore + 6),
      budgetBand: "mid",
      itemIds: [firstDesk.id, chair.id],
    },
    {
      id: "set-wide-premium",
      title: "와이드 프리미엄 세트",
      score: clamp(0, 100, baseScore + 2),
      budgetBand: "high",
      itemIds: [secondDesk.id, chair.id],
    },
    {
      id: "set-starter-compact",
      title: "스타터 콤팩트 세트",
      score: clamp(0, 100, baseScore - 8),
      budgetBand: "low",
      itemIds: [firstDesk.id],
    },
  ];

  return sets.sort((left, right) => right.score - left.score);
}

export function RecommendationClient() {
  const searchParams = useSearchParams();
  const simulationId = searchParams.get("simulationId");

  const simulation = useMemo(() => {
    if (!simulationId) {
      return undefined;
    }
    return readSimulationResult(simulationId);
  }, [simulationId]);

  if (!simulationId) {
    return (
      <main>
        <h2>RecommendationPage</h2>
        <p>`simulationId`가 없어 추천을 생성할 수 없습니다.</p>
      </main>
    );
  }

  if (!simulation) {
    return (
      <main>
        <h2>RecommendationPage</h2>
        <p>시뮬레이션 결과를 찾을 수 없습니다. 시뮬레이터에서 다시 실행해주세요.</p>
      </main>
    );
  }

  const fitMeta = FIT_GRADE_UI_MAP[simulation.fitGrade];
  const sets = buildRecommendationSets(simulation.fitScore);

  return (
    <main>
      <h2>RecommendationPage</h2>
      <p>route: /recommendations</p>
      <p>simulationId: {simulation.simulationId}</p>
      <p>
        적합 배지: {fitMeta.labelKo} ({simulation.fitGrade}) / score: {simulation.fitScore}
      </p>
      <p>scoringVersion: {simulation.scoringVersion}</p>

      <section style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {sets.map((set) => (
          <article key={set.id} style={{ border: "1px solid #d1d5db", padding: 12 }}>
            <h3>{set.title}</h3>
            <p>추천 점수: {set.score}</p>
            <p>budgetBand: {set.budgetBand}</p>
            <p>items: {set.itemIds.join(", ")}</p>
          </article>
        ))}
      </section>

      <div style={{ marginTop: 16 }}>
        <Link className="pill" href={`/simulator/${simulation.productId}`}>
          시뮬레이터로 돌아가기
        </Link>
      </div>
    </main>
  );
}
