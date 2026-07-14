// Chronos Core — Temporal Decision Engine
// Pure functions. No side effects. Deterministic.

import type {
  WorldState,
  Action,
  Engine,
  LogEntry,
  Phase,
  CollapseStrategy,
} from "../../domain/chronos/types";
import {
  Branch,
  Collapse,
  Decision,
  Hypothesis,
  Outcome,
  Simulation,
  Timeline,
} from "../../domain/chronos/entities";

let branchCounter = 0;
let logCounter = 0;
let simulationCounter = 0;

function nextBranchId(): string {
  branchCounter += 1;
  return `0x${branchCounter.toString(16).padStart(2, "0")}`;
}

function nextLogId(): string {
  logCounter += 1;
  return `log-${logCounter}`;
}

// ---- Fork ----
// Creates one branch per candidate action by applying the action's delta
// to the current world state. Each branch gets a deterministic id and
// starts as "pending".

export function fork(engine: Engine): Engine {
  if (engine.phase !== "idle") return engine;
  if (engine.actions.length === 0) return engine;

  const hypotheses = engine.actions.map((action) => Hypothesis.fromAction(action));
  const branches: Branch[] = hypotheses.map((hypothesis) => {
    const action = hypothesis.action;
    const delta = action.apply(engine.world);
    const nextState: WorldState = {
      ...engine.world,
      robot: { ...engine.world.robot, ...delta.robot },
      object: { ...engine.world.object, ...delta.object },
      environment: { ...engine.world.environment, ...delta.environment },
      timestamp: engine.world.timestamp + 1,
    };

    return new Branch({
      id: nextBranchId(),
      hypothesis,
      state: nextState,
    });
  });

  const log: LogEntry = {
    id: nextLogId(),
    phase: "forked",
    message: `fork → ${branches.length} branches`,
    color: "#c6f0ff",
    timestamp: Date.now(),
  };

  return engine.with({
    branches,
    phase: "forked",
    log: [...engine.log, log],
    timeline: engine.timeline.registerBranches(branches).record(log),
    decision: engine.decision.withHypotheses(hypotheses),
    status: "running",
  });
}

// ---- Evaluate ----
// Scores each branch against a utility function that weighs:
//   - Reward (how good is the outcome?)
//   - Risk (how likely is something bad?)
//   - Environmental hazards (human present, wind, darkness)
//   - Object stability (could it slip?)
//
// Returns updated branches with scores and "evaluated" status.

function scoreBranch(branch: Branch): number {
  const { state, risk, reward } = branch;

  // Base utility
  let utility = reward * 1.0 - risk * 0.8;

  // Environmental hazards
  if (state.environment.humanPresent) {
    utility -= 0.15; // safety-first
  }
  if (state.environment.wind > 5) {
    utility -= (state.environment.wind - 5) * 0.04;
  }
  if (state.environment.lighting === "dark") {
    utility -= 0.1;
  } else if (state.environment.lighting === "dim") {
    utility -= 0.04;
  }

  // Object stability
  if (!state.object.stable) {
    utility -= 0.12;
  }

  // Proximity bonus — closer is better (for grasp actions)
  const dx = state.robot.x - state.object.x;
  const dy = state.robot.y - state.object.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < 20) {
    utility += 0.08;
  }

  // Grasped bonus
  if (state.object.grasped) {
    utility += 0.15;
  }

  // Normalize to 0-1
  return Math.max(0, Math.min(1, utility));
}

function reasonForScore(branch: Branch): string {
  const reasons: string[] = [];
  if (branch.state.environment.humanPresent) reasons.push("human near");
  if (branch.state.environment.wind > 5) reasons.push("wind");
  if (branch.state.environment.lighting === "dark") reasons.push("dark");
  if (!branch.state.object.stable) reasons.push("unstable");
  if (branch.state.object.grasped) reasons.push("grasped");
  if (branch.risk > 0.5) reasons.push("high-risk");
  if (branch.reward > 0.7) reasons.push("high-reward");
  return reasons.length ? reasons.join(" · ") : "neutral";
}

export function evaluate(engine: Engine): Engine {
  if (engine.phase !== "forked") return engine;

  const branches = engine.branches.map((branch) => {
    const outcome = new Outcome({
      branchId: branch.id,
      score: scoreBranch(branch),
      reason: reasonForScore(branch),
      risk: branch.hypothesis.action.baseRisk,
      reward: branch.hypothesis.action.baseReward,
    });
    return branch.withOutcome(outcome);
  });

  const log: LogEntry = {
    id: nextLogId(),
    phase: "evaluated",
    message: `evaluate → scored ${branches.length} branches`,
    color: "#b79bff",
    timestamp: Date.now(),
  };

  return engine.with({
    branches,
    phase: "evaluated",
    log: [...engine.log, log],
    timeline: engine.timeline.record(log),
  });
}

// ---- Collapse ----
// Selects the highest-scoring branch as the winner.
// Marks all other branches as pruned.
// Updates the engine's world state to the winner's state.

export function collapse(
  engine: Engine,
  strategy: CollapseStrategy = "max-utility"
): Engine {
  if (engine.phase !== "evaluated") return engine;

  const scored = engine.branches.filter((b) => b.score !== null);
  if (scored.length === 0) return engine;

  let winnerId: string;

  if (strategy === "max-utility") {
    winnerId = scored.reduce((best, b) => ((b.score ?? 0) > (best.score ?? 0) ? b : best)).id;
  } else if (strategy === "min-risk") {
    winnerId = scored.reduce((best, b) => (b.risk < best.risk ? b : best)).id;
  } else {
    // balanced: max (reward - risk/2)
    winnerId = scored.reduce((best, b) => {
      const bScore = (b.reward ?? 0) - (b.risk ?? 0) / 2;
      const bestScore = (best.reward ?? 0) - (best.risk ?? 0) / 2;
      return bScore > bestScore ? b : best;
    }).id;
  }

  const branches = engine.branches.map((branch) =>
    branch.id === winnerId ? branch.select() : branch.prune()
  );

  const winner = branches.find((b) => b.id === winnerId)!;

  const log: LogEntry = {
    id: nextLogId(),
    phase: "collapsed",
    message: `collapse → branch_${winner.id} wins · score ${winner.score!.toFixed(3)}`,
    color: "#ffd7a3",
    timestamp: Date.now(),
  };

  const collapseRecord = new Collapse({
    id: `collapse-${nextLogId()}`,
    timelineId: engine.timeline.id,
    selectedBranchId: winner.id,
    discardedBranchIds: branches
      .filter((branch) => branch.id !== winner.id)
      .map((branch) => branch.id),
    strategy,
  });

  return engine.with({
    branches,
    world: winner.state,
    phase: "collapsed",
    log: [...engine.log, log],
    timeline: engine.timeline.registerBranches(branches).record(log).commit(winner, collapseRecord),
    status: "completed",
  });
}

// ---- Reset ----
// Returns the engine to its initial scenario state.

export function reset(engine: Engine, initialWorld: WorldState): Engine {
  const log: LogEntry = {
    id: nextLogId(),
    phase: "idle",
    message: `reset → back to origin`,
    color: "#8a93a6",
    timestamp: Date.now(),
  };

  return engine.with({
    world: initialWorld,
    branches: [],
    phase: "idle",
    log: [...engine.log, log],
    timeline: new Timeline({
      id: engine.timeline.id,
      canonicalState: initialWorld,
      events: [...engine.timeline.events, log],
    }),
    status: "pending",
  });
}

// ---- Helpers ----

export function createEngine(
  scenarioId: string,
  world: WorldState,
  actions: Action[]
): Engine {
  simulationCounter += 1;
  const id = `simulation-${scenarioId}-${simulationCounter}`;
  const readyLog: LogEntry = {
    id: nextLogId(),
    phase: "idle",
    message: `engine ready · ${actions.length} actions loaded`,
    color: "#c6f0ff",
    timestamp: Date.now(),
  };

  return new Simulation({
    id,
    scenarioId,
    world,
    actions,
    decision: new Decision({
      id: `decision-${id}`,
      goal: `Evaluate ${scenarioId}`,
      strategy: "max-utility",
    }),
    timeline: new Timeline({
      id: `timeline-${id}`,
      canonicalState: world,
      events: [readyLog],
    }),
    log: [readyLog],
  });
}

export function getPhaseLabel(phase: Phase): string {
  return {
    idle: "idle",
    forked: "forked",
    evaluated: "evaluated",
    collapsed: "collapsed",
  }[phase];
}
