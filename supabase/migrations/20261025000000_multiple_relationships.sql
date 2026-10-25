-- "How did you know him?" now allows several answers per memory.
alter table public.memories drop constraint if exists memories_relationship_check;
alter table public.memories alter column relationship type text[] using array[relationship];
alter table public.memories rename column relationship to relationships;
alter table public.memories add constraint memories_relationships_check
  check (cardinality(relationships) between 1 and 20);
