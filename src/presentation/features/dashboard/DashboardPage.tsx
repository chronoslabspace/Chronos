import { useWorkspace } from "../workspace/WorkspaceContext";
import { DashboardHeader } from "./components/DashboardHeader";
import { KnowledgeSummary } from "./components/KnowledgeSummary";
import { MvpProgress } from "./components/MvpProgress";
import { QuickActions } from "./components/QuickActions";
import { RecentSimulations } from "./components/RecentSimulations";
import { TimelinePreview } from "./components/TimelinePreview";

/**
 * Workspace HQ — progressive MVP path.
 * Each phase stays usable: navigate → persist → context → simulate → see futures → accumulate.
 */
export function DashboardPage() {
  const { home, ownerId } = useWorkspace();
  if (!home?.goal) return null;

  const latest = home.recentSimulations[0] ?? null;

  return (
    <div className="space-y-10">
      <DashboardHeader
        workspace={home.workspace}
        goal={home.goal}
        userLabel={ownerId ? ownerId.slice(0, 8) : "You"}
      />
      <MvpProgress home={home} />
      <QuickActions />
      <RecentSimulations simulations={home.recentSimulations} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <KnowledgeSummary knowledge={home.knowledge} notes={home.notes} />
        <TimelinePreview latest={latest} />
      </div>
    </div>
  );
}
