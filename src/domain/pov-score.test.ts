import { describe, expect, it } from "vitest";
import { fitGradeFromScore } from "./fit-grade";
import { calculateFinalScoreFromBreakdown } from "./pov-score";

describe("pov-score boundary", () => {
  it("finalScore 경계값(59/60/79/80)에서 등급이 문서 규칙과 일치한다", () => {
    const score59 = calculateFinalScoreFromBreakdown({
      angleScore: 59,
      clearanceScore: 59,
      deltaScore: 59,
    });
    const score60 = calculateFinalScoreFromBreakdown({
      angleScore: 60,
      clearanceScore: 60,
      deltaScore: 60,
    });
    const score79 = calculateFinalScoreFromBreakdown({
      angleScore: 79,
      clearanceScore: 79,
      deltaScore: 79,
    });
    const score80 = calculateFinalScoreFromBreakdown({
      angleScore: 80,
      clearanceScore: 80,
      deltaScore: 80,
    });

    expect(score59).toBe(59);
    expect(score60).toBe(60);
    expect(score79).toBe(79);
    expect(score80).toBe(80);

    expect(fitGradeFromScore(score59)).toBe("not-recommended");
    expect(fitGradeFromScore(score60)).toBe("conditional");
    expect(fitGradeFromScore(score79)).toBe("conditional");
    expect(fitGradeFromScore(score80)).toBe("good");
  });
});
