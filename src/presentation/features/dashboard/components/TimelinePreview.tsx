import { Link } from "react-router-dom";
import { futureCardLabel } from "../../../../domain/workspace/timeline";
import { confidencePercent } from "../../../../domain/workspace/seed";
import type { FutureRecord, SimulationRecord } from "../../../../domain/workspace/types";

type Props = {
  latest: SimulationRecord | null;
  futures: readonly FutureRecord[];
};

/**
 * Visual future spine: ○────●────○────○
 * Active node = chosen path, else engine best (index 0).
 */
export function TimelinePreview({ latest, futures }: Props) {
  if (!latest || futures.length === 0) {
    return (
      <section className="rounded-2xl border border-line p-5 sm:p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Timeline preview
        </div>
        <p className="mt-3 text-sm text-ink-dim">Run a simulation to see future cards.</p>
        <div
          className="mt-6 flex items-center justify-center gap-0 text-ink-faint opacity-50"
          aria-hidden
        >
          {["○", "○", "○", "○"].map((n, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <span className="mx-1 h-px w-6 bg-line-strong sm:w-8" />}
              <span className="font-mono text-lg">{n}</span>
            </span>
          ))}
        </div>
      </section>
    );
  }

  const chosenId =
    typeof latest.result.chosen_future_id === "string"
      ? latest.result.chosen_future_id
      : null;
  const activeIndex = chosenId
    ? Math.max(
        0,
        futures.findIndex((f) => f.id === chosenId)
      )
    : 0;
  const active = futures[activeIndex] ?? futures[0];

  return (
    <section className="rounded-2xl border border-line p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Timeline preview
        </div>
        <Link
          to={`/workspace/simulations/${latest.id}`}
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-chronos hover:text-ink"
        >
          Open cards →
        </Link>
      </div>

      {/* Spine: ○────●────○────○ */}
      <div
        className="mt-8 flex items-center justify-center overflow-x-auto px-1"
        role="list"
        aria-label="Future paths"
      >
        {futures.map((future, index) => {
          const activeNode = index === activeIndex;
          return (
            <div key={future.id} className="flex items-center" role="listitem">
              {index > 0 && (
                <div
                  className={`mx-0.5 h-px w-5 sm:mx-1 sm:w-8 ${
                    activeNode || index - 1 === activeIndex
                      ? "bg-chronos/60"
                      : "bg-line-strong"
                  }`}
                  aria-hidden
                />
              )}
              <Link
                to={`/workspace/simulations/${latest.id}`}
                title={`${futureCardLabel(index)}: ${future.name}`}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-mono transition sm:h-9 sm:w-9 ${
                  activeNode
                    ? "border-chronos bg-chronos text-bg"
                    : "border-line text-ink-faint hover:border-chronos/50 hover:text-chronos"
                }`}
                aria-current={activeNode ? "true" : undefined}
              >
                {futureCardLabel(index)}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
          Future {futureCardLabel(activeIndex)}
          {activeIndex === 0 && !chosenId ? " · engine" : ""}
          {chosenId ? " · chosen" : ""}
        </div>
        <div className="mt-1 font-serif text-xl text-ink">{active.name}</div>
        <div className="mt-1 font-mono text-sm text-chronos">
          {confidencePercent(active.confidence)}
        </div>
      </div>
    </section>
  );
}
