import { describe, expect, it } from "vitest";
import { parseDeepLink, type DeepLinkState } from "./deep-link";

const defaultState: DeepLinkState = {
  heightCm: 170,
  mode: "standing",
  distanceToTargetM: 0.8,
};

describe("parseDeepLink", () => {
  it("share가 유효하면 raw query보다 우선한다", () => {
    const result = parseDeepLink({
      query: new URLSearchParams(
        "share=abc123&heightCm=185&mode=seated&distanceToTargetM=1.2",
      ),
      defaultState,
      resolveShare: () => ({
        heightCm: 160,
        mode: "seated",
        distanceToTargetM: 0.6,
      }),
    });

    expect(result.source).toBe("share");
    expect(result.state).toEqual({
      heightCm: 160,
      mode: "seated",
      distanceToTargetM: 0.6,
    });
  });

  it("share가 무효면 raw query를 사용한다", () => {
    const result = parseDeepLink({
      query: new URLSearchParams("share=expired&heightCm=180&mode=seated"),
      defaultState,
      resolveShare: () => undefined,
    });

    expect(result.source).toBe("raw-query");
    expect(result.state).toEqual({
      heightCm: 180,
      mode: "seated",
      distanceToTargetM: 0.8,
    });
  });

  it("share/raw query가 없으면 localProfile을 사용한다", () => {
    const result = parseDeepLink({
      query: new URLSearchParams(""),
      defaultState,
      localProfile: {
        heightCm: 175,
        distanceToTargetM: 1.1,
      },
    });

    expect(result.source).toBe("local-profile");
    expect(result.state).toEqual({
      heightCm: 175,
      mode: "standing",
      distanceToTargetM: 1.1,
    });
  });

  it("모든 입력이 없으면 default를 사용한다", () => {
    const result = parseDeepLink({
      query: new URLSearchParams(""),
      defaultState,
    });

    expect(result.source).toBe("default");
    expect(result.state).toEqual(defaultState);
  });
});
