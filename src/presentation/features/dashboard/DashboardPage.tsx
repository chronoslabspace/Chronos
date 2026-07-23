import { useMemo } from "react";
import { evaluateBetaChecklist } from "../../../domain/workspace/betaChecklist";
import { useWorkspace } from "../workspace/WorkspaceContext";
import { BetaChecklist } from "./components/BetaChecklist";
import { DecisionCard } from "./components/DecisionCard";
import { GoalCard } from "./components/GoalCard";
import { KnowledgeSummary } from "./components/KnowledgeSummary";
import { RecentSimulations } from "./components/RecentSimulations";
import { TimelinePreview } from "./components/TimelinePreview";

/**
 * Decision Workspace HQ
 *
 *   Recommendation hero (deep-link only)
 *        ↓
 *   Goal · Knowledge (demoted)
 *        ↓
 *   Decision timeline preview
 *        ↓
 *   Recent simulations
 *
 * Full Decision Report lives on sim detail — not here.
 */
export function DashboardPage() {
  const { home, preferences } = useWorkspace();
  if (!home?.goal) return null;

  const checklist = useMemo(
    () => evaluateBetaChecklist(home, preferences),
    [home, preferences]
  );
  const checklistOpen = checklist.some((item) => !item.done && !item.optional);

  return (
    <div className="ws-cascade mx-auto max-w-3xl space-y-6 lg:max-w-3xl">
      <header className="header-enter border-b border-line pb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          {home.workspace.name}
        </div>
        <h1 className="mt-2 font-serif text-3xl text-ink">Decision workspace</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-dim">
          Current decision, recommendation, and next step — review before you commit.
        </p>
      </header>

      {/* 1 · Hero */}
      <DecisionCard home={home} />

      {checklistOpen && <BetaChecklist items={checklist} />}

      {/* 2 · Context row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GoalCard goal={home.goal} />
        <KnowledgeSummary knowledge={home.knowledge} notes={home.notes} />
      </div>

      {/* 3 · Decision timeline preview */}
      <TimelinePreview home={home} />

      {/* 4 · Recent simulations */}
      <RecentSimulations simulations={home.recentSimulations} />
    </div>
  );
}
