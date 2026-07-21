import { useEffect, useState } from "react";
import {
  deriveNextSteps,
  futureCardLabel,
} from "../../../domain/workspace/timeline";
import { confidencePercent } from "../../../domain/workspace/seed";
import type { FutureRecord } from "../../../domain/workspace/types";

type Props = {
  goalTitle: string;
  futures: readonly FutureRecord[];
  simulationRisks?: readonly string[];
  chosenFutureId?: string | null;
  onChoosePath?: (futureId: string) => Promise<void> | void;
};

export function FutureTimelineCards({
  goalTitle,
  futures,
  simulationRisks = [],
  chosenFutureId = null,
  onChoosePath,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    chosenFutureId ?? futures[0]?.id ?? null
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chosenFutureId && futures.some((f) => f.id === chosenFutureId)) {
      setSelectedId(chosenFutureId);
      return;
    }
    if (!futures.some((f) => f.id === selectedId)) {
      setSelectedId(futures[0]?.id ?? null);
    }
  }, [futures, selectedId, chosenFutureId]);

  const selected = futures.find((f) => f.id === selectedId) ?? null;
  const selectedIndex = selected ? futures.findIndex((f) => f.id === selected.id) : -1;
  const isBest = selectedIndex === 0;
  const isChosen = Boolean(selected && chosenFutureId === selected.id);

  if (futures.length === 0) {
    return (
      <section className="border border-line p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Timeline
        </div>
        <p className="mt-3 text-sm text-ink-dim">Run a simulation to see future cards.</p>
      </section>
    );
  }

  const handleChoose = async () => {
    if (!selected || !onChoosePath) return;
    setSaving(true);
    try {
      await onChoosePath(selected.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Compare futures
        </div>
        <p className="mt-1 text-sm text-ink-dim">Click a card, then choose the best path and save.</p>
      </div>

      <div className="rounded-2xl border border-line bg-bg-soft/30 px-4 py-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Goal</div>
        <div className="mt-1 font-serif text-2xl text-ink">{goalTitle}</div>
      </div>

      <div className="flex justify-center text-ink-faint" aria-hidden>
        ↓
      </div>

      <div className="space-y-3">
        {futures.map((future, index) => {
          const best = index === 0;
          const active = future.id === selectedId;
          const chosen = future.id === chosenFutureId;
          return (
            <button
              key={future.id}
              type="button"
              onClick={() => setSelectedId(future.id)}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                active ? "border-chronos/50 bg-chronos/10" : "border-line bg-bg hover:border-chronos/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    Future {futureCardLabel(index)}
                    {best ? " ⭐" : ""}
                    {chosen ? " · chosen" : ""}
                  </div>
                  <div className="mt-1 truncate text-[16px] text-ink">{future.name}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-dim">{future.summary}</p>
                </div>
                <div className="shrink-0 font-mono text-[11px] text-chronos">
                  {confidencePercent(future.confidence)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-2xl border border-line p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-chronos">
            Future {futureCardLabel(selectedIndex)}
            {isBest ? " ⭐" : ""}
            {isChosen ? " · your choice" : ""}
          </div>
          <div className="mt-2 font-serif text-xl text-ink">{selected.name}</div>
          <p className="mt-3 text-sm text-ink-dim">{selected.summary || "—"}</p>
          <div className="mt-4 flex flex-wrap gap-4 font-mono text-sm">
            <span className="text-chronos">Confidence {confidencePercent(selected.confidence)}</span>
            <span className="text-ink-dim">Risk {(selected.risk * 100).toFixed(0)}%</span>
          </div>
          {isBest && simulationRisks.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-ink-dim">
              {simulationRisks.slice(0, 4).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-ink-dim">
            {deriveNextSteps(selected, isBest).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          {onChoosePath && (
            <button
              type="button"
              disabled={saving || isChosen}
              onClick={() => void handleChoose()}
              className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg hover:bg-chronos disabled:opacity-50"
            >
              {isChosen ? "Path saved" : saving ? "Saving…" : "Choose this path · Save"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
