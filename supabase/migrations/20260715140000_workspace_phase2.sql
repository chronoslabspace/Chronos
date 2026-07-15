-- ============================================================
-- Phase 2 Workspace schema (product model)
-- Aligns with Dashboard + goals + simulations + futures + timeline
-- ============================================================

-- Evolve workspaces
alter table if exists public.workspaces
  add column if not exists description text not null default '';

-- goals (prefer goals; keep workspace_goals as alias view if present)
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'active'
    check (status in ('active', 'paused', 'completed', 'archived')),
  priority integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists goals_workspace_id_idx
  on public.goals (workspace_id, status, priority desc);

create unique index if not exists goals_one_active_per_workspace
  on public.goals (workspace_id)
  where status = 'active';

-- Migrate rows from workspace_goals if that table exists
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'workspace_goals'
  ) then
    insert into public.goals (id, workspace_id, title, description, status, priority, created_at)
    select id, workspace_id, title, description, status, 0, created_at
    from public.workspace_goals
    on conflict (id) do nothing;
  end if;
end $$;

-- simulations: ensure columns match product model
create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  goal_id uuid references public.goals (id) on delete set null,
  title text not null default '',
  status text not null default 'queued'
    check (status in ('queued', 'running', 'completed', 'failed')),
  confidence numeric(5, 4)
    check (confidence is null or (confidence >= 0 and confidence <= 1)),
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table if exists public.simulations
  add column if not exists result jsonb not null default '{}'::jsonb;

alter table if exists public.simulations
  add column if not exists title text not null default '';

-- Point goal_id FK at goals when possible
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'goals'
  ) then
    begin
      alter table public.simulations drop constraint if exists simulations_goal_id_fkey;
      alter table public.simulations
        add constraint simulations_goal_id_fkey
        foreign key (goal_id) references public.goals (id) on delete set null;
    exception when others then
      null;
    end;
  end if;
end $$;

create index if not exists simulations_workspace_id_idx
  on public.simulations (workspace_id, created_at desc);

-- futures -----------------------------------------------------
create table if not exists public.futures (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.simulations (id) on delete cascade,
  name text not null,
  score numeric(8, 4) not null default 0,
  risk numeric(8, 4) not null default 0,
  confidence numeric(5, 4) not null default 0
    check (confidence >= 0 and confidence <= 1),
  summary text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists futures_simulation_id_idx
  on public.futures (simulation_id, score desc);

-- knowledge ---------------------------------------------------
create table if not exists public.knowledge (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  type text not null
    check (type in ('pdf', 'url', 'note', 'markdown')),
  title text not null,
  content text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Drop old type constraint if present and re-add for pdf|url|note|markdown
do $$
begin
  alter table public.knowledge drop constraint if exists knowledge_type_check;
  alter table public.knowledge
    add constraint knowledge_type_check
    check (type in ('pdf', 'url', 'note', 'markdown'));
exception when others then
  null;
end $$;

-- notes -------------------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now()
);

alter table if exists public.notes
  drop column if exists updated_at;

-- timeline_nodes ----------------------------------------------
create table if not exists public.timeline_nodes (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.simulations (id) on delete cascade,
  parent_id uuid references public.timeline_nodes (id) on delete cascade,
  title text not null,
  depth integer not null default 0 check (depth >= 0),
  score numeric(8, 4) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists timeline_nodes_simulation_id_idx
  on public.timeline_nodes (simulation_id, depth, score desc);

-- RLS ---------------------------------------------------------
alter table public.goals enable row level security;
alter table public.simulations enable row level security;
alter table public.futures enable row level security;
alter table public.knowledge enable row level security;
alter table public.notes enable row level security;
alter table public.timeline_nodes enable row level security;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces w
    where w.id = target_workspace_id
      and w.owner_id = auth.uid()
  );
$$;

create or replace function public.is_simulation_owner(target_simulation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.simulations s
    join public.workspaces w on w.id = s.workspace_id
    where s.id = target_simulation_id
      and w.owner_id = auth.uid()
  );
$$;

revoke all on function public.is_workspace_owner(uuid) from public;
revoke all on function public.is_simulation_owner(uuid) from public;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.is_simulation_owner(uuid) to authenticated;

drop policy if exists "Owners manage goals" on public.goals;
create policy "Owners manage goals"
  on public.goals for all to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

drop policy if exists "Owners manage workspace simulations" on public.simulations;
drop policy if exists "Owners manage simulations" on public.simulations;
create policy "Owners manage simulations"
  on public.simulations for all to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

drop policy if exists "Owners manage futures" on public.futures;
create policy "Owners manage futures"
  on public.futures for all to authenticated
  using (public.is_simulation_owner(simulation_id))
  with check (public.is_simulation_owner(simulation_id));

drop policy if exists "Owners manage workspace knowledge" on public.knowledge;
drop policy if exists "Owners manage knowledge" on public.knowledge;
create policy "Owners manage knowledge"
  on public.knowledge for all to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

drop policy if exists "Owners manage workspace notes" on public.notes;
drop policy if exists "Owners manage notes" on public.notes;
create policy "Owners manage notes"
  on public.notes for all to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

drop policy if exists "Owners manage timeline nodes" on public.timeline_nodes;
create policy "Owners manage timeline nodes"
  on public.timeline_nodes for all to authenticated
  using (public.is_simulation_owner(simulation_id))
  with check (public.is_simulation_owner(simulation_id));

grant select, insert, update, delete on public.goals to authenticated;
grant select, insert, update, delete on public.simulations to authenticated;
grant select, insert, update, delete on public.futures to authenticated;
grant select, insert, update, delete on public.knowledge to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.timeline_nodes to authenticated;
