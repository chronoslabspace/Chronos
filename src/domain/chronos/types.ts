// Chronos Core — primitive value types. Explicit entities live in entities.ts.

export type WorldState = {
  robot: {
    x: number;
    y: number;
    armAngle: number; // degrees
    gripOpen: boolean;
  };
  object: {
    x: number;
    y: number;
    stable: boolean; // whether it's fixed or could slip
    grasped: boolean;
  };
  environment: {
    humanPresent: boolean;
    wind: number; // 0-10
    lighting: "bright" | "dim" | "dark";
  };
  timestamp: number;
};

export type Action = {
  id: string;
  name: string;
  description: string;
  apply: (state: WorldState) => {
    robot?: Partial<WorldState["robot"]>;
    object?: Partial<WorldState["object"]>;
    environment?: Partial<WorldState["environment"]>;
  };
  // Estimated risk (0-1) and reward (0-1)
  baseRisk: number;
  baseReward: number;
};

export type BranchStatus = "pending" | "evaluated" | "winner" | "pruned" | "merged";

export type Phase = "idle" | "forked" | "evaluated" | "collapsed";

export type CollapseStrategy = "max-utility" | "min-risk" | "balanced";

export type LogEntry = {
  id: string;
  phase: Phase;
  message: string;
  color: string;
  timestamp: number;
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  initialState: WorldState;
  actions: Action[];
};

// Backward-compatible name for presentation/application code during the
// migration. The concrete aggregate is Simulation, not an anonymous object.
export type Engine = import("./entities").Simulation;
