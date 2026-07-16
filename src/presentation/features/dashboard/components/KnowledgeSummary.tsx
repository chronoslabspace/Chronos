import { Link } from "react-router-dom";
import { knowledgeCounts } from "../../../../domain/workspace/seed";
import type { KnowledgeRecord, NoteRecord } from "../../../../domain/workspace/types";

type Props = {
  knowledge: readonly KnowledgeRecord[];
  notes: readonly NoteRecord[];
};

/** Documents · Notes · URLs — compact library snapshot. */
export function KnowledgeSummary({ knowledge, notes }: Props) {
  const counts = knowledgeCounts(knowledge);
  const noteCount = Math.max(notes.length, counts.notes);
  const total = counts.documents + noteCount + counts.urls;

  return (
    <section className="rounded-2xl border border-line p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          Knowledge
        </div>
        <Link
          to="/workspace/knowledge"
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-chronos hover:text-ink"
        >
          Library →
        </Link>
      </div>

      {total === 0 ? (
        <p className="mt-3 text-sm text-ink-dim">
          Add docs, notes, or URLs so simulations have context.
        </p>
      ) : (
        <p className="mt-3 text-sm text-ink">
          <span className="font-mono text-chronos">{counts.documents}</span> Docs
          <span className="mx-2 text-ink-faint">·</span>
          <span className="font-mono text-chronos">{noteCount}</span> Notes
          <span className="mx-2 text-ink-faint">·</span>
          <span className="font-mono text-chronos">{counts.urls}</span> URLs
        </p>
      )}

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat label="Docs" value={counts.documents} />
        <Stat label="Notes" value={noteCount} />
        <Stat label="URLs" value={counts.urls} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          to="/workspace/knowledge?upload=1"
          className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-dim transition hover:border-chronos/40 hover:text-chronos"
        >
          + Upload
        </Link>
        <Link
          to="/workspace/knowledge?import=url"
          className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-dim transition hover:border-chronos/40 hover:text-chronos"
        >
          + URL
        </Link>
        <Link
          to="/workspace/notes?new=1"
          className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-dim transition hover:border-chronos/40 hover:text-chronos"
        >
          + Note
        </Link>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-bg-soft/15 px-3 py-3 text-center">
      <div className="font-serif text-2xl text-ink">{value}</div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </div>
    </div>
  );
}
