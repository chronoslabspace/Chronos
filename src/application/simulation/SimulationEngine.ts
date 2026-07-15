import { StartupLaunchPlanner } from "../planner/StartupLaunchPlanner";
import { simulate, type Path } from "../../domain/chronos/startup-sim";
import type {
  FutureRecord,
  GoalRecord,
  KnowledgeRecord,
  NoteRecord,
  TimelineNodeRecord,
} from "../../domain/workspace/types";

export type SimulationConstraint = {
  id: string;
  text: string;
  kind: "hard" | "soft";
};

export type SimulationTaskStatus = "pending" | "running" | "completed" | "failed";

export type SimulationTask = {
  id: string;
  title: string;
  status: SimulationTaskStatus;
  phase: "plan" | "generate" | "evaluate" | "rank" | "collapse";
};

export type SimulationEngineInput = {
  simulationId: string;
  workspaceId: string;
  goal: GoalRecord | null;
  objective: string;
  knowledge: readonly KnowledgeRecord[];
  notes: readonly NoteRecord[];
  constraints: readonly SimulationConstraint[];
};

export type SimulationEngineOutput = {
  /** Exactly 5 ranked futures (or fewer if engine cannot produce 5). */
  futures: FutureRecord[];
  best: FutureRecord;
  recommendation: string;
  risks: string[];
  confidence: number;
  tasks: SimulationTask[];
  timeline: TimelineNodeRecord[];
  category: string;
  thesis: string;
  plannerTaskTitles: string[];
};

function id(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Chronos Simulation Engine — product differentiator.
 *
 * Pipeline:
 *   Planner → Generate Futures → Evaluate → Rank → Best Future
 *
 * Inputs: goal, knowledge library, constraints.
 * Output: 5 futures, recommendation, risks, confidence, task trace.
 */
export class SimulationEngine {
  constructor(private readonly planner = new StartupLaunchPlanner()) {}

  run(input: SimulationEngineInput): SimulationEngineOutput {
    const tasks = this.createTaskShell();
    const objective = input.objective.trim();
    if (!objective) {
      return this.fail(input.simulationId, tasks, "Objective is required.");
    }

    try {
      // 1. Planner
      this.setTask(tasks, "plan", "running");
      const plan = this.planner.decompose({
        workspaceId: input.workspaceId,
        decisionId: input.simulationId,
        prompt: this.buildPlannerPrompt(input, objective),
      });
      const plannerTaskTitles = plan.tasks.map((t) => t.title);
      this.setTask(tasks, "plan", "completed");

      // 2. Generate futures
      this.setTask(tasks, "generate", "running");
      const corpus = this.buildCorpus(input, objective);
      const raw = simulate(corpus);
      const generated = this.expandToFive(raw.bestPath, raw.alternatives, corpus);
      this.setTask(tasks, "generate", "completed");

      // 3. Evaluate (knowledge + constraints adjust score/risk/confidence)
      this.setTask(tasks, "evaluate", "running");
      const evaluated = generated.map((path, index) =>
        this.evaluatePath(path, index, input, objective)
      );
      this.setTask(tasks, "evaluate", "completed");

      // 4. Rank
      this.setTask(tasks, "rank", "running");
      const ranked = [...evaluated].sort(
        (a, b) => b.score - a.score || b.confidence - a.confidence || a.name.localeCompare(b.name)
      );
      const futures = ranked.slice(0, 5).map((f, index) => ({
        ...f,
        id: f.id || id("future"),
        simulation_id: input.simulationId,
        // preserve rank signal in score already
        name: index === 0 ? f.name : f.name,
      }));
      this.setTask(tasks, "rank", "completed");

      // 5. Collapse → best future
      this.setTask(tasks, "collapse", "running");
      const best = futures[0];
      if (!best) {
        return this.fail(input.simulationId, tasks, "No futures generated.");
      }
      const risks = this.collectRisks(best, raw.bestPath, input.constraints);
      const recommendation = this.buildRecommendation(best, input, risks);
      const timeline = this.buildTimeline(input.simulationId, objective, futures, plannerTaskTitles);
      this.setTask(tasks, "collapse", "completed");

      return {
        futures,
        best,
        recommendation,
        risks,
        confidence: best.confidence,
        tasks,
        timeline,
        category: raw.categoryLabel,
        thesis: best.summary,
        plannerTaskTitles,
      };
    } catch (err) {
      return this.fail(input.simulationId, tasks, (err as Error).message);
    }
  }

  private createTaskShell(): SimulationTask[] {
    return [
      { id: "plan", title: "Planner", status: "pending", phase: "plan" },
      { id: "generate", title: "Generate futures", status: "pending", phase: "generate" },
      { id: "evaluate", title: "Evaluate", status: "pending", phase: "evaluate" },
      { id: "rank", title: "Rank", status: "pending", phase: "rank" },
      { id: "collapse", title: "Best future", status: "pending", phase: "collapse" },
    ];
  }

  private setTask(tasks: SimulationTask[], id: string, status: SimulationTaskStatus) {
    const task = tasks.find((t) => t.id === id);
    if (task) task.status = status;
  }

  private fail(
    simulationId: string,
    tasks: SimulationTask[],
    message: string
  ): SimulationEngineOutput {
    const running = tasks.find((t) => t.status === "running");
    if (running) running.status = "failed";
    for (const t of tasks) {
      if (t.status === "pending") t.status = "failed";
    }
    const empty: FutureRecord = {
      id: id("future"),
      simulation_id: simulationId,
      name: "Failed run",
      score: 0,
      risk: 1,
      confidence: 0,
      summary: message,
    };
    return {
      futures: [empty],
      best: empty,
      recommendation: message,
      risks: [message],
      confidence: 0,
      tasks,
      timeline: [],
      category: "error",
      thesis: message,
      plannerTaskTitles: [],
    };
  }

  private buildPlannerPrompt(input: SimulationEngineInput, objective: string): string {
    const goal = input.goal?.title ?? objective;
    const knowledge = input.knowledge.map((k) => k.title).slice(0, 12).join("; ");
    const constraints = input.constraints.map((c) => c.text).join("; ");
    return [
      `Goal: ${goal}`,
      `Objective: ${objective}`,
      knowledge ? `Knowledge: ${knowledge}` : "",
      constraints ? `Constraints: ${constraints}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  private buildCorpus(input: SimulationEngineInput, objective: string): string {
    return [
      input.goal?.title,
      input.goal?.description,
      objective,
      ...input.knowledge.map((k) => `${k.type}: ${k.title}\n${k.content.slice(0, 400)}`),
      ...input.notes.map((n) => `note: ${n.title}\n${n.content.slice(0, 400)}`),
      ...input.constraints.map((c) => `constraint(${c.kind}): ${c.text}`),
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  /** Ensure we always surface 5 futures for the product contract. */
  private expandToFive(best: Path, alternatives: Path[], corpus: string): Path[] {
    const pool = [best, ...alternatives];
    const seed = hash(corpus);
    const fillers: Path[] = [
      {
        id: `fill-${seed.toString(16)}-1`,
        name: "Conservative hold",
        thesis: "Preserve optionality; delay irreversible commitments.",
        milestones: best.milestones,
        arr: best.arr * 0.7,
        probability: Math.max(0.05, best.probability * 0.75),
        monthsToPmf: best.monthsToPmf + 3,
        cac: best.cac,
        ltv: best.ltv * 0.85,
        burn: best.burn * 0.8,
        highlights: ["Lower burn", "Slower growth"],
        risks: ["Missed window", "Competitor fills gap"],
      },
      {
        id: `fill-${seed.toString(16)}-2`,
        name: "Aggressive scale",
        thesis: "Concentrate resources on the highest-leverage channel now.",
        milestones: best.milestones,
        arr: best.arr * 1.35,
        probability: Math.max(0.04, best.probability * 0.65),
        monthsToPmf: Math.max(3, best.monthsToPmf - 2),
        cac: best.cac * 1.2,
        ltv: best.ltv * 1.1,
        burn: best.burn * 1.4,
        highlights: ["Speed", "Category capture"],
        risks: ["Capital intensity", "Execution overload"],
      },
      {
        id: `fill-${seed.toString(16)}-3`,
        name: "Partner-led path",
        thesis: "Use distribution partners to de-risk go-to-market.",
        milestones: best.milestones,
        arr: best.arr * 0.95,
        probability: Math.max(0.06, best.probability * 0.85),
        monthsToPmf: best.monthsToPmf + 1,
        cac: best.cac * 0.7,
        ltv: best.ltv,
        burn: best.burn * 0.9,
        highlights: ["Distribution leverage"],
        risks: ["Partner dependence", "Margin share"],
      },
    ];

    const seen = new Set<string>();
    const out: Path[] = [];
    for (const p of [...pool, ...fillers]) {
      if (seen.has(p.name)) continue;
      seen.add(p.name);
      out.push(p);
      if (out.length >= 5) break;
    }
    return out;
  }

  private evaluatePath(
    path: Path,
    index: number,
    input: SimulationEngineInput,
    objective: string
  ): FutureRecord {
    const knowledgeItems = input.knowledge ?? [];
    const noteItems = input.notes ?? [];
    const constraintItems = input.constraints ?? [];
    const thesis = path.thesis ?? "";
    const name = path.name ?? "Future";
    const probability = typeof path.probability === "number" ? path.probability : 0.1;

    const knowledgeBoost = Math.min(0.12, knowledgeItems.length * 0.015 + noteItems.length * 0.01);
    const hardConstraints = constraintItems.filter((c) => c.kind === "hard");
    const softConstraints = constraintItems.filter((c) => c.kind === "soft");

    let risk = clamp01(1 - probability + index * 0.04);
    let conf = clamp01(probability + knowledgeBoost - index * 0.02);
    let score = clamp01(probability * 0.7 + conf * 0.3);

    const haystack = `${name} ${thesis} ${objective}`.toLowerCase();

    for (const c of softConstraints) {
      const token = c.text.toLowerCase().slice(0, 24);
      if (token && !haystack.includes(token)) {
        score = clamp01(score - 0.04);
        conf = clamp01(conf - 0.03);
      }
    }

    for (const c of hardConstraints) {
      const text = c.text.toLowerCase();
      const aggressive = /scale|raise|launch|aggressive|fast/i.test(`${name} ${thesis}`);
      if (/(budget|runway|cash|capital)/i.test(text) && aggressive) {
        risk = clamp01(risk + 0.12);
        score = clamp01(score - 0.08);
      }
      if (/(compliance|hipaa|security|legal)/i.test(text) && aggressive) {
        risk = clamp01(risk + 0.1);
        conf = clamp01(conf - 0.05);
      }
      if (
        /(no raise|bootstrap|no funding)/i.test(text) &&
        /fund|raise|series/i.test(`${name} ${thesis}`)
      ) {
        risk = clamp01(risk + 0.2);
        score = clamp01(score - 0.15);
        conf = clamp01(conf - 0.1);
      }
    }

    const titleCorpus = knowledgeItems.map((item) => item.title.toLowerCase()).join(" ");
    if (
      titleCorpus &&
      name
        .toLowerCase()
        .split(/\s+/)
        .some((word) => word.length > 4 && titleCorpus.includes(word))
    ) {
      score = clamp01(score + 0.03);
      conf = clamp01(conf + 0.02);
    }

    return {
      id: path.id || id("future"),
      simulation_id: input.simulationId,
      name,
      score: Math.round(score * 1000) / 1000,
      risk: Math.round(risk * 1000) / 1000,
      confidence: Math.round(conf * 1000) / 1000,
      summary: thesis,
    };
  }

  private collectRisks(
    best: FutureRecord,
    bestPath: Path,
    constraints: readonly SimulationConstraint[]
  ): string[] {
    const risks = [...(bestPath.risks ?? [])];
    if (best.risk >= 0.55) risks.push("Elevated execution risk relative to confidence.");
    for (const c of constraints.filter((x) => x.kind === "hard")) {
      risks.push(`Hard constraint in force: ${c.text}`);
    }
    // unique, max 6
    return [...new Set(risks)].slice(0, 6);
  }

  private buildRecommendation(
    best: FutureRecord,
    input: SimulationEngineInput,
    risks: string[]
  ): string {
    const goal = input.goal?.title ?? input.objective;
    const riskNote = risks[0] ? ` Watch: ${risks[0]}` : "";
    return `Best path for “${goal}”: ${best.name}. ${best.summary}${riskNote}`;
  }

  private buildTimeline(
    simulationId: string,
    objective: string,
    futures: FutureRecord[],
    plannerTasks: string[]
  ): TimelineNodeRecord[] {
    const rootId = id("node");
    const nodes: TimelineNodeRecord[] = [
      {
        id: rootId,
        simulation_id: simulationId,
        parent_id: null,
        title: `Objective: ${objective}`,
        depth: 0,
        score: 1,
      },
    ];
    let parent = rootId;
    for (const [index, title] of plannerTasks.slice(0, 4).entries()) {
      const nodeId = id("node");
      nodes.push({
        id: nodeId,
        simulation_id: simulationId,
        parent_id: parent,
        title: `Plan: ${title}`,
        depth: index + 1,
        score: 1 - index * 0.05,
      });
      parent = nodeId;
    }
    for (const [index, future] of futures.entries()) {
      nodes.push({
        id: id("node"),
        simulation_id: simulationId,
        parent_id: rootId,
        title: `${index === 0 ? "★ " : ""}${future.name}`,
        depth: 1,
        score: future.score,
      });
    }
    return nodes;
  }
}

export const simulationEngine = new SimulationEngine();
