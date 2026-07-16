import { Link } from "react-router-dom";
import { confidencePercent, formatCreatedAt } from "../../../../domain/workspace/seed";
import type { SimulationRecord } from "../../../../domain/workspace/types";

type Props = {
  simulation: SimulationRecord | null;
};

/** Spotlight the latest run: best future + confidence. */
export function LatestSimulationCard({ simulation }: Props) {
  if (!simulation) {
    return (
      <section className="rounded-2xl border border-dashed border-line p-5 sm:p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Latest simulation
        </div>
        <p className="mt-3 text-sm text-ink-dim">
          No runs yet. Start with a simulation to rank futures against your goal.
        </p>
        <Link
          to="/workspace/simulations?new=1"
          className="mt-4 inline-flex font-mono text-[11px] uppercase tracking-[0.16em] text-chronos hover:text-ink"
        >
          Run first simulation →
        </Link>
      </section>
    );
  }

  const bestFuture =
    (typeof simulation.result.chosen_future_name === "string" &&
      simulation.result.chosen_future_name) ||
    (typeof simulation.result.best_future === "string" && simulation.result.best_future) ||
    "—";
  const chosen = Boolean(simulation.result.chosen_future_id);
  const version = simulation.version > 1 ? ` · v${simulation.version}` : "";

  return (
    <section className="rounded-2xl border border-line p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Latest simulation
          </div>
          <h2 className="mt-2 text-lg text-ink">{simulation.title}</h2>
          <p className="mt-1 text-xs text-ink-faint">
            {formatCreatedAt(simulation.created_at)}
            {version}
            {" · "}
            <span className="capitalize">{simulation.status}</span>
          </p>
        </div>
        <Link
          to={`/workspace/simulations/${simulation.id}`}
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-chronos hover:text-ink"
        >
          Open →
        </Link>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg-soft/20 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            {chosen ? "Chosen path" : "Best future"}
          </div>
          <div className="mt-1.5 font-serif text-xl text-ink">{bestFuture}</div>
        </div>
        <div className="rounded-xl border border-line bg-bg-soft/20 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            Confidence
          </div>
          <div className="mt-1.5 font-mono text-2xl text-chronos">
            {confidencePercent(simulation.confidence)}
          </div>
        </div>
      </div>

      {typeof simulation.result.recommendation === "string" && simulation.result.recommendation && (
        <p className="mt-4 line-clamp-2 text-sm text-ink-dim">{simulation.result.recommendation}</p>
      )}
    </section>
  );
}
