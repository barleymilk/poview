import { describe, expect, it } from "vitest";
import { metersToCentimeters } from "./unit";

describe("metersToCentimeters", () => {
  it("m 단위를 cm로 정확히 변환한다", () => {
    expect(metersToCentimeters(0)).toBe(0);
    expect(metersToCentimeters(0.18)).toBeCloseTo(18);
    expect(metersToCentimeters(1.6)).toBe(160);
  });
});
