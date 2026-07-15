-- Simulation lineage / versioning for persistent memory
alter table public.simulations
  add column if not exists version integer not null default 1;

alter table public.simulations
  add column if not exists lineage_id text;

alter table public.simulations
  add column if not exists parent_simulation_id uuid references public.simulations (id) on delete set null;

create index if not exists simulations_lineage_id_idx
  on public.simulations (lineage_id, version desc);

-- Backfill lineage for existing rows
update public.simulations
set lineage_id = id::text
where lineage_id is null;
