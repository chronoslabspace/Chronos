# Chronos Test Strategy

Chronos is a simulation platform. The engine is the product, so automated
coverage is organized by the risk it protects.

```text
src/application/chronos/engine.test.ts
  Unit tests: fork, evaluate, collapse, strategy selection, lifecycle guards

src/domain/chronos/simulation.integration.test.ts
  Integration tests: Chronos language -> compiler -> engine -> outcome

src/application/planner/StartupSimulationService.test.ts
  Cache tests: stable key generation and compute-once/cache-hit behavior

src/presentation/features/visualization/VirtualList.test.tsx
  Rendering tests: only visible branch rows are mounted as the viewport changes

src/application/workspace/SimulationLearningService.test.ts
  Learning tests: successful futures and failure patterns become workspace evidence

src/application/planner/StartupLaunchPlanner.test.ts
  Planner tests: objective -> dependency-aware task decomposition

src/application/chronos/TemporalBranchService.test.ts
  Temporal versioning tests: subbranch lineage, merge records, collapse history

src/domain/chronos/timeline.snapshot.test.ts
  Snapshot tests: deterministic replayable timeline records

e2e/chronos-workflows.spec.ts
  End-to-end tests: landing live demo, qualified dashboard access workflow, and startup simulator workflow
```

## Run locally

```bash
# Unit, integration, and snapshot suites
npx vitest run

# Watch mode while developing engine behavior
npx vitest

# Browser workflows (install Chromium once first)
npx playwright install chromium
npx playwright test

# Coverage report
npx vitest run --coverage
```

## Testing rules

- Every new engine transition must have a unit test.
- Every new Chronos language construct must have an integration test.
- Every cache-key input (prompt, workspace, model version, configuration) must
  have a test proving it invalidates the previous result when changed.
- Timeline schema changes require an intentional snapshot update.
- A user-visible workflow must have an E2E test before release.
- Keep the simulation engine deterministic: inject time and randomness at the
  application boundary, never inside domain scoring rules.