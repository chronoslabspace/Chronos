import { Link } from "react-router-dom";
import type { KnowledgeRecord, NoteRecord } from "../../../../domain/workspace/types";

/** Compact knowledge context — supporting weight only. */
export function KnowledgeSummary({
  knowledge,
  notes,
}: {
  knowledge: readonly KnowledgeRecord[];
  notes: readonly NoteRecord[];
}) {
  const total = knowledge.length + notes.length;
  return (
    <Link
      to="/workspace/knowledge"
      data-testid="knowledge-summary"
      className="block rounded-2xl border border-line bg-bg-soft/15 p-4 transition hover:border-chronos/40 sm:p-5"
    >
      <div className="flex justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          Knowledge
        </div>
        <span className="font-mono text-[10px] uppercase text-chronos">Library →</span>
      </div>
      <p className="mt-2 text-sm text-ink">
        <span className="font-mono text-xl text-chronos">{total}</span>
        <span className="ml-2 text-ink-dim">
          source{total === 1 ? "" : "s"} grounding simulations
        </span>
      </p>
      {total === 0 ? (
        <p className="mt-2 text-sm text-ink-dim">Add context to improve ranking.</p>
      ) : null}
    </Link>
  );
}
