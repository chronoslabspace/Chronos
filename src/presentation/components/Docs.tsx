import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "./PageHeader";
import { SystemArchitecture } from "./SystemArchitecture";

type Section =
  | "getting-started"
  | "platform"
  | "task-os"
  | "concepts"
  | "api-reference"
  | "architecture"
  | "tutorials"
  | "examples"
  | "sdk"
  | "rest";

const NAV: {
  group: string;
  items: { id: Section; label: string }[];
}[] = [
  {
    group: "Docs",
    items: [
      { id: "getting-started", label: "Getting Started" },
      { id: "platform", label: "Platform Surfaces" },
      { id: "task-os", label: "Task Operating System" },
      { id: "concepts", label: "Concepts" },
    ],
  },
  {
    group: "API",
    items: [
      { id: "api-reference", label: "API Reference" },
      { id: "sdk", label: "SDK" },
      { id: "rest", label: "REST API" },
    ],
  },
  {
    group: "Guides",
    items: [
      { id: "architecture", label: "Architecture" },
      { id: "tutorials", label: "Tutorials" },
      { id: "examples", label: "Examples" },
    ],
  },
];

export function Docs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get("section");
  const isKnownSection = NAV.flatMap((group) => group.items).some(
    (item) => item.id === requestedSection
  );
  const section: Section = isKnownSection
    ? (requestedSection as Section)
    : "getting-started";

  const selectSection = (next: Section) => {
    setSearchParams({ section: next }, { replace: true });
  };

  return (
    <>
      <PageHeader
        breadcrumb={[]}
        eyebrow="/ documentation"
        title={<>Chronos docs<span className="text-ink-faint">.</span></>}
        subtitle="Everything you need to build agents that reason across time. From the Chronos language to the SDK to the REST API."
      />

      <section className="relative">
        <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-10">
          {/* Mobile: horizontal nav strip */}
          <div className="mb-6 lg:hidden">
            <div className="-mx-6 flex gap-1.5 overflow-x-auto px-6 pb-2">
              {NAV.flatMap((g) =>
                g.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectSection(item.id)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-[11px] transition ${
                      section === item.id
                        ? "bg-chronos/15 text-chronos"
                        : "border border-line text-ink-dim hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Desktop sidebar */}
            <aside className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-20">
                <nav className="space-y-6">
                  {NAV.map((group) => (
                    <div key={group.group}>
                      <div className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
                        {group.group}
                      </div>
                      <ul className="space-y-0.5">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => selectSection(item.id)}
                              className={`block w-full rounded-md px-3 py-1.5 text-left text-[13px] transition ${
                                section === item.id
                                  ? "bg-chronos/10 text-chronos"
                                  : "text-ink-dim hover:bg-bg-soft hover:text-ink"
                              }`}
                            >
                              {item.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>

                <div className="mt-8 border-t border-line pt-6">
                  <div className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-faint">
                    Jump to
                  </div>
                  <ul className="space-y-1.5 text-[12px]">
                    <li>
                      <Link to="/access" className="text-ink-dim hover:text-ink">
                        Request access →
                      </Link>
                    </li>
                    <li>
                      <Link to="/simulate" className="text-ink-dim hover:text-ink">
                        Try simulator →
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" className="text-ink-dim hover:text-ink">
                        Get help →
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="min-w-0 lg:col-span-9">
              {section === "getting-started" && <GettingStarted />}
              {section === "platform" && <PlatformSurfacesDocs />}
              {section === "task-os" && <TaskOperatingSystemDocs />}
              {section === "concepts" && <Concepts />}
              {section === "api-reference" && <ApiReference />}
              {section === "sdk" && <SdkDocs />}
              {section === "rest" && <RestDocs />}
              {section === "architecture" && <Architecture />}
              {section === "tutorials" && <Tutorials />}
              {section === "examples" && <Examples />}
            </main>
          </div>
        </div>
      </section>
    </>
  );
}

// ============================================================
// Shared building blocks
// ============================================================

function DocTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink md:text-4xl">
      {children}
    </h2>
  );
}

function DocSub({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-10 border-t border-line pt-6 font-serif text-xl text-ink">
      {children}
    </h3>
  );
}

function DocBody({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 max-w-2xl text-[14px] leading-[1.75] text-ink-dim">{children}</p>;
}

function Code({ children, lang = "ts" }: { children: string; lang?: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-line bg-bg">
      <div className="flex items-center justify-between border-b border-line px-4 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-ink-faint/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-faint/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-ink-faint/40" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
          {lang}
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-[1.7]">
        <code className="text-ink-dim">{children}</code>
      </pre>
    </div>
  );
}

function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "tip";
  title?: string;
  children: React.ReactNode;
}) {
  const colors = {
    info: "border-chronos/30 bg-chronos/5 text-chronos",
    warn: "border-rose-400/30 bg-rose-400/5 text-rose-400",
    tip: "border-accent-warm/30 bg-accent-warm/5 text-accent-warm",
  }[tone];
  return (
    <div className={`mt-6 rounded-lg border p-4 ${colors}`}>
      {title && (
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.25em]">
          {title}
        </div>
      )}
      <div className="text-[13px] leading-[1.65] text-ink-dim">{children}</div>
    </div>
  );
}

function Endpoint({
  method,
  path,
  desc,
}: {
  method: "GET" | "POST" | "DELETE";
  path: string;
  desc: string;
}) {
  const colors = {
    GET: "bg-chronos/15 text-chronos",
    POST: "bg-accent-2/15 text-accent-2",
    DELETE: "bg-rose-400/15 text-rose-400",
  }[method];
  return (
    <div className="rounded-lg border border-line bg-bg-soft/60 p-4">
      <div className="flex items-baseline gap-3">
        <span className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] ${colors}`}>
          {method}
        </span>
        <code className="font-mono text-[13px] text-ink">{path}</code>
      </div>
      <div className="mt-2 text-[12px] leading-[1.6] text-ink-dim">{desc}</div>
    </div>
  );
}

// ============================================================
// Getting Started
// ============================================================

function GettingStarted() {
  return (
    <div>
      <DocTitle>Getting started</DocTitle>
      <DocBody>
        Chronos gives autonomous agents the ability to branch, evaluate, and
        collapse millions of futures in milliseconds. This guide gets you from
        zero to your first simulation in under 5 minutes.
      </DocBody>

      <DocSub>Installation</DocSub>
      <DocBody>Pick your language. Install the SDK.</DocBody>
      <Code lang="bash">{`# TypeScript / Node
npm install @chronos/sdk

# Python
pip install chronos

# Rust
cargo add chronos

# Go
go get github.com/chronos-labs/sdk-go`}</Code>

      <DocSub>Quick start</DocSub>
      <DocBody>
        A minimal Chronos program declares a world, a set of candidate
        actions, and a scoring function — then runs the pipeline.
      </DocBody>
      <Code lang="chronos">{`state {
  agent.mrr = 180
  agent.runway = 12
  world.competitor = 40
  context.board = "watching"
}

action "Raise Series A" {
  agent.runway = 24
  context.board = "hands-off"
  risk = 0.4
  reward = 0.82
}

action "Hunker down" {
  agent.runway = 18
  agent.mrr = 150
  risk = 0.25
  reward = 0.35
}

score growth(state) {
  base = state.reward - state.risk
  if state.context.board == "watching" {
    base = base - 0.1
  }
  return clamp(base, 0, 1)
}

run {
  fork
  evaluate with growth
  collapse max-utility
}`}</Code>

      <DocSub>Your first simulation</DocSub>
      <DocBody>
        Run the program from the CLI. Chronos forks every action into an
        isolated branch, scores each branch in parallel, and collapses to
        the winner.
      </DocBody>
      <Code lang="bash">{`$ chronos run ./startup.chronos
✓ fork     → 2 branches
✓ evaluate → scored in 1.4ms
✓ collapse → branch_0x4a wins (score 0.720)

Result: Raise Series A
Expected ARR: $2.4M · probability 72%`}</Code>

      <Callout title="Tip">
        The same program runs identically from the SDK, REST API, CLI, or an
        approved workspace. Chronos does not change a decision based on how it
        is invoked.
      </Callout>
    </div>
  );
}

// ============================================================
// Platform Surfaces
// ============================================================

function PlatformSurfacesDocs() {
  const surfaces = [
    ["SDK", "Embed", "Typed clients for TypeScript, Python, Rust, and Go. Use this when Chronos lives inside an existing agent."],
    ["API", "Connect", "REST, event streams, and gRPC for systems that need a stable language-neutral contract."],
    ["CLI", "Operate", "Run programs, inspect branches, replay decisions, and use Chronos in CI or local experiments."],
    ["Visual Studio Extension", "Author", "Chronos syntax awareness, live branch previews, and evaluator output inside Visual Studio Code."],
    ["Agent Runtime", "Reason", "A deterministic branch workspace for agent tools, policies, memory, and Chronos programs."],
    ["Simulation Cloud", "Scale", "Elastic simulation capacity, branch archives, observability, replay, and production decision memory."],
  ] as const;

  return (
    <div>
      <DocTitle>Platform surfaces</DocTitle>
      <DocBody>
        Chronos is a Temporal Compute Platform, not a single interface. Every
        surface uses the same run, branch, timeline, and memory contracts — so
        an experiment started in an editor can be operated from CI and replayed
        in the cloud.
      </DocBody>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {surfaces.map(([name, verb, detail], index) => (
          <div key={name} className="grid grid-cols-[34px_1fr] gap-x-4 py-5 sm:grid-cols-[42px_180px_1fr] sm:gap-x-6">
            <div className="font-mono text-[10px] tracking-[0.2em] text-chronos">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="font-serif text-xl text-ink sm:text-2xl">{name}</div>
            <div className="col-span-2 mt-2 text-[13px] leading-[1.65] text-ink-dim sm:col-span-1 sm:mt-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-2">{verb}</span>{" "}
              {detail}
            </div>
          </div>
        ))}
      </div>

      <DocSub>One program, every surface</DocSub>
      <DocBody>
        A `.chronos` program has the same meaning whether it is invoked through
        the SDK, a REST request, the CLI, the extension, or Simulation Cloud.
        The platform changes how you author and operate a decision — never what
        the decision means.
      </DocBody>
      <Code lang="bash">{`# Author in Visual Studio Code
# Run locally with the CLI
chronos run ./decision.chronos

# Embed in an Agent Runtime through the SDK
await client.run("./decision.chronos")

# Submit the same program to Simulation Cloud
curl -X POST https://api.chronoslab.space/v1/runs \\
  -H "Authorization: Bearer $CHRONOS_KEY" \\
  -F program=@decision.chronos`}</Code>

      <Callout tone="tip" title="Platform contract">
        Every surface emits a stable <code className="font-mono text-[12px]">runId</code>,{" "}
        <code className="font-mono text-[12px]">branchId</code>, and timeline
        trace. You can author once, execute anywhere, and inspect the same
        decision later from the dashboard.
      </Callout>
    </div>
  );
}

// ============================================================
// Task Operating System
// ============================================================

function TaskOperatingSystemDocs() {
  const tasks = [
    ["01", "Research competitors", "research.competitors", "Maps alternatives, substitutes, and market position."],
    ["02", "Estimate market", "market.estimate", "Estimates addressable demand and reachable initial segments."],
    ["03", "Build roadmap", "roadmap.build", "Converts evidence into a dependency-aware execution sequence."],
    ["04", "Predict adoption", "adoption.predict", "Models likely adoption curves, retention, and distribution constraints."],
    ["05", "Financial simulation", "financial.simulate", "Simulates revenue, burn, runway, and capital scenarios."],
    ["06", "Risk analysis", "risk.analyze", "Turns downside evidence into guardrails and ranking penalties."],
  ] as const;

  return (
    <div>
      <DocTitle>Task Operating System</DocTitle>
      <DocBody>
        Chronos does not ask a user to choose an agent. The user provides an
        objective; the Planner decomposes it into a task graph, the Scheduler
        dispatches ready work, and the Runtime resolves registered capabilities.
      </DocBody>

      <DocSub>Objective to task graph</DocSub>
      <Code lang="ts">{`const plan = await chronos.plan({
  objective: "Launch startup",
  workspace: "acme",
  constraints: ["18 month runway"],
});

const outcome = await chronos.execute(plan);
await chronos.commit(outcome.bestTimeline);`}</Code>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {tasks.map(([number, title, capability, detail]) => (
          <div key={number} className="grid grid-cols-[34px_1fr] gap-x-4 py-5 sm:grid-cols-[42px_180px_1fr] sm:gap-x-6">
            <div className="font-mono text-[10px] tracking-[0.2em] text-chronos">{number}</div>
            <div className="font-serif text-xl text-ink sm:text-2xl">{title}</div>
            <div className="col-span-2 mt-2 text-[13px] leading-[1.65] text-ink-dim sm:col-span-1 sm:mt-0">
              <code className="font-mono text-[10px] text-accent-2">{capability}</code>
              <span className="mx-2 text-ink-faint">·</span>
              {detail}
            </div>
          </div>
        ))}
      </div>

      <DocSub>Capability registration</DocSub>
      <DocBody>
        A provider can be an LLM, a tool server, a human approval step, or a
        deterministic function. It registers a capability; the engine routes
        compatible tasks to it without hard-coding any individual agent.
      </DocBody>
      <Code lang="ts">{`registry.register(
  new CapabilityRegistration({
    id: "market-research-v1",
    providerId: "research-provider",
    name: "Market research capability",
    version: "1.0.0",
    taskKinds: ["research.competitors", "market.estimate"],
    capabilityKeys: ["research.competitors", "market.estimate"],
  }),
  async (task) => runResearch(task.input)
);`}</Code>

      <DocSub>Temporal versioning</DocSub>
      <DocBody>
        Task execution produces timeline evidence. Every decision can branch,
        explore deeper subbranches, merge compatible evidence, then collapse to
        one canonical path while retaining discarded futures for replay.
      </DocBody>
      <Code lang="ts">{`const child = branches.subbranch(parent, alternativeAction);
const merged = branches.merge(timeline, [parent, child], "highest-score");
const canonical = branches.collapse(
  merged.timeline,
  selectedBranch,
  candidates,
  "max-utility"
);`}</Code>

      <Callout tone="tip" title="Why capabilities matter">
        Replace a research provider, financial model, or risk evaluator without
        changing the task graph or Temporal Engine. The interface is the task,
        not the agent identity.
      </Callout>
    </div>
  );
}

// ============================================================
// Concepts
// ============================================================

function Concepts() {
  return (
    <div>
      <DocTitle>Concepts</DocTitle>
      <DocBody>
        A task graph, a temporal pipeline, and a ranked timeline. Everything
        else is built on top.
      </DocBody>

      <DocSub>World state</DocSub>
      <DocBody>
        A world state is a snapshot of reality — the inputs to a decision. It
        has three namespaces: <code className="font-mono text-[12px] text-chronos">agent</code> (the
        decision-maker), <code className="font-mono text-[12px] text-accent-2">world</code> (the
        goal), and <code className="font-mono text-[12px] text-accent-warm">context</code> (the
        environment). Fields are typed and versioned.
      </DocBody>
      <Code lang="chronos">{`state {
  agent.runway = 12          # months of cash
  agent.mrr = 180            # thousands
  world.competitor = 40      # millions
  context.board = "watching"
}`}</Code>

      <DocSub>Actions</DocSub>
      <DocBody>
        An action is a mutation on the world state plus a <code className="font-mono text-[12px] text-ink-dim">risk</code>{" "}
        and <code className="font-mono text-[12px] text-ink-dim">reward</code> estimate. Each action becomes a branch
        in the simulation.
      </DocBody>
      <Code lang="chronos">{`action "Raise Series A" {
  agent.runway = 24
  agent.mrr = 320
  context.board = "hands-off"
  risk = 0.4
  reward = 0.82
}`}</Code>

      <DocSub>Scoring</DocSub>
      <DocBody>
        A scoring function turns a state into a number in [0, 1]. It's pure,
        deterministic, and runs in parallel across all branches. The engine
        picks the highest score by default.
      </DocBody>
      <Code lang="chronos">{`score growth(state) {
  base = state.reward - state.risk
  if state.context.board == "watching" {
    base = base - 0.1
  }
  return clamp(base, 0, 1)
}`}</Code>

      <DocSub>Fork · Evaluate · Collapse</DocSub>
      <DocBody>
        The runtime pipeline. <code className="font-mono text-[12px] text-chronos">fork</code> clones
        the state once per action. <code className="font-mono text-[12px] text-accent-2">evaluate</code> runs
        the scoring function on every branch. <code className="font-mono text-[12px] text-accent-warm">collapse</code> picks
        the winner and commits it. The whole cycle completes in ~2ms for
        a thousand branches.
      </DocBody>
      <Code lang="chronos">{`run {
  fork
  evaluate with growth
  collapse max-utility
}`}</Code>

      <Callout tone="tip" title="Why this matters">
        Before Chronos, agents reacted. They took an input and produced an
        output, hoping it was right. With Chronos, agents simulate
        consequences first. The difference is the difference between a
        chatbot and a strategist.
      </Callout>
    </div>
  );
}

// ============================================================
// API Reference
// ============================================================

function ApiReference() {
  return (
    <div>
      <DocTitle>API reference</DocTitle>
      <DocBody>
        Three ways to invoke Chronos: the Chronos language (for describing
        futures), the SDK (for embedding in your agent), and the REST API
        (for cross-language integration).
      </DocBody>

      <DocSub>Chronos language</DocSub>
      <DocBody>
        A domain-specific language for describing futures. A Chronos program
        has four constructs: <code className="font-mono text-[12px] text-chronos">state</code>,{" "}
        <code className="font-mono text-[12px] text-ink">action</code>,{" "}
        <code className="font-mono text-[12px] text-accent-2">score</code>, and{" "}
        <code className="font-mono text-[12px] text-accent-warm">run</code>.
      </DocBody>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-bg-soft p-4">
          <div className="font-mono text-[11px] text-chronos">state {"{ ... }"}</div>
          <div className="mt-1 text-[12px] leading-[1.6] text-ink-dim">
            Declares the world. Grouped by namespace (agent / world / context).
          </div>
        </div>
        <div className="rounded-lg border border-line bg-bg-soft p-4">
          <div className="font-mono text-[11px] text-ink">action "name" {"{ ... }"}</div>
          <div className="mt-1 text-[12px] leading-[1.6] text-ink-dim">
            Declares a candidate action with state mutations + risk/reward.
          </div>
        </div>
        <div className="rounded-lg border border-line bg-bg-soft p-4">
          <div className="font-mono text-[11px] text-accent-2">score name(state) {"{ ... }"}</div>
          <div className="mt-1 text-[12px] leading-[1.6] text-ink-dim">
            A pure function that scores a branch. Must return a number in [0, 1].
          </div>
        </div>
        <div className="rounded-lg border border-line bg-bg-soft p-4">
          <div className="font-mono text-[11px] text-accent-warm">run {"{ ... }"}</div>
          <div className="mt-1 text-[12px] leading-[1.6] text-ink-dim">
            Declares the pipeline. fork · evaluate · collapse.
          </div>
        </div>
      </div>

      <DocSub>Engine API (TypeScript)</DocSub>
      <Code lang="ts">{`import { chronos, fork, evaluate, collapse } from "@chronos/sdk";

const client = await chronos.connect({
  key: process.env.CHRONOS_KEY,
  region: "auto",
});

const branches = await fork(client.state, {
  actions: plan.candidates,
  horizon: "100y",
});

const scored = await branches.evaluate(async (ctx) => {
  const outcome = await world.simulate(ctx);
  return score(outcome);
});

const winner = await collapse(scored, {
  strategy: "max-utility",
  archive: true,
});

await client.commit(winner);`}</Code>

      <DocSub>Strategy options</DocSub>
      <div className="mt-4 space-y-2">
        <div className="rounded-lg border border-line bg-bg-soft p-3">
          <div className="flex items-baseline gap-3">
            <code className="font-mono text-[12px] text-chronos">max-utility</code>
            <span className="text-[12px] text-ink-dim">
              Picks the branch with the highest score.
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-bg-soft p-3">
          <div className="flex items-baseline gap-3">
            <code className="font-mono text-[12px] text-chronos">min-risk</code>
            <span className="text-[12px] text-ink-dim">
              Picks the branch with the lowest risk, regardless of reward.
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-bg-soft p-3">
          <div className="flex items-baseline gap-3">
            <code className="font-mono text-[12px] text-chronos">balanced</code>
            <span className="text-[12px] text-ink-dim">
              Maximizes <code className="font-mono text-[11px]">reward - risk/2</code>. Default for conservative agents.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SDK
// ============================================================

function SdkDocs() {
  return (
    <div>
      <DocTitle>SDK</DocTitle>
      <DocBody>
        Four SDKs. One engine. Embed Chronos in your agent in any language.
      </DocBody>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          { lang: "TypeScript", pkg: "@chronos/sdk", v: "v4.2.1", size: "14kb" },
          { lang: "Python", pkg: "chronos", v: "v4.2.0", size: "18kb" },
          { lang: "Rust", pkg: "chronos", v: "v4.2.1", size: "9kb" },
          { lang: "Go", pkg: "github.com/chronos-labs/sdk-go", v: "v4.1.3", size: "12kb" },
        ].map((s) => (
          <div key={s.pkg} className="rounded-xl border border-line bg-bg-soft p-5">
            <div className="flex items-baseline justify-between">
              <div className="font-serif text-xl text-ink">{s.lang}</div>
              <span className="rounded-full border border-chronos/30 bg-chronos/10 px-2 py-0.5 font-mono text-[10px] text-chronos">
                {s.v}
              </span>
            </div>
            <div className="mt-2 font-mono text-[12px] text-ink-dim break-all">
              {s.pkg}
            </div>
            <div className="mt-1 font-mono text-[10px] text-ink-faint">
              size: {s.size} gzipped
            </div>
          </div>
        ))}
      </div>

      <DocSub>Connect</DocSub>
      <Code lang="ts">{`import { chronos } from "@chronos/sdk";

const client = await chronos.connect({
  key: process.env.CHRONOS_KEY,
  region: "auto", // picks nearest region
});`}</Code>

      <DocSub>Fork</DocSub>
      <Code lang="ts">{`const branches = await fork(client.state, {
  actions: plan.candidates,
  horizon: "100y",
  budget: { ms: 2, cores: 64 },
});`}</Code>

      <DocSub>Evaluate</DocSub>
      <Code lang="ts">{`const scored = await branches.evaluate(async (ctx) => {
  const outcome = await world.simulate(ctx);
  return score(outcome);
});`}</Code>

      <DocSub>Collapse</DocSub>
      <Code lang="ts">{`const winner = await collapse(scored, {
  strategy: "max-utility",
  archive: true,
});

await client.commit(winner);`}</Code>

      <Callout tone="tip" title="Async by default">
        Every SDK operation is async and cancellable. Use{" "}
        <code className="font-mono text-[12px]">AbortController</code> to
        cancel a long-running evaluation.
      </Callout>
    </div>
  );
}

// ============================================================
// REST API
// ============================================================

function RestDocs() {
  return (
    <div>
      <DocTitle>REST API</DocTitle>
      <DocBody>
        A RESTful API over the Chronos Task Operating System. Use it from any
        language, any environment. All endpoints require an API key passed via the{" "}
        <code className="font-mono text-[12px] text-ink-dim">Authorization</code> header.
      </DocBody>

      <DocSub>Base URL</DocSub>
      <Code lang="text">{`https://api.chronoslab.space/v1`}</Code>

      <DocSub>Endpoints</DocSub>
      <div className="mt-4 space-y-3">
        <Endpoint
          method="POST"
          path="/v1/plans"
          desc="Turn an objective and constraints into a dependency-aware task graph."
        />
        <Endpoint
          method="POST"
          path="/v1/runs"
          desc="Execute a task graph through registered capabilities and temporal branches."
        />
        <Endpoint
          method="GET"
          path="/v1/timelines/:id"
          desc="Inspect canonical state, branches, subbranches, merges, collapse records, and replay events."
        />
        <Endpoint
          method="GET"
          path="/v1/runs/:run_id"
          desc="Inspect a full task run, including execution records, evaluations, and ranked timelines."
        />
        <Endpoint
          method="POST"
          path="/v1/branches/:id/subbranches"
          desc="Explore a deeper alternative from an existing branch while retaining parent lineage."
        />
        <Endpoint
          method="POST"
          path="/v1/timelines/:id/merges"
          desc="Converge compatible branch evidence without committing canonical state."
        />
        <Endpoint
          method="POST"
          path="/v1/timelines/:id/collapse"
          desc="Rank candidate timelines and commit one canonical path while retaining discarded futures."
        />
        <Endpoint
          method="GET"
          path="/v1/workspaces/:id/knowledge"
          desc="Read workspace learning context: past simulations, successful futures, failure patterns, and graph evidence."
        />
        <Endpoint
          method="DELETE"
          path="/v1/runs/:run_id"
          desc="Delete a run and all its branches. Non-reversible."
        />
      </div>

      <DocSub>Example: Plan an objective</DocSub>
      <Code lang="bash">{`curl -X POST https://api.chronoslab.space/v1/plans \\
  -H "Authorization: Bearer $CHRONOS_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "objective": "Launch startup",
    "workspace_id": "acme",
    "constraints": ["18 month runway"],
    "configuration": {
      "model_version": "chronos-planner-v1",
      "horizon": "18mo"
    }
  }'`}</Code>

      <DocSub>Response</DocSub>
      <Code lang="json">{`{
  "plan_id": "plan_0x7a2f",
  "task_graph": [
    { "id": "research-competitors", "status": "queued" },
    { "id": "estimate-market", "depends_on": ["research-competitors"] },
    { "id": "financial-simulation", "depends_on": ["estimate-market", "predict-adoption"] }
  ],
  "planner_version": "chronos-planner-v1",
  "latency_ms": 0.31
}`}</Code>

      <Callout tone="info" title="Rate limits">
        Private workspace API access is rolling out through Cohort 04. Limits
        are set per workspace, model version, and simulation budget.
      </Callout>
    </div>
  );
}

// ============================================================
// Architecture
// ============================================================

function Architecture() {
  return (
    <div>
      <DocTitle>Architecture</DocTitle>
      <DocBody>
        Chronos is a temporal runtime built around six primitives. The
        engine doesn't care about the domain — it cares about branching,
        scoring, and collapsing.
      </DocBody>

      <DocSub>The runtime</DocSub>
      <DocBody>
        Every Chronos invocation goes through the same three-phase pipeline.
        The whole lifecycle completes in ~2ms for a thousand branches.
      </DocBody>

      {/* Pipeline diagram */}
      <div className="mt-6 rounded-xl border border-line bg-bg-soft p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:items-center">
          {[
            { label: "STATE", color: "#c6f0ff" },
            { label: "FORK", color: "#c6f0ff" },
            { label: "EVALUATE", color: "#b79bff" },
            { label: "COLLAPSE", color: "#ffd7a3" },
            { label: "COMMIT", color: "#ffd7a3" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className="flex h-10 w-full items-center justify-center rounded-md border font-mono text-[11px] uppercase tracking-[0.2em]"
                style={{ borderColor: `${s.color}50`, color: s.color, background: `${s.color}08` }}
              >
                {s.label}
              </div>
              {i < 4 && (
                <svg width="12" height="12" viewBox="0 0 12 12" className="hidden shrink-0 text-ink-faint md:block">
                  <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <SystemArchitecture />
      </div>

      <DocSub>The six primitives</DocSub>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[
          { n: "01", name: "fork", desc: "Clone state into isolated branches.", color: "#c6f0ff" },
          { n: "02", name: "evaluate", desc: "Score branches in parallel.", color: "#b79bff" },
          { n: "03", name: "collapse", desc: "Pick the winner by strategy.", color: "#ffd7a3" },
          { n: "04", name: "commit", desc: "Persist winning state to timeline.", color: "#ffd7a3" },
          { n: "05", name: "replay", desc: "Re-execute any archived branch.", color: "#b79bff" },
          { n: "06", name: "query", desc: "Inspect causal graph & entropy.", color: "#c6f0ff" },
        ].map((p) => (
          <div key={p.n} className="rounded-lg border border-line bg-bg-soft p-4">
            <div className="flex items-baseline gap-2">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.25em]"
                style={{ color: p.color }}
              >
                {p.n}
              </span>
              <code className="font-mono text-[13px] text-ink">{p.name}</code>
            </div>
            <div className="mt-1.5 text-[12px] leading-[1.55] text-ink-dim">{p.desc}</div>
          </div>
        ))}
      </div>

      <DocSub>Branch topology</DocSub>
      <DocBody>
        Every branch is byte-level isolated from every other branch. No
        branch can observe or influence any other branch — including
        branches belonging to other customers.
      </DocBody>
      <Code lang="chronos">{`run {
  fork                # 1,000 isolated branches
  evaluate with fn    # parallel scoring
  collapse strategy   # winner + archive
}`}</Code>

      <DocSub>The world model</DocSub>
      <DocBody>
        Every simulation Chronos runs teaches it something about how the
        world works. Over time, the world model compounds into an advantage
        that's difficult to replicate.
      </DocBody>
      <Callout tone="tip" title="Why this matters">
        A competitor could build the engine. They can't build the history.
      </Callout>
    </div>
  );
}

// ============================================================
// Tutorials
// ============================================================

function Tutorials() {
  return (
    <div>
      <DocTitle>Tutorials</DocTitle>
      <DocBody>
        Build three task-oriented workflows — one for releases, one for market
        decisions, one for company strategy. Each tutorial takes ~20 minutes.
      </DocBody>

      <DocSub>Build a release planning workflow</DocSub>
      <DocBody>
        This workflow decides how to ship a feature under time pressure. The
        Planner creates research, validation, and release tasks before the
        temporal engine simulates ship, refactor, test, and defer timelines.
      </DocBody>
      <Code lang="chronos">{`state {
  agent.velocity = 68
  agent.days_left = 3
  agent.quality = 45
  world.bugs = 7
  world.coverage = "fragile"
  context.stakeholder = "watching"
  context.debt_pressure = 6
}

action "Ship as-is" {
  agent.days_left = 0
  world.bugs = 7
  context.debt_pressure = 9
  risk = 0.65
  reward = 0.85
}

action "Refactor first" {
  agent.days_left = 5
  agent.quality = 80
  world.bugs = 2
  world.coverage = "stable"
  risk = 0.2
  reward = 0.6
}

score utility(state) {
  base = state.reward - 0.8 * state.risk
  if state.context.stakeholder == "watching" {
    base = base - 0.15
  }
  if state.context.debt_pressure > 5 {
    base = base - (state.context.debt_pressure - 5) * 0.04
  }
  return clamp(base, 0, 1)
}

run {
  fork
  evaluate with utility
  collapse max-utility
}`}</Code>

      <DocSub>Build a market decision workflow</DocSub>
      <DocBody>
        This workflow manages a $2.4M position ahead of a macro event. It
        creates event, downside, hedge, and execution tasks before ranking the
        resulting timelines.
      </DocBody>
      <Code lang="chronos">{`state {
  agent.size = 72
  agent.vol = 34
  agent.conviction = 15
  world.minutes_to_print = 40
  world.pnl = 4
  world.tape = "thin"
  context.macro_wind = 8
  context.signals = "mixed"
}

action "Add to position" {
  agent.size = 90
  agent.conviction = 55
  world.pnl = 12
  risk = 0.7
  reward = 0.85
}

action "Hedge with puts" {
  agent.conviction = 40
  world.pnl = 2
  world.tape = "thick"
  risk = 0.15
  reward = 0.4
}

score risk_adjusted(state) {
  base = state.reward - state.risk
  if state.agent.vol > 30 {
    base = base - 0.1
  }
  if state.world.tape == "thin" {
    base = base - 0.08
  }
  return clamp(base, 0, 1)
}

run {
  fork
  evaluate with risk_adjusted
  collapse min-risk
}`}</Code>

      <DocSub>Build a startup launch workflow</DocSub>
      <DocBody>
        This workflow plans a company's next move with 12 months of runway and
        a rising competitor. Chronos decomposes the objective into research,
        market, roadmap, adoption, financial, and risk tasks.
      </DocBody>
      <Code lang="chronos">{`state {
  agent.runway = 12
  agent.mrr = 180
  agent.momentum = 60
  world.churn = 4
  world.competitor = 40
  context.board = "watching"
  context.competitive_wind = 7
}

action "Raise Series A" {
  agent.runway = 24
  agent.mrr = 320
  context.board = "hands-off"
  risk = 0.4
  reward = 0.82
}

action "Ship enterprise tier" {
  agent.momentum = 78
  agent.mrr = 210
  world.competitor = 30
  risk = 0.45
  reward = 0.78
}

score growth(state) {
  base = state.reward * 1.1 - state.risk * 0.9
  if state.context.board == "watching" {
    base = base - 0.1
  }
  if state.world.churn > 3 {
    base = base - 0.15
  }
  return clamp(base, 0, 1)
}

run {
  fork
  evaluate with growth
  collapse max-utility
}`}</Code>

      <Callout title="What's next">
        Once you've built one agent, the others follow the same pattern:
        declare state, declare actions, write a scoring function, run the
        pipeline.
      </Callout>
    </div>
  );
}

// ============================================================
// Examples
// ============================================================

function Examples() {
  return (
    <div>
      <DocTitle>Examples</DocTitle>
      <DocBody>
        Real Chronos programs, ready to run. Clone them, modify them, make
        them yours.
      </DocBody>

      <div className="mt-6 space-y-4">
        {[
          {
            name: "Forge · feature branch",
            lang: "TypeScript",
            desc: "A coding agent deciding how to ship under time pressure.",
            code: `state {
  agent.velocity = 68
  agent.days_left = 3
  agent.quality = 45
  world.bugs = 7
  world.coverage = "fragile"
  context.stakeholder = "watching"
  context.debt_pressure = 6
}

action "Ship as-is" {
  agent.days_left = 0
  world.coverage = "fragile"
  context.debt_pressure = 9
  risk = 0.65
  reward = 0.85
}

action "Refactor first" {
  agent.days_left = 5
  agent.quality = 80
  world.bugs = 2
  world.coverage = "stable"
  risk = 0.2
  reward = 0.6
}

score utility(state) {
  base = state.reward - 0.8 * state.risk
  if state.context.stakeholder == "watching" {
    base = base - 0.15
  }
  return clamp(base, 0, 1)
}

run {
  fork
  evaluate with utility
  collapse max-utility
}`,
          },
          {
            name: "Oracle · live position",
            lang: "Python",
            desc: "A trading agent managing a $2.4M position before a macro print.",
            code: `state {
  agent.size = 72
  agent.vol = 34
  agent.conviction = 15
  world.minutes_to_print = 40
  world.pnl = 4
  world.tape = "thin"
  context.macro_wind = 8
  context.signals = "mixed"
}

action "Add to position" {
  agent.size = 90
  agent.conviction = 55
  world.pnl = 12
  risk = 0.7
  reward = 0.85
}

action "Hedge with puts" {
  agent.conviction = 40
  world.tape = "thick"
  risk = 0.15
  reward = 0.4
}

score risk_adjusted(state) {
  base = state.reward - state.risk
  if state.agent.vol > 30 {
    base = base - 0.1
  }
  return clamp(base, 0, 1)
}

run {
  fork
  evaluate with risk_adjusted
  collapse min-risk
}`,
          },
          {
            name: "Atlas · board decision",
            lang: "Rust",
            desc: "A founder agent deciding the company's next move with limited runway.",
            code: `state {
  agent.runway = 12
  agent.mrr = 180
  agent.momentum = 60
  world.churn = 4
  world.competitor = 40
  context.board = "watching"
  context.competitive_wind = 7
}

action "Raise Series A" {
  agent.runway = 24
  agent.mrr = 320
  context.board = "hands-off"
  risk = 0.4
  reward = 0.82
}

action "Hunker down" {
  agent.runway = 18
  agent.mrr = 150
  context.competitive_wind = 9
  risk = 0.25
  reward = 0.35
}

score growth(state) {
  base = state.reward * 1.1 - state.risk * 0.9
  if state.world.churn > 3 {
    base = base - 0.15
  }
  return clamp(base, 0, 1)
}

run {
  fork
  evaluate with growth
  collapse max-utility
}`,
          },
        ].map((ex) => (
          <div key={ex.name} className="overflow-hidden rounded-xl border border-line">
            <div className="border-b border-line bg-bg-soft p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-serif text-lg text-ink">{ex.name}</div>
                  <div className="mt-0.5 text-[12px] leading-[1.5] text-ink-dim">
                    {ex.desc}
                  </div>
                </div>
                <span className="rounded-full border border-line bg-bg px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                  {ex.lang}
                </span>
              </div>
            </div>
            <pre className="overflow-x-auto bg-bg p-4 font-mono text-[12px] leading-[1.7]">
              <code className="text-ink-dim">{ex.code}</code>
            </pre>
          </div>
        ))}
      </div>

      <Callout tone="tip" title="Run them">
        Every example runs in an approved <Link to="/access" className="text-chronos underline-offset-4 hover:underline">Chronos workspace</Link> or from the CLI with <code className="font-mono text-[12px]">chronos run</code>.
      </Callout>
    </div>
  );
}
