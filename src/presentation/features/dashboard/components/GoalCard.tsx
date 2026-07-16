import { Link } from "react-router-dom";
import { confidencePercent } from "../../../../domain/workspace/seed";
import type { GoalRecord } from "../../../../domain/workspace/types";

type Props = {
  goal: GoalRecord;
  /** Confidence from latest completed simulation (0–1), if any. */
  confidence: number | null;
};

/** Decision in focus — not a prompt box. */
export function GoalCard({ goal, confidence }: Props) {
  return (
    <section className="rounded-2xl border border-line bg-bg-soft/20 p-5 sm:p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        Decision in focus
      </div>
      <h1 className="mt-3 font-serif text-2xl leading-tight text-ink sm:text-3xl">{goal.title}</h1>
      {goal.description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-dim">{goal.description}</p>
      ) : (
        <p className="mt-2 text-sm text-ink-dim">
          What decision are you working on? Simulate paths against this goal.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Confidence
          </span>
          <span className="font-mono text-sm text-chronos">{confidencePercent(confidence)}</span>
        </div>
        <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {goal.status}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/workspace/simulations?new=1"
          className="inline-flex items-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition hover:bg-chronos"
        >
          Run Simulation
        </Link>
        <Link
          to="/workspace/advisor"
          className="inline-flex items-center rounded-full border border-line px-4 py-2.5 text-sm text-ink-dim transition hover:border-chronos/40 hover:text-chronos"
        >
          Stress-test with Grok
        </Link>
      </div>
    </section>
  );
}
