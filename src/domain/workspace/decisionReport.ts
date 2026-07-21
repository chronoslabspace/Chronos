import type {
  FutureRecord,
  GoalRecord,
  SimulationRecord,
  WorkspaceHome,
} from "./types";

/**
 * Decision Report — recommended path with why, risks, and next actions.
 * Built from a completed simulation (+ optional user-chosen future).
 */
export type DecisionReport = {
  decisionTitle: string;
  recommended: string;
  confidence: number; // 0–1
  why: string[];
  risks: string[];
  nextActions: string[];
  simulationId: string;
  chosenFutureId: string | null;
  engineBest: string | null;
};

export function buildDecisionReport(
  home: WorkspaceHome,
  simulation: SimulationRecord,
  futures: readonly FutureRecord[] = home.futuresBySimulation[simulation.id] ?? []
): DecisionReport {
  const goal = home.goal;
  const chosenId =
    typeof simulation.result.chosen_future_id === "string"
      ? simulation.result.chosen_future_id
      : null;
  const chosen =
    (chosenId ? futures.find((f) => f.id === chosenId) : null) ??
    futures[0] ??
    null;

  const recommended =
    (typeof simulation.result.chosen_future_name === "string" &&
      simulation.result.chosen_future_name) ||
    chosen?.name ||
    (typeof simulation.result.best_future === "string" && simulation.result.best_future) ||
    "—";

  const confidence =
    chosen?.confidence ??
    (simulation.confidence != null ? simulation.confidence : 0);

  const risks = resolveRisks(simulation, chosen);
  const why = deriveWhyReasons(simulation, chosen, goal, home);
  const nextActions = deriveNextActions(simulation, chosen, risks);

  return {
    decisionTitle: goal?.title?.trim() || simulation.title,
    recommended,
    confidence: Math.max(0, Math.min(1, confidence)),
    why,
    risks,
    nextActions,
    simulationId: simulation.id,
    chosenFutureId: chosenId,
    engineBest:
      typeof simulation.result.best_future === "string"
        ? simulation.result.best_future
        : futures[0]?.name ?? null,
  };
}

export function deriveWhyReasons(
  simulation: SimulationRecord,
  chosen: FutureRecord | null,
  goal: GoalRecord | null,
  home?: WorkspaceHome
): string[] {
  const reasons: string[] = [];

  if (typeof simulation.result.recommendation === "string" && simulation.result.recommendation) {
    reasons.push(simulation.result.recommendation.trim());
  } else if (typeof simulation.result.thesis === "string" && simulation.result.thesis) {
    reasons.push(String(simulation.result.thesis).trim());
  }

  if (chosen?.summary) {
    reasons.push(chosen.summary.trim());
  }

  if (chosen) {
    reasons.push(
      `Score ${(chosen.score * 100).toFixed(0)}% with risk ${(chosen.risk * 100).toFixed(0)}%`
    );
  }

  if (goal?.title) {
    reasons.push(`Aligned to goal: ${goal.title}`);
  }

  const knowledgeCount = home ? home.knowledge.length + home.notes.length : 0;
  if (knowledgeCount > 0) {
    reasons.push(`Grounded in ${knowledgeCount} knowledge source${knowledgeCount === 1 ? "" : "s"}`);
  }

  if (simulation.result.chosen_future_id) {
    reasons.push("Path explicitly chosen and saved in this workspace");
  } else if (reasons.length === 0) {
    reasons.push("Engine-ranked top future for this objective");
  }

  // Deduplicate while preserving order
  const seen = new Set<string>();
  return reasons
    .map((r) => r.trim())
    .filter((r) => {
      if (!r || seen.has(r)) return false;
      seen.add(r);
      return true;
    })
    .slice(0, 6);
}

function resolveRisks(
  simulation: SimulationRecord,
  chosen: FutureRecord | null
): string[] {
  const fromResult = Array.isArray(simulation.result.risks)
    ? (simulation.result.risks as string[]).filter(Boolean)
    : [];
  if (fromResult.length) return fromResult.slice(0, 6);

  const risks: string[] = [];
  if (chosen && chosen.risk >= 0.55) {
    risks.push("Elevated path risk — assign owners before committing");
  }
  if (chosen && chosen.confidence < 0.55) {
    risks.push("Confidence below 55% — gather more evidence");
  }
  if (!risks.length) {
    risks.push("Monitor execution assumptions as the path progresses");
  }
  return risks;
}

function deriveNextActions(
  simulation: SimulationRecord,
  chosen: FutureRecord | null,
  risks: string[]
): string[] {
  const actions: string[] = [];
  const name = chosen?.name ?? String(simulation.result.best_future ?? "the recommended path");

  if (!simulation.result.chosen_future_id) {
    actions.push(`Choose and save “${name}” as the committed path`);
  } else {
    actions.push(`Execute on “${name}” and log outcomes into knowledge`);
  }

  if (risks[0]) {
    actions.push(`Address risk: ${risks[0]}`);
  }

  actions.push("Re-run with tighter constraints if the landscape shifts");
  actions.push("Capture a working note with decision rationale");

  return actions.slice(0, 5);
}

/** Markdown export for sharing / archival. */
export function exportDecisionReportMarkdown(report: DecisionReport): string {
  const conf = `${Math.round(report.confidence * 100)}%`;
  const lines = [
    `# Decision Report`,
    ``,
    `**Decision:** ${report.decisionTitle}`,
    `**Recommended path:** ${report.recommended}`,
    `**Confidence:** ${conf}`,
    report.chosenFutureId ? `**Status:** Path saved` : `**Status:** Engine recommendation`,
    ``,
    `## Why`,
    ...report.why.map((w) => `- ${w}`),
    ``,
    `## Risks`,
    ...report.risks.map((r) => `- ${r}`),
    ``,
    `## Next actions`,
    ...report.nextActions.map((a, i) => `${i + 1}. ${a}`),
    ``,
    `---`,
    `Simulation: ${report.simulationId}`,
  ];
  return lines.join("\n");
}
