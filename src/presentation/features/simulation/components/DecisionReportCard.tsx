import { Link } from "react-router-dom";
import {
  exportDecisionReportMarkdown,
  type DecisionReport,
} from "../../../../domain/workspace/decisionReport";
import { confidencePercent } from "../../../../domain/workspace/seed";

type Props = {
  report: DecisionReport;
  compact?: boolean;
  href?: string;
};

/** Screenshot-ready Decision Report. */
export function DecisionReportCard({ report, compact, href }: Props) {
  const conf = confidencePercent(report.confidence);

  const copy = async () => {
    const md = exportDecisionReportMarkdown(report);
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      /* ignore */
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-chronos/40 bg-bg">
      <div className="border-b border-line bg-chronos/10 px-5 py-3 sm:px-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-chronos">
          Decision report
        </div>
      </div>
      <div className="divide-y divide-line">
        <section className="px-5 py-6 sm:px-6">
          <div className="font-mono text-[10px] uppercase text-ink-faint">Recommended decision</div>
          <h2 className={`mt-3 font-serif text-ink ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}>
            {report.recommended}
          </h2>
          <div className="mt-5">
            <div className="font-mono text-[10px] uppercase text-ink-faint">Confidence</div>
            <div className="mt-1 font-mono text-4xl text-chronos sm:text-5xl">{conf}</div>
          </div>
          {!compact && (
            <p className="mt-3 text-sm text-ink-dim">
              Against: <span className="text-ink">{report.decisionTitle}</span>
            </p>
          )}
        </section>
        <section className="px-5 py-5 sm:px-6">
          <div className="font-mono text-[10px] uppercase text-ink-faint">Why?</div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {report.why.map((w) => (
              <li key={w} className="rounded-xl border border-line px-4 py-3 text-[15px] text-ink">
                {w}
              </li>
            ))}
          </ul>
        </section>
        <section className="px-5 py-5 sm:px-6">
          <div className="font-mono text-[10px] uppercase text-ink-faint">Risks</div>
          <ul className="mt-4 space-y-2">
            {(report.risks.length ? report.risks : ["No major risks flagged."]).map((r) => (
              <li key={r} className="flex gap-3 text-[15px] text-ink-dim">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2" />
                {r}
              </li>
            ))}
          </ul>
        </section>
        <section className="px-5 py-5 sm:px-6">
          <div className="font-mono text-[10px] uppercase text-ink-faint">Next actions</div>
          <ul className="mt-4 space-y-2">
            {report.nextActions.map((a) => (
              <li key={a} className="flex gap-3 text-[15px] text-ink">
                <span className="text-chronos">•</span>
                {a}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:text-chronos"
        >
          Copy report
        </button>
        {href && (
          <Link to={href} className="ml-auto font-mono text-[11px] uppercase text-chronos">
            Full simulation →
          </Link>
        )}
      </div>
    </article>
  );
}
