import { futureCardLabel } from "../../../../domain/workspace/timeline";
import { confidencePercent } from "../../../../domain/workspace/seed";
import type { FutureRecord } from "../../../../domain/workspace/types";

/** Multi-future comparison — Chronos moat (not a single recommendation). */
export function FutureComparison({
  futures,
  chosenFutureId = null,
  selectedId = null,
  onSelect,
}: {
  futures: readonly FutureRecord[];
  chosenFutureId?: string | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  if (!futures.length) {
    return (
      <section className="rounded-2xl border border-dashed border-line p-5">
        <div className="font-mono text-[10px] uppercase text-ink-faint">Future comparison</div>
        <p className="mt-3 text-sm text-ink-dim">No futures ranked yet.</p>
      </section>
    );
  }

  const maxConf = Math.max(...futures.map((f) => f.confidence), 0.01);

  return (
    <section className="rounded-2xl border border-chronos/35 bg-gradient-to-b from-chronos/10 to-bg p-5 sm:p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-chronos">
        Future comparison
      </div>
      <p className="mt-1 text-sm text-ink-dim">
        Ranked paths — not a single answer. Comparison is the product.
      </p>
      <ol className="mt-6 space-y-0">
        {futures.map((future, index) => {
          const confPct = Math.round(future.confidence * 100);
          const bar = Math.round((future.confidence / maxConf) * 100);
          const isBest = index === 0;
          const isChosen = future.id === chosenFutureId;
          const isSelected = future.id === selectedId;
          const row = (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase text-ink-faint">
                    Future {futureCardLabel(index)}
                    {isBest ? " ⭐" : ""}
                    {isChosen ? " · chosen" : ""}
                  </div>
                  <div className={`mt-1 truncate font-serif text-2xl ${isBest ? "text-ink" : "text-ink-dim"}`}>
                    {future.name}
                  </div>
                </div>
                <div className={`font-mono text-3xl tabular-nums ${isBest ? "text-chronos" : "text-ink-dim"}`}>
                  {confPct}%
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${bar}%`,
                    background: isBest ? "#60899b" : "rgba(96,137,155,0.45)",
                  }}
                />
              </div>
              <div className="mt-2 font-mono text-[11px] text-ink-faint">
                Risk {confidencePercent(future.risk)} · Score {future.score.toFixed(2)}
              </div>
            </>
          );
          return (
            <li key={future.id}>
              {index > 0 && <div className="my-3 border-t border-line" />}
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(future.id)}
                  className={`w-full rounded-xl px-3 py-3 text-left hover:bg-bg/60 ${
                    isSelected ? "bg-bg/50 ring-1 ring-chronos/40" : ""
                  }`}
                >
                  {row}
                </button>
              ) : (
                <div className="px-3 py-3">{row}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
