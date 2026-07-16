import { Link } from "react-router-dom";
import { evaluateMvpGates, nextMvpGate } from "../../../../domain/workspace/mvpGates";
import type { WorkspaceHome } from "../../../../domain/workspace/types";

/**
 * Slim progress rail — progressive usable value, not a full OS checklist.
 */
export function MvpProgress({ home }: { home: WorkspaceHome }) {
  const gates = evaluateMvpGates(home);
  const next = nextMvpGate(home);
  const doneCount = gates.filter((g) => g.done).length;

  if (!next && doneCount === gates.length) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-chronos/25 bg-chronos/5 px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-chronos">
          Core loop validated
        </span>
        <span className="text-xs text-ink-dim">
          {doneCount}/{gates.length} gates · keep accumulating decisions
        </span>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-line px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          Path · {doneCount}/{gates.length}
        </div>
        {next ? (
          <Link to={next.href} className="text-sm text-chronos hover:text-ink">
            Next: {next.cta} →
          </Link>
        ) : null}
      </div>
      <ol className="mt-3 flex flex-wrap gap-1.5">
        {gates.map((gate) => (
          <li key={gate.id}>
            <Link
              to={gate.href}
              title={gate.usableWhen}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition ${
                gate.done
                  ? "bg-chronos/15 text-chronos"
                  : next?.id === gate.id
                    ? "border border-chronos/40 text-ink"
                    : "border border-line text-ink-faint"
              }`}
            >
              <span>{gate.done ? "✓" : gate.phase}</span>
              <span>{gate.label}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
