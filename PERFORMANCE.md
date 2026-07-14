# Chronos Performance Architecture

Temporal compute can produce a large amount of state. Performance is a product
requirement, not a post-launch optimization.

## Feature loading

Presentation code is organized by feature so it can be loaded independently:

```text
src/presentation/features/
├── visualization/  # Branch visualization and virtualized branch rows
├── timeline/       # Virtualized execution/replay timelines
├── planner/        # Planner-oriented application surfaces
└── workspace/      # Workspace intelligence surfaces
```

Heavy dashboard features are lazy boundaries. The shell should load first;
language tooling, visualizations, and workspace intelligence should load only
when their route or tab needs them.

The current codebase uses React lazy boundaries for the dashboard engine,
Chronos Language, documentation, changelog, system architecture, and non-home
route compositions.

> The current Vite single-file plugin intentionally inlines chunks for demo
> distribution. Before production deployment to `chronoslab.space`, remove that
> delivery constraint and retain Vite's emitted chunks so browser code splitting
> can reduce first-load JavaScript.

## Virtualized rendering

Do not mount thousands of branch or timeline rows simultaneously.

- `VirtualBranchList` switches in for branch sets larger than 60.
- `VirtualTimelineEvents` renders execution logs through a fixed-height window.
- `VirtualList` mounts only visible rows plus overscan, using absolute row
  placement and a full-height scroll spacer.

This keeps DOM work proportional to viewport height, not simulation size.

## Simulation cache

Result keys are deterministic hashes of:

```text
prompt
workspaceId
modelVersion
configuration
```

The key is created with canonical JSON serialization so configuration object
key order cannot cause false cache misses.

```text
domain/chronos/simulation-cache.ts
        ↓
application/planner/StartupSimulationService.ts
        ↓
MemorySimulationCache (browser/demo)
or SupabaseSimulationCache (trusted API/edge worker)
```

The browser uses session memory for public demos. Shared Supabase caching must
run behind a trusted API or edge function: prompts and simulation payloads must
not become readable by unrelated browser clients.

## Cache invalidation

Never reuse results when any of these change:

- prompt content
- workspace identity
- world-model version
- model version
- planner/evaluator configuration
- decision horizon or branch budget

Set an `expiresAt` value when model-driven results can age. For deterministic
engine-only simulations, a cache entry may remain valid indefinitely as long as
the engine and configuration versions stay in the key.