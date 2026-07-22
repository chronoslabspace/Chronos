import { describe, expect, it } from "vitest";
import { agents } from "../../domain/chronos/agents";
import { getScenario } from "../../domain/chronos/scenarios";
import { runAgent, runAgentSimulation } from "./AgentSimulationRunner";
import { createEngine, run } from "./engine";

describe("AgentSimulationRunner", () => {
  it("runs forge → evaluate → collapse and returns a ranked winner", () => {
    const result = runAgent("forge");

    expect(result.agentId).toBe("forge");
    expect(result.scenarioId).toBe("forge");
    expect(result.simulation.status).toBe("completed");
    expect(result.phases).toEqual(["idle", "forked", "evaluated", "collapsed"]);
    expect(result.winner).not.toBeNull();
    expect(result.ranked).toHaveLength(4);
    expect(result.ranked[0].actionId).toBe(result.winner!.actionId);
    // Descending EV
    for (let i = 1; i < result.ranked.length; i++) {
      expect(result.ranked[i - 1].expectedValue).toBeGreaterThanOrEqual(
        result.ranked[i].expectedValue
      );
    }
    expect(result.winner!.reason.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same agent + strategy", () => {
    const a = runAgent("oracle", "balanced");
    const b = runAgent("oracle", "balanced");
    expect(a.winner?.actionId).toBe(b.winner?.actionId);
    expect(a.ranked.map((r) => r.score)).toEqual(b.ranked.map((r) => r.score));
    expect(a.edge).toBe(b.edge);
  });

  it("respects min-risk collapse for agent workloads", () => {
    const maxU = runAgent("atlas", "max-utility");
    const minR = runAgent("atlas", "min-risk");
    expect(minR.winner).not.toBeNull();
    // min-risk should pick the lowest base risk among candidates
    const lowestRisk = Math.min(...minR.ranked.map((r) => r.risk));
    expect(minR.winner!.risk).toBe(lowestRisk);
    // Strategies can diverge on atlas
    expect(maxU.winner?.actionId).toBeTruthy();
  });

  it("runs all registered agents without throwing", () => {
    for (const agent of agents) {
      const result = runAgentSimulation({ agent });
      expect(result.simulation.phase).toBe("collapsed");
      expect(result.winner).not.toBeNull();
      expect(result.ranked.length).toBe(agent.scenario.actions.length);
    }
  });

  it("accepts an explicit scenario (robot-arm) and preserves physical winner", () => {
    const scenario = getScenario("robot-arm");
    const result = runAgentSimulation({ scenario, strategy: "max-utility" });
    expect(result.agentId).toBeNull();
    expect(result.winner?.actionId).toBe("grasp-direct");
  });
});

describe("engine.run", () => {
  it("executes the full pipeline from idle", () => {
    const scenario = getScenario("robot-arm");
    const completed = run(createEngine(scenario.id, scenario.initialState, scenario.actions));
    expect(completed.phase).toBe("collapsed");
    expect(completed.winner?.actionId).toBe("grasp-direct");
  });

  it("uses deterministic branch ids per simulation + action", () => {
    const scenario = getScenario("robot-arm");
    const engine = createEngine(scenario.id, scenario.initialState, scenario.actions);
    const completed = run(engine);
    for (const action of scenario.actions) {
      const branch = completed.branches.find((b) => b.actionId === action.id);
      expect(branch?.id).toBe(`br-${engine.id}-${action.id}`);
    }
  });
});
