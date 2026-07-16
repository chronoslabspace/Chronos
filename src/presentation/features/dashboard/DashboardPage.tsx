import { useWorkspace } from "../workspace/WorkspaceContext";
import { GoalCard } from "./components/GoalCard";
import { KnowledgeSummary } from "./components/KnowledgeSummary";
import { LatestSimulationCard } from "./components/LatestSimulationCard";
import { MvpProgress } from "./components/MvpProgress";
import { RecentSimulations } from "./components/RecentSimulations";
import { TimelinePreview } from "./components/TimelinePreview";
import { WorkspacePulse } from "./components/WorkspacePulse";

/**
 * Workspace HQ — tracks the decision you're working on.
 *
 * Pulse → Goal → Latest sim → Knowledge · Timeline → history
 */
export function DashboardPage() {
  const { home } = useWorkspace();
  if (!home?.goal) return null;

  const latest = home.recentSimulations[0] ?? null;
  const futures = latest ? (home.futuresBySimulation[latest.id] ?? []) : [];
  const goalConfidence = latest?.status === "completed" ? latest.confidence : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5 lg:max-w-none">
      {/* Live state first — not a greeting */}
      <WorkspacePulse home={home} />

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
