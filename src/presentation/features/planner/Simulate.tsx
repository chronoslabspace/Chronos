import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { formatCurrency, formatPercent } from "../../../domain/chronos/startup-sim";
import type { SimulationResult, Path, Milestone } from "../../../domain/chronos/startup-sim";
import {
  createPublicStartupRequest,
  publicStartupSimulator,
} from "../../../application/planner/publicStartupSimulator";

const EXAMPLES = [
  "AI meeting assistant that summarizes and assigns action items",
  "Developer tooling for evaluating LLM applications",
  "Consumer wellness app with AI coaching",
  "Vertical SaaS for dental practices",
  "Marketplace connecting indie contractors with startups",
];

type Stage = "idle" | "simulating" | "results";

export function Simulate() {
  const [stage, setStage] = useState<Stage>("idle");
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [resultSource, setResultSource] = useState<"cache" | "computed" | null>(null);
  const [progress, setProgress] = useState(0);
  const [branchCounter, setBranchCounter] = useState(0);
  const [branchLog, setBranchLog] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    startSimulation(idea.trim());
  };

  const startSimulation = (ideaText: string) => {
    setStage("simulating");
    setProgress(0);
    setBranchCounter(0);
    setBranchLog([]);
    setResultSource(null);

    // Start cache lookup/computation immediately while the temporal runtime UI animates.
    const simulationPromise = publicStartupSimulator.run(
      createPublicStartupRequest(ideaText)
    );

    // Animate progress over ~2.4s
    const duration = 2400;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      setBranchCounter(Math.floor(p * 1000));

      // Add a log entry every ~60ms.
      if (Math.random() < 0.08) {
        const id = `0x${Math.floor(Math.random() * 65536).toString(16).padStart(4, "0")}`;
        const score = (Math.random() * 0.6 + 0.05).toFixed(3);
        const status = Math.random() < 0.7 ? "pruned" : "evaluated";
        setBranchLog((prev) => [...prev, `branch_${id} · score ${score} · ${status}`].slice(-8));
      }

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        // Do not reveal a blank results view while a shared cache/API adapter is resolving.
        void simulationPromise.then(({ result: simulationResult, source }) => {
          setResult(simulationResult);
          setResultSource(source);
          setStage("results");
        });
      }
    };
    requestAnimationFrame(tick);
  };

  const reset = () => {
    setStage("idle");
    setIdea("");
    setResult(null);
    setResultSource(null);
  };

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Simulate" }]}
        eyebrow="/ chronos · startup simulator"
        title={
          <>
            Simulate your
            <br />
            <span className="italic text-ink-dim">startup.</span>
          </>
        }
        subtitle="Enter an idea. Chronos will fork 1,000 possible futures — each with different go-to-market paths, timelines, and outcomes — then collapse to the one with the highest expected ARR."
      />

      <section className="relative pb-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Input */}
          <div className="mb-8">
            <form onSubmit={handleSubmit} className="glow-border rounded-2xl border border-line bg-bg-soft p-6 lg:p-8">
              <label className="block">
                <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-ink-faint">
                  Your idea
                </div>
                <input
                  id="startup-idea"
                  aria-label="Your idea"
                  type="text"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  disabled={stage === "simulating"}
                  placeholder="e.g. AI meeting assistant for engineering teams"
                  className="w-full rounded-lg border border-line bg-bg px-5 py-4 font-serif text-xl text-ink placeholder:text-ink-faint focus:border-chronos/50 focus:outline-none disabled:opacity-50"
                />
              </label>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
                    Try:
                  </span>
                  {EXAMPLES.slice(0, 3).map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setIdea(ex);
                        startSimulation(ex);
                      }}
                      disabled={stage === "simulating"}
                      className="rounded-full border border-line bg-bg px-3 py-1 font-mono text-[11px] text-ink-dim transition hover:border-line-strong hover:text-ink disabled:opacity-50"
                    >
                      {ex.split(" ").slice(0, 3).join(" ")}…
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!idea.trim() || stage === "simulating"}
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition hover:bg-chronos disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {stage === "simulating" ? "Simulating…" : "Simulate 1,000 futures"}
                  {stage !== "simulating" && (
                    <svg width="14" height="14" viewBox="0 0 14 14" className="transition group-hover:translate-x-0.5">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Simulating state */}
          {stage === "simulating" && (
            <SimulatingPanel progress={progress} counter={branchCounter} log={branchLog} />
          )}

          {/* Results */}
          {stage === "results" && result && (
            <ResultsPanel result={result} source={resultSource} onReset={reset} />
          )}
        </div>
      </section>
    </>
  );
}

// ---- Simulating panel ----

function SimulatingPanel({
  progress,
  counter,
  log,
}: {
  progress: number;
  counter: number;
  log: string[];
}) {
  return (
    <div className="rounded-2xl border border-line bg-bg-soft p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chronos opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-chronos" />
        </span>
        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-chronos">
          Simulating {counter.toLocaleString()} of 1,000 futures
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative mb-6 h-1 w-full overflow-hidden rounded-full bg-line">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-chronos transition-[width] duration-75"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Phase indicators */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        <PhaseStep label="Fork" active={progress < 0.33} done={progress >= 0.33} color="#60899B" />
        <PhaseStep label="Evaluate" active={progress >= 0.33 && progress < 0.75} done={progress >= 0.75} color="#CDCAB2" />
        <PhaseStep label="Collapse" active={progress >= 0.75} done={progress >= 1} color="#E2DDDA" />
      </div>

      {/* Live branch log */}
      <div className="rounded-lg border border-line bg-bg p-4">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
          execution log
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          {log.map((entry, i) => (
            <div key={i} className="flex items-start gap-2 text-ink-dim">
              <span className={entry.includes("evaluated") ? "text-accent-2" : "text-ink-faint"}>→</span>
              <span>{entry}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhaseStep({
  label,
  active,
  done,
  color,
}: {
  label: string;
  active: boolean;
  done: boolean;
  color: string;
}) {
  return (
    <div
      className="rounded-md border px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.2em] transition"
      style={{
        borderColor: active || done ? `${color}50` : undefined,
        color: done ? color : active ? color : "#989898",
        background: active ? `${color}10` : "transparent",
      }}
    >
      {done ? "✓ " : ""}
      {label}
    </div>
  );
}

// ---- Results panel ----

function ResultsPanel({
  result,
  source,
  onReset,
}: {
  result: SimulationResult;
  source: "cache" | "computed" | null;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-line bg-bg-soft p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-chronos">
                / best path · branch_{result.bestBranchId}
              </span>
              <span className="rounded-full border border-chronos/40 bg-chronos/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-chronos">
                {result.categoryLabel}
              </span>
              {source === "cache" && (
                <span className="rounded-full border border-accent-2/40 bg-accent-2/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-2">
                  Cache hit
                </span>
              )}
            </div>
            <h2 className="font-serif text-4xl leading-tight md:text-5xl">
              {result.bestPath.name}
              <span className="ml-1 text-ink-faint">.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-ink-dim">
              {result.bestPath.thesis}
            </p>
          </div>

          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
              Expected ARR
            </div>
            <div className="font-serif text-5xl text-accent-warm tabular-nums">
              {formatCurrency(result.bestPath.arr)}
            </div>
            <div className="mt-2 font-mono text-[11px] text-ink-dim">
              <span className="text-accent-2">{formatPercent(result.bestPath.probability)}</span>
              <span className="text-ink-faint"> · probability of success</span>
            </div>
          </div>
        </div>

        {/* Key metrics row */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 md:grid-cols-5">
          <MetricStat label="ARR" value={formatCurrency(result.bestPath.arr)} />
          <MetricStat label="Probability" value={formatPercent(result.bestPath.probability)} />
          <MetricStat label="Months to PMF" value={`${result.bestPath.monthsToPmf}`} />
          <MetricStat label="CAC" value={formatCurrency(result.bestPath.cac)} />
          <MetricStat label="LTV" value={formatCurrency(result.bestPath.ltv)} />
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-line bg-bg-soft p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
              18-month roadmap
            </div>
            <div className="mt-1 font-serif text-2xl text-ink">
              Month by month<span className="text-ink-faint">.</span>
            </div>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
            {result.bestPath.milestones.length} milestones
          </div>
        </div>

        <Timeline milestones={result.bestPath.milestones} />
      </div>

      {/* Highlights + Risks */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-chronos/30 bg-chronos/10 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-chronos" />
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-chronos">
              Why this path wins
            </div>
          </div>
          <ul className="space-y-2">
            {result.bestPath.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] leading-[1.5] text-ink-dim">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-chronos" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-bg p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
              Risks to watch
            </div>
          </div>
          <ul className="space-y-2">
            {result.bestPath.risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] leading-[1.5] text-ink-dim">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Alternatives */}
      <div className="rounded-2xl border border-line bg-bg-soft p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
              {result.totalPaths} paths evaluated · {result.alternatives.length} alternatives
            </div>
            <div className="mt-1 font-serif text-2xl text-ink">
              Other futures that almost won<span className="text-ink-faint">.</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {result.alternatives.map((alt) => (
            <AlternativeCard key={alt.id} path={alt} />
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          onClick={onReset}
          className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-dim transition hover:border-line-strong hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" className="transition group-hover:-rotate-180" style={{ transitionDuration: "500ms" }}>
            <path d="M2 7a5 5 0 1 0 5-5M2 2v5h5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Simulate another idea
        </button>
      </div>
    </div>
  );
}

// ---- Timeline visualization ----

function Timeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="relative">
      {/* Line */}
      <div className="absolute left-6 top-6 bottom-6 w-px bg-line md:left-8" />

      <div className="space-y-6">
        {milestones.map((m, i) => (
          <div key={i} className="relative flex gap-6 pl-0">
            {/* Node */}
            <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center md:h-16 md:w-16">
              <div className="absolute inset-0 rounded-full border border-chronos/40 bg-bg" />
              <div className="absolute inset-1 rounded-full bg-chronos/10" />
              <div className="font-mono text-[11px] text-chronos">
                M{m.month}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-2 pt-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
                Month {m.month}
              </div>
              <div className="mt-1 font-serif text-xl text-ink">{m.title}</div>
              <div className="mt-1 text-[13px] leading-[1.6] text-ink-dim">
                {m.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Metric stat ----

function MetricStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
        {label}
      </div>
      <div className="mt-1 font-serif text-2xl text-ink tabular-nums">{value}</div>
    </div>
  );
}

// ---- Alternative card ----

function AlternativeCard({ path }: { path: Path }) {
  return (
    <div className="rounded-xl border border-line bg-bg p-5">
      <div className="flex items-baseline justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
          branch_{path.id}
        </div>
        <div className="font-mono text-[11px] text-ink-dim">
          {formatPercent(path.probability)}
        </div>
      </div>
      <div className="mt-3 font-serif text-lg text-ink">{path.name}</div>
      <div className="mt-2 line-clamp-2 text-[12px] leading-[1.55] text-ink-dim">
        {path.thesis}
      </div>
      <div className="mt-4 flex items-baseline gap-3 border-t border-line pt-3">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">ARR</div>
          <div className="font-serif text-lg text-ink-dim tabular-nums">
            {formatCurrency(path.arr)}
          </div>
        </div>
        <div className="h-6 w-px bg-line" />
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">PMF</div>
          <div className="font-serif text-lg text-ink-dim tabular-nums">
            {path.monthsToPmf} mo
          </div>
        </div>
        <div className="h-6 w-px bg-line" />
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-faint">CAC</div>
          <div className="font-serif text-lg text-ink-dim tabular-nums">
            {formatCurrency(path.cac)}
          </div>
        </div>
      </div>
    </div>
  );
}
