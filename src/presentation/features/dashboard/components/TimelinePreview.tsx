import { Link } from "react-router-dom";
import { decisionHistoryPreview } from "../../../../domain/workspace/decisionHistory";
import { formatRelativeTime } from "../../../../domain/workspace/pulse";
import type { WorkspaceHome } from "../../../../domain/workspace/types";

/** HQ recent decision events — same model as Timeline page. */
export function TimelinePreview({ home }: { home: WorkspaceHome }) {
  const events = decisionHistoryPreview(home, 5);
  return (
    <section
      data-testid="decision-timeline-preview"
      className="rounded-2xl border border-line p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          Recent timeline
        </div>
        <Link
          to="/workspace/timeline"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-chronos"
        >
          View Timeline →
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="mt-4 text-sm text-ink-dim">No decision events yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {events.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-ink">• {e.label}</span>
              <span className="shrink-0 font-mono text-[10px] uppercase text-ink-faint">
                {formatRelativeTime(e.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
