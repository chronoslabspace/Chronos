# Implementation Plan: P1 — Decision pipeline UX

**Source of truth:** [SPEC.md](SPEC.md) (approved)  
**What's next:** Execute this plan (domain → engine phase timeline → UI contract → copy → e2e). Do **not** start a DecisionEngine rewrite.

## Overview

Make Chronos *feel* like decision infrastructure: real engine lifecycle phases (with 200–400 ms min dwell for instant phases), a fixed result-page contract (Goal → Summary → Evidence → Recommendation → Why → Expected Value → Compare → Next → Save Decision → Memory), deterministic expected-value rules, and a hard-gate until the user saves a path. All on existing SimulationEngine + Decision Report surfaces.

## Architecture decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Phase source | Real `plan \| generate \| evaluate \| rank \| collapse` from engine tasks | Spec: never fake reasoning |
| Sync run UX | Engine returns final `tasks[]`; UI **replays** completed phases with min dwell after `await` | Today `SimulationEngine.run()` is one-shot (no streaming). Replay still uses real phases. |
| Future async | Same strip consumes phase events; no UI redesign when workers land | Spec F1 |
| Evidence / EV | Pure domain helpers, unit-tested | Explainable beta |
| Compare | `scrollIntoView` → `#compare-alternatives` | No second mode |
| Scope | Workspace sim only | Marketing demo out |

### Phase label mapping (UI)

| Engine phase | User label |
|--------------|------------|
| plan | Understanding goal · Retrieving knowledge (one phase or two labels from same `plan` task if knowledge count known) |
| generate | Generating candidate futures |
| evaluate | Evaluating trade-offs |
| rank | Ranking outcomes |
| collapse | Preparing decision report |
| (post) path saved | Decide complete |

### Result page contract (UI + markdown export)

```text
Goal → Simulation Summary → Evidence → Recommendation → Why
  → Expected Value → Compare Alternatives → Next Actions → Save Decision → Memory
```

## Dependency graph

```text
S1 Domain: phases + dwell + evidence + EV
    │
    ├── S2 Persist/expose honest counts on sim result (if missing)
    │
    ├── S3 Pipeline strip (run busy + detail replay)
    │
    └── S4 DecisionReportCard contract + export + scroll Compare
              │
              ├── S5 Onboarding / checklist / pulse copy
              │
              └── S6 E2E + acceptance
```

## Task list

### Phase 1: Domain foundation

#### Task 1 — Phase model + min-dwell helper
- **Files:** `src/domain/workspace/decisionPipeline.ts`, `decisionPipeline.test.ts`
- **Acceptance:**
  - [ ] Const stages/phases + map engine `tasks[]` → ordered lifecycle events
  - [ ] Helper: given completed tasks, produce display sequence; min dwell 200–400 ms configurable (default 300)
  - [ ] Decide stage complete iff `chosen_future_id` present
- **Verify:** `npx vitest run src/domain/workspace/decisionPipeline.test.ts`
- **Size:** S

#### Task 2 — Evidence + Expected Value pure functions
- **Files:** `src/domain/workspace/evidence.ts`, `expectedValue.ts` (+ tests), extend `decisionReport.ts` types if needed
- **Acceptance:**
  - [ ] Evidence: knowledge count, constraints count, strategies generated, criteria checklist (Risk/Cost/Timeline/Resources/Growth)
  - [ ] EV rows from rule table; omit rows when signals missing; optional one-line reason; no LLM
  - [ ] Unit tests cover rule fire/omit cases
- **Verify:** `npx vitest run src/domain/workspace/evidence.test.ts src/domain/workspace/expectedValue.test.ts src/domain/workspace/decisionReport.test.ts`
- **Size:** M

### Checkpoint A
- [ ] Domain tests green; no UI yet

### Phase 2: Engine / result payload honesty

#### Task 3 — Ensure sim result carries pipeline data
- **Files:** `SimulationEngine.ts` (task titles aligned to product labels if needed), `WorkspaceService.ts` result fields, types
- **Acceptance:**
  - [ ] Completed sim stores `tasks` with final statuses (already partially true)
  - [ ] `pathsEvaluated`, `disqualifiedCount`, futures length available to report/summary (persist on `result` if not already)
  - [ ] No fake async; no artificial engine sleeps
- **Verify:** existing `SimulationEngine.test.ts` + dual-write/product loop still pass
- **Size:** S–M

### Phase 3: UI pipeline + report contract

#### Task 4 — `DecisionPipelineStrip`
- **Files:** `DecisionPipelineStrip.tsx`, wire `SimulationPages.tsx` (list form busy + detail)
- **Acceptance:**
  - [ ] During/after run: show real phases; post-run **replay** with min dwell if all completed instantly
  - [ ] Detail: compute phases ✓; Decide ✓ only after path saved
  - [ ] Accessible (`aria-current`)
- **Verify:** manual + unit for pure progress if any; tsc
- **Size:** M

#### Task 5 — Decision Report contract layout
- **Files:** `DecisionReportCard.tsx`, `decisionReport.ts` export, `FutureComparison.tsx` (`id="compare-alternatives"`), detail page CTAs
- **Acceptance:**
  - [ ] Section order matches contract (incl. Evidence + EV)
  - [ ] Compare CTA scrolls to alternatives
  - [ ] Save decision / Re-run hard-gate when no `chosen_future_id`
  - [ ] Markdown export same order
- **Verify:** `decisionReport.test.ts` export order; manual scroll
- **Size:** M

### Checkpoint B
- [ ] One manual happy path: run → phases flash → report contract → compare scroll → save path → Decide ✓

### Phase 4: Copy + gates

#### Task 6 — Decision language + checklist/pulse
- **Files:** `WorkspaceOnboarding.tsx`, `betaChecklist.ts`, pulse/dashboard next-action copy
- **Acceptance:**
  - [ ] Goal: “What decision are you trying to make?”
  - [ ] Checklist memory: choose path records decision
  - [ ] Pulse prefers “Choose a path” when report exists, path not saved
  - [ ] No “ask anything” phrasing on onboarding/sim create
- **Verify:** onboarding/betaChecklist/pulse unit tests if present
- **Size:** S

### Phase 5: E2E

#### Task 7 — Playwright decision-workspace
- **Files:** `e2e/decision-workspace.spec.ts`
- **Acceptance:**
  - [ ] Pipeline/evidence/why or EV visible on result
  - [ ] Save path path completes decide/memory gate
  - [ ] Stable selectors (data-testid preferred)
- **Verify:** `npx playwright test e2e/decision-workspace.spec.ts` + `npx tsc --noEmit`
- **Size:** S–M

### Checkpoint C — Done
- [ ] SPEC success criteria 1–6 met
- [ ] CI green on PR

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| One-shot engine = no live mid-run updates | Med | Replay real tasks with min dwell; document for async later |
| EV heuristics feel arbitrary | Med | Unit-tested rules; omit when unknown |
| Report card becomes huge | Low | Compact Evidence/EV rows; keep Decide CTAs sticky-ish |
| E2E flakiness on dwell | Med | Assert final state; don’t assert intermediate dwell frames |

## Out of scope (do not schedule)

DecisionEngine rename · DB migrations · LLM EV · dedicated compare workspace · marketing demo · Phase 03 cloud

## PR strategy

Prefer 2–3 PRs: (1) domain+engine payload, (2) strip+report UI, (3) copy+e2e — or one PR if small enough with clean commits.

## Immediate next action

After plan approval: **implement Task 1** (domain phase model + tests), then Task 2 — TDD per project skills.

## Commands (verify)

```bash
npx tsc --noEmit
npx vitest run src/domain/workspace/
npx playwright test e2e/decision-workspace.spec.ts
```
