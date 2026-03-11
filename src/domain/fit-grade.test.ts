import { describe, expect, it } from "vitest";
import { fitGradeFromScore } from "./fit-grade";

describe("fitGradeFromScore", () => {
  it("경계값 59/60/79/80을 문서 규칙대로 분류한다", () => {
    expect(fitGradeFromScore(59)).toBe("not-recommended");
    expect(fitGradeFromScore(60)).toBe("conditional");
    expect(fitGradeFromScore(79)).toBe("conditional");
    expect(fitGradeFromScore(80)).toBe("good");
  });
});
