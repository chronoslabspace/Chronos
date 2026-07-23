# Spec: P1 — Decision pipeline UX (public beta)

**Status:** Approved (product decisions locked) — ready for `/plan`  
**Scope:** Make existing intelligence *observable*. No new engines, no Phase 03 cloud.

## Locked product decisions

| # | Decision | Verdict |
|---|----------|---------|
| 1 | Running stages | **Real engine phases only.** Never fake reasoning. Instant phases: show **200–400 ms** so the pipeline is legible. Long phases: stay live until complete. Same UI works when async workers land later. |
| 2 | Expected value | **Deterministic rule table** (explainable heuristics). No AI ROI. Later: replace with learned models from real outcomes. |
| 3 | Compare CTA | **Scroll in-page** to alternatives comparison. No dedicated compare mode in beta. |
| 4 | Evidence | **Required section** — proves work was done without exposing internal chain-of-thought. |

---

## Assumptions (locked unless reopened)

1. **Workspace sim only** — onboarding, sim run/detail, Decision Report. Public marketing demo out of scope.  
2. **No schema migration** — stages + evidence + EV from engine tasks/result + knowledge/goal counts.  
3. **N futures honest** — never pad to a fixed count.  
4. **Decide hard-gate** — beta “done” for path memory requires save path (or explicit re-run path); outcome logging still optional after save.  
5. **Incremental PRs** after `/plan`.

---

## Objective

**Who:** First-time public beta user (skeptical of “AI answers”).  
**Problem:** Correct backend loop still *feels* like input → answer.  
**Build:** Visible decision pipeline; recommendation is not the end.

### Product rule

```text
Understand → Explore → Evaluate → Recommend → Decide → (Memory)
```

Chronos recommends. User decides. Memory = decisions/outcomes, not chat.

### Result page contract (every simulation)

Standard section order — **product contract**:

```text
Goal
  → Simulation Summary
  → Evidence
  → Recommendation ⭐
  → Why This Was Chosen
  → Expected Value
  → Compare Alternatives   (in-page target; scroll CTA)
  → Next Actions
  → Save Decision          (hard-gate until path saved)
  → Memory                 (outcome tracking; after path saved)
```

This order is authoritative for UI + markdown export. Supersedes earlier draft order.

---

## Tech stack

Existing SPA (no new deps):

| Layer | Use |
|-------|-----|
| Domain | `decisionReport.ts`, `SimulationEngine` phases/tasks, new `decisionPipeline.ts` + EV/evidence helpers |
| App | `WorkspaceService` (run, choose path, re-run) |
| UI | `SimulationPages`, `DecisionReportCard`, `FutureComparison` (scroll target `id`), onboarding, checklist, pulse |
| Tests | Vitest; Playwright `e2e/decision-workspace.spec.ts` |

---

## Commands

```bash
npm run dev
npx tsc --noEmit
npx vitest run
npx playwright test e2e/decision-workspace.spec.ts
```

---

## Project structure (touch points)

```text
src/domain/workspace/
  decisionPipeline.ts     # NEW: phases, min dwell, stage progress
  expectedValue.ts        # NEW: deterministic rule table
  evidence.ts             # NEW: counts + criteria from home/sim/result
  decisionReport.ts       # compose Evidence + EV into report / export
  betaChecklist.ts
  onboarding.ts
src/application/simulation/
  SimulationEngine.ts     # ensure task phases emit lifecycle usable by UI
  # if run is one-shot: return ordered phase timeline in result for replay
src/presentation/features/simulation/
  SimulationPages.tsx
  components/
    DecisionPipelineStrip.tsx   # NEW
    DecisionReportCard.tsx
    FutureComparison.tsx        # id="compare-alternatives" (or stable)
e2e/decision-workspace.spec.ts
SPEC.md
```

---

## Code style

- Pure domain for pipeline / EV / evidence; UI only renders.  
- Copy: decision language only — never “chat” / “ask anything.”  
- Phase labels are **lifecycle events**, not invented reasoning.

---

## Feature requirements

### F1 — Pipeline strip (real phases)

**Engine lifecycle events (display labels — map from existing phases):**

| Event | Maps from (engine) |
|-------|--------------------|
| Understanding goal | `plan` start / signals |
| Retrieving knowledge | knowledge resolve in plan |
| Generating candidate futures | `generate` |
| Evaluating trade-offs | `evaluate` |
| Ranking outcomes | `rank` |
| Preparing decision report | `collapse` / complete |

Product-facing **Decide** stage remains after report: complete only when path saved.

| ID | Requirement |
|----|-------------|
| F1.1 | Advance strip only from **real** phase transitions (or a completed phase timeline returned with the result). **Never** invent phases the engine did not run. |
| F1.2 | If a phase completes in &lt; 200 ms, UI still shows it active/complete for **200–400 ms** (min dwell) before advancing — legibility only, not fake work. |
| F1.3 | If a phase is in progress longer than dwell, stay on that phase until the engine marks it done. |
| F1.4 | One-shot browser run: engine (or runner) must provide an **ordered list of completed phases** so the UI can replay with min dwell after the request returns. Prefer instrumenting task status updates during the run when available. |
| F1.5 | On completed detail: strip shows all compute phases ✓; **Decide** ✓ only if `chosen_future_id` set. |
| F1.6 | Accessible list with `aria-current` on active phase. |

**Never:** spinner-only run; random delays; “thinking” copy disconnected from phases.

### F2 — Result page sections

| Order | Section | Content |
|------:|---------|---------|
| 1 | Goal | Decision title + objective |
| 2 | Simulation summary | Honest counts (paths evaluated, futures returned, disqualified) when present |
| 3 | Evidence | See F2-E |
| 4 | Recommendation | Best / recommended path name + summary + confidence |
| 5 | Why this was chosen | `recommendedBecause` + `why` |
| 6 | Expected value | See F2-EV |
| 7 | Compare alternatives | Scorecards; element `id` for scroll target |
| 8 | Next actions | Existing next actions / risks as needed |
| 9 | Save decision | Primary: save recommended path; secondary: Compare (scroll), Re-run |
| 10 | Memory | Outcome tracking — only after path saved |

#### F2-E — Evidence (“Did it actually think?”)

Deterministic counts + checklist — **no internal CoT**:

| Field | Source (examples) |
|-------|-------------------|
| Knowledge sources used | `contextUsed.length` / home knowledge+notes used in run |
| Constraints evaluated | constraints on sim result / input |
| Strategies generated | futures count (honest N) |
| Evaluation criteria | Fixed set checked if used in scoring: Risk, Cost, Timeline, Resources, Growth potential |

| ID | Requirement |
|----|-------------|
| F2.E1 | Evidence section always present on completed report. |
| F2.E2 | Criteria list is declarative (✓/—), not free-form model text. |
| F2.E3 | Export includes Evidence. |

#### F2-EV — Expected value (rule table)

**Dimensions (beta):** goal alignment · risk reduction · time saved · cost impact · confidence · knowledge coverage.

Present as scannable rows (label + level/value), optional one-line **Reason** from rules — not LLM prose.

Example shape (illustrative values from rules):

```text
Expected Value
  Risk reduction     High
  Time saved         ~8–12 hours   (only if rule fires; else omit row)
  Execution confidence  91%
Reason: Constraints favor incremental validation over immediate scale.
```

| ID | Requirement |
|----|-------------|
| F2.V1 | Pure function `deriveExpectedValue(reportInputs) → { rows, reason? }` with unit tests for each rule. |
| F2.V2 | Omit rows when signal missing — never invent metrics. |
| F2.V3 | No LLM; no fake currency ROI. |

#### F2 — Other

| ID | Requirement |
|----|-------------|
| F2.1 | `DecisionReportCard` + markdown export match contract order. |
| F2.2 | Header: `Engine recommendation` → `Path saved` after choose. |
| F2.3 | **Compare alternatives** control scrolls to in-page comparison (`scrollIntoView`); no route change. |
| F2.4 | Alternatives: score / risk / confidence per future — not a single % as the only comparison. |

### F3 — Decide hard-gate

| ID | Requirement |
|----|-------------|
| F3.1 | Without `chosen_future_id`: primary **Save decision** (recommended path); **Compare alternatives** (scroll); **Run again**. |
| F3.2 | Beta checklist copy: choose path so Chronos records the decision. |
| F3.3 | Pulse next action: prefer “Choose a path” when report exists and path not saved. |

### F4 — Decision language

| ID | Requirement |
|----|-------------|
| F4.1 | Goal step: **“What decision are you trying to make?”** |
| F4.2 | Helper frames decision under evaluation — not a chat prompt. |
| F4.3 | Ban “Ask anything” / assistant phrasing on onboarding + sim create. |

### F5 — Honesty

| ID | Requirement |
|----|-------------|
| F5.1 | Surface paths evaluated / strategies generated / disqualified when available. |
| F5.2 | Never claim a fixed five futures. |

---

## Out of scope (P1)

- DecisionEngine rename / rewrite  
- Supabase migrations  
- LLM value or evidence prose  
- Dedicated multi-future compare workspace  
- Decision history product (P2)  
- Marketing demo redesign  
- Async workers (UI must *tolerate* them via phase events only)

---

## Testing strategy

| Level | What |
|-------|------|
| Unit | Phase timeline + min dwell helper; EV rules; evidence counts; export section order |
| E2E | Stage strip / phase labels visible on run or result; Evidence + Why + EV on report; Compare scrolls; save path completes Decide |

Prove: path-not-saved ⇒ Decide incomplete; path-saved ⇒ complete.

---

## Boundaries

**Always:** real phases; min dwell only for legibility; dual-write/UUID intact; tsc + vitest + decision-workspace e2e green.  

**Ask first:** DB persistence of phases; scoring formula changes; new deps.  

**Never:** fake reasoning delays; pad futures; secrets in `VITE_`; chat transcript as report.

---

## Success criteria

1. Run UI shows **real** lifecycle phases (with 200–400 ms min dwell when instant).  
2. Every completed sim detail matches **result page contract** (including Evidence + EV + scroll Compare).  
3. Save decision hard-gate works; checklist/pulse copy aligned.  
4. Onboarding decision prompt shipped.  
5. Unit + e2e green; no new backend surface.

---

## Implementation slices (input to `/plan`)

| Slice | Deliverable |
|-------|-------------|
| S1 | Domain: phase timeline + min dwell; evidence; EV rules + tests |
| S2 | Engine/runner: expose phase lifecycle (live or post-run ordered events) |
| S3 | `DecisionPipelineStrip` on run + detail |
| S4 | Decision Report contract layout + export + scroll Compare |
| S5 | Onboarding + checklist + pulse copy |
| S6 | E2E + acceptance |

---

## Open questions

*None blocking.* Optional later: exact EV numeric bands (High/Med/Low thresholds) — implementer may use sensible defaults documented in unit tests.

---

## Approval

- [x] Product direction (5-stage pipeline + hard-gate Decide)  
- [x] Real engine phases + min dwell (no fake reasoning)  
- [x] Deterministic EV rule table  
- [x] Compare = in-page scroll  
- [x] Evidence section + final result page contract  
- [x] Eng: no engine *rewrite* / no migration (phase emission OK)

**Next:** `/plan` → `tasks/plan.md` + `tasks/todo.md`
