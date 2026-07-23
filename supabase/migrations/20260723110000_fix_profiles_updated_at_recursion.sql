-- ============================================================
-- Fix: refresh_updated_at_if_column_exists stack overflow
-- ============================================================
-- Symptom (API/Postgres logs):
--   54001 stack depth limit exceeded
-- on public.profiles upsert (login bootstrap) and other tables
-- using this trigger (decisions, workspace_goals, notes).
--
-- Root cause: BEFORE UPDATE trigger issued a nested UPDATE on the
-- same row, re-firing itself infinitely.
--
-- Fix: set NEW.updated_at only; never UPDATE inside the trigger.
-- ============================================================

create or replace function public.refresh_updated_at_if_column_exists()
returns trigger
language plpgsql
set search_path to pg_catalog, public
as $$
begin
  -- Mutate NEW only. Nested UPDATE re-enters this trigger → 54001.
  if exists (
    select 1
    from information_schema.columns
    where table_schema = TG_TABLE_SCHEMA
      and table_name = TG_TABLE_NAME
      and column_name = 'updated_at'
  ) then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

-- Drop orphan trigger if notes has no updated_at (function becomes a no-op either way)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notes' and column_name = 'updated_at'
  ) then
    drop trigger if exists notes_updated_at on public.notes;
  end if;
end;
$$;
