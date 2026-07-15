import { describe, expect, it } from "vitest";
import type { GoalRecord, KnowledgeRecord } from "../../domain/workspace/types";
import { SimulationEngine } from "./SimulationEngine";

const goal: GoalRecord = {
  id: "g1",
  workspace_id: "w1",
  title: "Launch CLAB on Kickstart",
  description: "Public launch",
  status: "active",
  priority: 1,
  created_at: "2026-01-01T00:00:00.000Z",
};

const knowledge: KnowledgeRecord[] = [
  {
    id: "k1",
    workspace_id: "w1",
    type: "markdown",
    title: "Kickstart brief",
    content: "Bootstrap preferred early",
    metadata: {},
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

describe("SimulationEngine", () => {
  const engine = new SimulationEngine();

  it("runs planner → futures → evaluate → rank → best future", () => {
    const out = engine.run({
      simulationId: "sim-1",
      workspaceId: "w1",
      goal,
      objective: "Should we raise funding before Kickstart?",
      knowledge,
      notes: [],
      constraints: [
        { id: "c1", text: "no raise before launch", kind: "hard" },
        { id: "c2", text: "keep runway 12 months", kind: "soft" },
      ],
    });

    expect(out.futures).toHaveLength(5);
    expect(out.best.name).toBe(out.futures[0].name);
    expect(out.confidence).toBe(out.best.confidence);
    expect(out.recommendation).toContain("Best path");
    expect(out.risks.length).toBeGreaterThan(0);
    expect(out.plannerTaskTitles.length).toBeGreaterThan(0);

    // All pipeline tasks completed
    expect(out.tasks.map((t) => t.status)).toEqual([
      "completed",
      "completed",
      "completed",
      "completed",
      "completed",
    ]);
    expect(out.tasks.map((t) => t.phase)).toEqual([
      "plan",
      "generate",
      "evaluate",
      "rank",
      "collapse",
    ]);

    // Ranked descending score
    for (let i = 1; i < out.futures.length; i++) {
      expect(out.futures[i - 1].score).toBeGreaterThanOrEqual(out.futures[i].score);
    }
  });

  it("is deterministic for the same inputs", () => {
    const input = {
      simulationId: "sim-2",
      workspaceId: "w1",
      goal,
      objective: "Launch API first?",
      knowledge,
      notes: [],
      constraints: [] as const,
    };
    const a = engine.run(input);
    const b = engine.run(input);
    expect(a.futures.map((f) => f.name)).toEqual(b.futures.map((f) => f.name));
    expect(a.best.score).toBe(b.best.score);
    expect(a.confidence).toBe(b.confidence);
  });

  it("fails cleanly on empty objective", () => {
    const out = engine.run({
      simulationId: "sim-3",
      workspaceId: "w1",
      goal,
      objective: "   ",
      knowledge: [],
      notes: [],
      constraints: [],
    });
    expect(out.confidence).toBe(0);
    expect(out.tasks.some((t) => t.status === "failed")).toBe(true);
  });
});
