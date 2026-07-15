-- Phase 3 knowledge types: pdf | url | note | markdown | txt | github
do $$
begin
  alter table public.knowledge drop constraint if exists knowledge_type_check;
  alter table public.knowledge
    add constraint knowledge_type_check
    check (type in ('pdf', 'url', 'note', 'markdown', 'txt', 'github'));
exception when others then
  null;
end $$;
