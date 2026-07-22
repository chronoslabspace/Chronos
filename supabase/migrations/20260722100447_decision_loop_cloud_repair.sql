-- ============================================================
-- Decision-loop cloud repair
-- Hosted audit (2026-07-22): tables exist, but anon analytics insert
-- fails RLS/grants; reaffirm authenticated EXECUTE + table grants.
-- Idempotent — safe on projects that already applied prior repairs.
-- ============================================================

-- Events: product analytics dual-write (anon + authenticated insert)
grant usage on schema public to anon, authenticated;

alter table public.events enable row level security;

drop policy if exists "Anon can insert events" on public.events;
create policy "Anon can insert events"
  on public.events for insert
  to anon, authenticated
  with check (true);

grant insert on table public.events to anon;
grant select, insert on table public.events to authenticated;

-- Workspace ownership helpers (RLS policies call these under authenticated)
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.workspace_role(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.is_simulation_owner(uuid) to authenticated;

-- Product tables: authenticated CRUD (RLS still scopes rows)
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.goals to authenticated;
grant select, insert, update, delete on public.simulations to authenticated;
grant select, insert, update, delete on public.futures to authenticated;
grant select, insert, update, delete on public.knowledge to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.timeline_nodes to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update on public.profiles to authenticated;
