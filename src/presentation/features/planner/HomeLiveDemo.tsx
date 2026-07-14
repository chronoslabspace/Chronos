import { useMemo, useState } from "react";
import { StartupLaunchPlanner } from "../../../application/planner/StartupLaunchPlanner";
import {
  createPublicStartupRequest,
  publicStartupSimulator,
} from "../../../application/planner/publicStartupSimulator";
import { formatCurrency, formatPercent } from "../../../domain/chronos/startup-sim";
import type { SimulationResult } from "../../../domain/chronos/startup-sim";

const defaultPrompt = "I want to build an AI meeting assistant.";

type DemoStatus = "idle" | "planning" | "complete" | "error";

/**
 * The compact public experience: type an objective, observe Chronos create a
 * task plan, and receive the selected temporal path without leaving home.
 */
export function HomeLiveDemo() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [source, setSource] = useState<"cache" | "computed" | null>(null);
  const [error, setError] = useState("");

  const graph = useMemo(
    () => new StartupLaunchPlanner().decompose({
      workspaceId: "public-startup-simulator",
      decisionId: "public-launch-decision",
      prompt,
    }),
    [prompt]
  );

  const run = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const value = prompt.trim();
    if (!value) return;

    setStatus("planning");
    setResult(null);
    setError("");

    try {
      const response = await publicStartupSimulator.run(
        createPublicStartupRequest(value)
      );
      // A short hold gives the user time to see Chronos work through the plan.
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      setResult(response.result);
      setSource(response.source);
      setStatus("complete");
    } catch (cause) {
      setError((cause as Error).message || "Unable to run the simulation.");
      setStatus("error");
    }
  };

  return (
    <section className="relative border-y border-line py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-chronos">
                / live demo
              </span>
              <div className="h-px w-10 bg-line" />
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-chronos blink" />
                Public sandbox
              </span>
            </div>
            <h2 className="font-serif text-4xl leading-[1] tracking-tight md:text-5xl">
              Give Chronos a goal.
              <br />
              <span className="italic text-ink-dim">Watch it plan the future.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[14px] leading-[1.7] text-ink-dim">
            This is not a chatbot response. Chronos creates a dependency-aware
            task graph, simulates viable timelines, and ranks the best path.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-bg-soft">
          <form onSubmit={run} className="border-b border-line p-5 sm:p-6">
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.23em] text-ink-faint">
                Objective
              </span>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  aria-label="Simulation objective"
                  disabled={status === "planning"}
                  className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-4 py-3 font-serif text-lg text-ink placeholder:text-ink-faint focus:border-chronos/60 focus:outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === "planning" || !prompt.trim()}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-medium text-bg transition hover:bg-chronos disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "planning" ? "Planning…" : "Simulate"}
                  {status !== "planning" && (
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </label>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="border-b border-line p-5 lg:col-span-7 lg:border-b-0 lg:border-r lg:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.23em] text-ink-faint">
                  Planner task graph
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-chronos">
                  {graph.tasks.length} tasks
                </div>
              </div>

              <div className="space-y-0">
                {graph.tasks.map((task, index) => (
                  <div key={task.id}>
                    <div className="flex items-center gap-4">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-bg font-mono text-[10px] ${
                        status === "planning" ? "border-chronos/60 text-chronos" : "border-line text-ink-faint"
                      }`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1 rounded-lg border border-line bg-bg/70 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-serif text-xl text-ink">{task.title}</span>
                          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">{task.kind}</span>
                        </div>
                        {task.dependencies.length > 0 && (
                          <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-faint">
                            waits for: {task.dependencies.join(" · ")}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < graph.tasks.length - 1 && <div className="ml-4 h-3 border-l border-dashed border-line-strong" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 lg:col-span-5 lg:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.23em] text-ink-faint">
                  Ranked timeline
                </div>
                {source === "cache" && <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent-2">Cache hit</span>}
              </div>

              {status === "idle" && <DemoEmpty />}
              {status === "planning" && <DemoPlanning />}
              {status === "error" && <p className="rounded-lg border border-line bg-bg p-4 font-mono text-[11px] text-ink-dim">{error}</p>}
              {status === "complete" && result && <DemoResult result={result} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoEmpty() {
  return <div className="flex min-h-72 flex-col items-center justify-center text-center"><div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-bg font-serif text-2xl text-chronos">?</div><p className="mt-4 max-w-xs text-[13px] leading-[1.65] text-ink-dim">Chronos will rank the possible timelines after the plan is generated.</p></div>;
}

function DemoPlanning() {
  return <div className="flex min-h-72 flex-col items-center justify-center text-center"><div className="h-7 w-7 rounded-full border-2 border-chronos border-t-transparent animate-spin" /><p className="mt-4 font-mono text-[10px] uppercase tracking-[0.23em] text-chronos">Researching · modeling · ranking</p><p className="mt-2 text-[12px] text-ink-faint">Simulating 1,000 possible futures</p></div>;
}

function DemoResult({ result }: { result: SimulationResult }) {
  return <div className="rounded-xl border border-accent-warm/35 bg-accent-warm/5 p-5"><div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-warm">Best path · {result.bestBranchId}</div><div className="mt-3 font-serif text-3xl text-ink">{result.bestPath.name}</div><p className="mt-3 text-[13px] leading-[1.65] text-ink-dim">{result.bestPath.thesis}</p><div className="mt-5 grid grid-cols-2 gap-3 border-t border-accent-warm/20 pt-4"><div><div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Expected ARR</div><div className="mt-1 font-serif text-2xl text-accent-warm">{formatCurrency(result.bestPath.arr)}</div></div><div><div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">Probability</div><div className="mt-1 font-serif text-2xl text-accent-warm">{formatPercent(result.bestPath.probability)}</div></div></div><div className="mt-5 border-t border-accent-warm/20 pt-4"><div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">First move</div><div className="mt-1 text-[13px] text-ink">Month {result.bestPath.milestones[0]?.month}: {result.bestPath.milestones[0]?.title}</div></div></div>;
}