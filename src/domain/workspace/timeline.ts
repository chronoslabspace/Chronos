import type { FutureRecord } from "./types";

const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

export function futureCardLabel(index: number): string {
  return LABELS[index] ?? String(index + 1);
}

/** Lightweight next-step prompts for a selected future card. */
export function deriveNextSteps(future: FutureRecord, isBest: boolean): string[] {
  const steps: string[] = [];

  if (isBest) {
    steps.push(`Adopt “${future.name}” as the primary recommendation`);
  } else {
    steps.push(`Compare “${future.name}” against the starred best path`);
  }

  if (future.risk >= 0.55) {
    steps.push("Name owners for the top risks before committing");
  } else if (future.confidence >= 0.7) {
    steps.push("Draft a 30-day execution checklist for this path");
  } else {
    steps.push("Gather more knowledge to raise confidence on this path");
  }

  steps.push("Log a workspace note with the decision and why");

  // Keep summary-aware flavor without over-parsing
  const thesis = future.summary.trim();
  if (thesis) {
    const short = thesis.length > 90 ? `${thesis.slice(0, 87)}…` : thesis;
    steps.push(`Validate thesis: ${short}`);
  }

  return steps.slice(0, 4);
}

export const TIMELINE_LATER_FEATURES = [
  { id: "tree", label: "Tree" },
  { id: "branches", label: "Branches" },
  { id: "merge", label: "Merge" },
  { id: "collapse", label: "Collapse" },
  { id: "compare", label: "Compare" },
] as const;
