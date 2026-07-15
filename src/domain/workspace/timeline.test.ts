import { describe, expect, it } from "vitest";
import { deriveNextSteps, futureCardLabel } from "./timeline";
import type { FutureRecord } from "./types";

const future = (overrides: Partial<FutureRecord> = {}): FutureRecord => ({
  id: "f1",
  simulation_id: "s1",
  name: "Bootstrap",
  score: 0.8,
  risk: 0.3,
  confidence: 0.82,
  summary: "Stay capital efficient until product-market fit.",
  ...overrides,
});

describe("timeline cards helpers", () => {
  it("labels futures A–E", () => {
    expect(futureCardLabel(0)).toBe("A");
    expect(futureCardLabel(3)).toBe("D");
  });

  it("derives next steps for best and alternate futures", () => {
    const best = deriveNextSteps(future(), true);
    expect(best[0]).toMatch(/primary recommendation/i);
    expect(best.length).toBeGreaterThanOrEqual(3);

    const alt = deriveNextSteps(future({ risk: 0.7, confidence: 0.4 }), false);
    expect(alt[0]).toMatch(/Compare/i);
    expect(alt.some((s) => /risk/i.test(s))).toBe(true);
  });
});
