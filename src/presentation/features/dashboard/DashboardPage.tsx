import { useMemo } from "react";
import { buildDecisionReport } from "../../../domain/workspace/decisionReport";
import { useWorkspace } from "../workspace/WorkspaceContext";
import { DecisionReportCard } from "../simulation/components/DecisionReportCard";
import { GoalCard } from "./components/GoalCard";
import { KnowledgeSummary } from "./components/KnowledgeSummary";
import { LatestSimulationCard } from "./components/LatestSimulationCard";
import { MvpProgress } from "./components/MvpProgress";
import { RecentSimulations } from "./components/RecentSimulations";
import { TimelinePreview } from "./components/TimelinePreview";
import { WorkspacePulse } from "./components/WorkspacePulse";

/** Decision Workspace HQ — pulse, decision report, connected cards. */
export function DashboardPage() {
  const { home } = useWorkspace();
  if (!home?.goal) return null;

  const latest = home.recentSimulations[0] ?? null;
  const futures = latest ? (home.futuresBySimulation[latest.id] ?? []) : [];
  const goalConfidence = latest?.status === "completed" ? latest.confidence : null;

  const decisionReport = useMemo(() => {
    if (!latest || latest.status !== "completed") return null;
    return buildDecisionReport(home, latest, futures);
  }, [home, latest, futures]);

  return (
    <div className="mx-auto max-w-3xl space-y-5 lg:max-w-none">
      <header className="border-b border-line pb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          What am I working on?
        </div>
        <p className="mt-2 text-sm text-ink-dim">
          <span className="text-ink">{home.workspace.name}</span>
          <span className="mx-2 text-ink-faint">·</span>
          {decisionReport
            ? "Latest Decision Report below — the artifact you’ll screenshot."
            : "Run a simulation to get a Decision Report."}
        </p>
      </header>

      <WorkspacePulse home={home} />

      {decisionReport && latest && (
        <DecisionReportCard
          report={decisionReport}
          compact
          href={`/workspace/simulations/${latest.id}`}
        />
      )}

      <GoalCard goal={home.goal} confidence={goalConfidence} />
      <LatestSimulationCard simulation={latest} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <KnowledgeSummary knowledge={home.knowledge} notes={home.notes} />
        <TimelinePreview latest={latest} futures={futures} />
      </div>

      <RecentSimulations simulations={home.recentSimulations} />
      <MvpProgress home={home} />
    </div>
  );
}
