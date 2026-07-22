import { useMemo } from "react";
import { Link } from "react-router-dom";
import { evaluateBetaChecklist } from "../../../domain/workspace/betaChecklist";
import { buildDecisionReport } from "../../../domain/workspace/decisionReport";
import { useWorkspace } from "../workspace/WorkspaceContext";
import { DecisionReportCard } from "../simulation/components/DecisionReportCard";
import { BetaChecklist } from "./components/BetaChecklist";
import { GoalCard } from "./components/GoalCard";
import { KnowledgeSummary } from "./components/KnowledgeSummary";
import { TimelinePreview } from "./components/TimelinePreview";
import { WorkspacePulse } from "./components/WorkspacePulse";

/**
 * Decision Workspace HQ — quiet product identity.
 *
 *   Workspace Pulse
 *        ↓
 *   Current Goal
 *        ↓
 *   Decision Report (the keepable artifact)
 *        ↓
 *   Knowledge · Timeline
 *        ↓
 *   Next action
 *
 * No statistics walls. No widget noise.
 */
export function DashboardPage() {
  const { home, preferences } = useWorkspace();
  if (!home?.goal) return null;

  const latest = home.recentSimulations[0] ?? null;
  const futures = latest ? (home.futuresBySimulation[latest.id] ?? []) : [];
  const goalConfidence = latest?.status === "completed" ? latest.confidence : null;

  const decisionReport = useMemo(() => {
    if (!latest || latest.status !== "completed") return null;
    return buildDecisionReport(home, latest, futures);
  }, [home, latest, futures]);

  const checklist = useMemo(
    () => evaluateBetaChecklist(home, preferences),
    [home, preferences]
  );
  const checklistOpen = checklist.some((item) => !item.done && !item.optional);
  const nextAction =
    decisionReport?.nextActions[0] ??
    (latest
      ? "Open the latest decision report and save a path"
      : "Run a simulation to produce a decision report");

  const nextHref = latest
    ? `/workspace/simulations/${latest.id}`
    : "/workspace/simulations?new=1";

  return (
    <div className="ws-cascade mx-auto max-w-3xl space-y-6 lg:max-w-3xl">
      <header className="header-enter border-b border-line pb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          {home.workspace.name}
        </div>
        <h1 className="mt-2 font-serif text-3xl text-ink">Decision workspace</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-dim">
          Simulate futures → decide → keep the report. Everything else is supporting context.
        </p>
      </header>

      {/* 1 · Pulse */}
      <WorkspacePulse home={home} />

      {checklistOpen && <BetaChecklist items={checklist} />}

      {/* 2 · Current goal */}
      <GoalCard goal={home.goal} confidence={goalConfidence} />

      {/* 3 · Decision Report — product centerpiece */}
      {decisionReport && latest ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-chronos">
                Decision report
              </div>
              <p className="mt-1 text-sm text-ink-dim">
                The artifact from your latest simulation — copy, download, or reopen anytime.
              </p>
            </div>
            <Link
              to={`/workspace/simulations/${latest.id}`}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-chronos"
            >
              Open full →
            </Link>
          </div>
          <DecisionReportCard
            report={decisionReport}
            href={`/workspace/simulations/${latest.id}`}
          />
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-chronos/40 bg-chronos/5 px-5 py-8 text-center sm:px-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-chronos">
            No decision report yet
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-dim">
            Run a simulation to produce a keepable report: goal, recommendation, confidence,
            evidence, trade-offs, risks, and next steps.
          </p>
          <Link
            to="/workspace/simulations?new=1"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-chronos"
          >
            Run simulation →
          </Link>
        </section>
      )}

      {/* 4 · Next action */}
      <section className="rounded-2xl border border-line bg-bg-soft/30 px-5 py-5 sm:px-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Next action
        </div>
        <p className="mt-3 text-[15px] text-ink">{nextAction}</p>
        <Link
          to={nextHref}
          className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-chronos"
        >
          Continue →
        </Link>
      </section>

      {/* 5 · Supporting context only */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <KnowledgeSummary knowledge={home.knowledge} notes={home.notes} />
        <TimelinePreview latest={latest} futures={futures} />
      </div>
    </div>
  );
}
