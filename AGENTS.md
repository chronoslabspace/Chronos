# Chronos — agent instructions

Chronos is **decision infrastructure** (branch → simulate → evaluate → collapse), not a chatbot.

Prefer technical accuracy, systems thinking, scalability, and minimal design. Distinguish current implementation from roadmap.

## Skills

Project skills live in [`.agents/skills/`](./.agents/skills/) (symlinked for Grok/Claude at `.grok/skills` and `.claude/skills`).

| Source | Skills |
|--------|--------|
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | 24 lifecycle skills (spec → plan → build → test → review → ship) |
| Supabase | `supabase`, `supabase-postgres-best-practices`, `supabase-server` |

Lockfile: [`skills-lock.json`](./skills-lock.json). Restore/update:

```bash
npx skills experimental_install          # from lockfile
npx skills update -p -y                  # project skills to latest
npx skills add addyosmani/agent-skills --skill '*' -y -a grok
```

### Lifecycle commands

Flat slash commands in [`.agents/commands/`](./.agents/commands/):

| Command | Primary skill |
|---------|----------------|
| `/spec` | `spec-driven-development` |
| `/plan` | `planning-and-task-breakdown` |
| `/build` | `incremental-implementation` + TDD |
| `/test` | `test-driven-development` |
| `/review` | `code-review-and-quality` |
| `/code-simplify` | `code-simplification` |
| `/ship` | `shipping-and-launch` |
| `/webperf` | web performance auditor persona |

Load skills **selectively** by task — do not dump the whole pack into context.

### Meta

Start ambiguous sessions with `using-agent-skills` to map work to the right workflow.

### References & personas

- Checklists: [`references/`](./references/)
- Review personas: [`agents/`](./agents/) (`code-reviewer`, `test-engineer`, `security-auditor`, `web-performance-auditor`)

## Chronos stack (current)

| Layer | Location |
|-------|----------|
| Temporal engine | `src/application/chronos/engine.ts` — `fork` / `evaluate` / `collapse` / `run` |
| Agent run orchestration | `src/application/chronos/AgentSimulationRunner.ts` |
| Product decision sims | `src/application/simulation/SimulationEngine.ts` |
| Agents (Forge / Oracle / Atlas) | `src/domain/chronos/agents.ts` |
| Workspace dual-write | `src/application/workspace/WorkspaceService.ts` |
| Supabase client | `src/infrastructure/supabase/client.ts` |

## Quality bar

- Prefer tests that prove decision outcomes (unit on engine/scorers; E2E on auth + decision loop).
- Never commit secrets. Browser env is `VITE_SUPABASE_*` only; server secrets never use `VITE_`.
- Empty/missing Supabase env must not crash the SPA (`isSupabaseConfigured`).
