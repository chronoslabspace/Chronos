import { Link } from "react-router-dom";
import {
  computeWorkspacePulse,
  formatRelativeTime,
  type WorkspacePulse as Pulse,
} from "../../../../domain/workspace/pulse";
import type { WorkspaceHome } from "../../../../domain/workspace/types";

type Props = {
  home: WorkspaceHome;
};

/**
 * Workspace Pulse — actively tracks decision state.
 * Not a greeting. Not “what do you want to ask AI?”
 */
export function WorkspacePulse({ home }: Props) {
  const pulse = computeWorkspacePulse(home);
  return <WorkspacePulseView pulse={pulse} />;
}

export function WorkspacePulseView({ pulse }: { pulse: Pulse }) {
  return (
    <section
      className="rounded-2xl border border-chronos/30 bg-gradient-to-br from-chronos/10 via-bg-soft/20 to-bg p-5 sm:p-6"
      aria-label="Workspace pulse"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-chronos">
            Workspace pulse
          </div>
          <p className="mt-2 max-w-xl text-sm text-ink-dim">
            Decision in focus:{" "}
            <span className="text-ink">{pulse.decisionTitle}</span>
          </p>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          Updated {formatRelativeTime(pulse.lastUpdatedAt)}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          label="Knowledge coverage"
          value={`${pulse.knowledgeCoverage}%`}
          tone={toneForPercent(pulse.knowledgeCoverage)}
        />
        <Metric
          label="Simulation confidence"
          value={`${pulse.simulationConfidence}%`}
          tone={toneForPercent(pulse.simulationConfidence)}
        />
        <Metric
          label="Open tasks"
          value={String(pulse.openTasks)}
          tone={pulse.openTasks === 0 ? "good" : pulse.openTasks <= 3 ? "mid" : "low"}
        />
        <Metric
          label="Last updated"
          value={formatRelativeTime(pulse.lastUpdatedAt)}
          tone="neutral"
          compact
        />
      </dl>

      <div className="mt-6 rounded-xl border border-line bg-bg/60 px-4 py-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          Recommendation
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">{pulse.recommendation}</p>
        <Link
          to={pulse.recommendationHref}
          className="mt-3 inline-flex font-mono text-[11px] uppercase tracking-[0.16em] text-chronos transition hover:text-ink"
        >
          Continue →
        </Link>
      </div>
    </section>
  );
}

function toneForPercent(pct: number): "good" | "mid" | "low" | "neutral" {
  if (pct >= 75) return "good";
  if (pct >= 40) return "mid";
  if (pct > 0) return "low";
  return "neutral";
}

function Metric({
  label,
  value,
  tone,
  compact = false,
}: {
  label: string;
  value: string;
  tone: "good" | "mid" | "low" | "neutral";
  compact?: boolean;
}) {
  const valueClass =
    tone === "good"
      ? "text-chronos"
      : tone === "mid"
        ? "text-ink"
        : tone === "low"
          ? "text-accent-2"
          : "text-ink-dim";

  return (
    <div className="rounded-xl border border-line bg-bg/50 px-3 py-3 sm:px-4">
      <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">{label}</dt>
      <dd
        className={`mt-1.5 font-mono tabular-nums ${compact ? "text-sm leading-snug" : "text-2xl"} ${valueClass}`}
      >
        {value}
      </dd>
    </div>
  );
}
