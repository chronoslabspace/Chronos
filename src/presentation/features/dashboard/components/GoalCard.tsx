import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../../../domain/workspace/pulse";
import type { GoalRecord } from "../../../../domain/workspace/types";

/** Demoted goal context — does not compete with Recommendation hero. */
export function GoalCard({ goal }: { goal: GoalRecord }) {
  return (
    <section
      data-testid="goal-card"
      className="rounded-2xl border border-line bg-bg-soft/15 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          Current goal
        </div>
        <Link
          to="/workspace"
          className="font-mono text-[10px] uppercase text-chronos opacity-80 hover:opacity-100"
        >
          Edit goal
        </Link>
      </div>
      <h2 className="mt-2 font-serif text-lg text-ink sm:text-xl">{goal.title}</h2>
      {goal.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-ink-dim">{goal.description}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] uppercase text-ink-faint">
          {goal.status === "active" ? "On track" : goal.status}
        </span>
        <span className="font-mono text-[10px] uppercase text-ink-faint">
          Updated {formatRelativeTime(goal.created_at)}
        </span>
      </div>
    </section>
  );
}
