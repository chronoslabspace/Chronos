import { Link } from "react-router-dom";
import { confidencePercent, formatCreatedAt } from "../../../../domain/workspace/seed";
import type { SimulationRecord } from "../../../../domain/workspace/types";

type Props = {
  simulations: readonly SimulationRecord[];
  /** Skip the first (already shown as Latest). */
  skipLatest?: boolean;
};

/** Compact history under the latest spotlight. */
export function RecentSimulations({ simulations, skipLatest = true }: Props) {
  const list = skipLatest ? simulations.slice(1, 5) : simulations.slice(0, 4);

  if (simulations.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Recent runs
        </div>
        <Link
          to="/workspace/simulations"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-chronos hover:text-ink"
        >
          All →
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="mt-3 text-sm text-ink-dim">Only one run so far — re-run to build memory.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {list.map((sim) => (
            <li key={sim.id}>
              <Link
                to={`/workspace/simulations/${sim.id}`}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3 transition hover:bg-chronos/5"
              >
                <span className="min-w-0 truncate text-sm text-ink">{sim.title}</span>
                <span className="flex shrink-0 items-center gap-3 font-mono text-[11px]">
                  <span className="text-chronos">{confidencePercent(sim.confidence)}</span>
                  <span className="text-ink-faint">{formatCreatedAt(sim.created_at)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
