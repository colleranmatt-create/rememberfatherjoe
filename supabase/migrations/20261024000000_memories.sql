-- Memories shared by visitors. Every row starts as 'pending' and only
-- appears on the public wall once an admin approves it.
create table public.memories (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  approved_at  timestamptz,
  status       text not null default 'pending'
               check (status in ('pending', 'approved', 'rejected')),
  name         text not null check (char_length(name) between 1 and 120),
  relationship text not null check (char_length(relationship) between 1 and 60),
  relationship_detail text check (char_length(relationship_detail) <= 120),
  year_from    int check (year_from between 1900 and 2100),
  year_to      int check (year_to between 1900 and 2100),
  location     text check (char_length(location) <= 120),
  memory       text not null check (char_length(memory) between 1 and 10000),
  photo_paths  text[] not null default '{}' check (cardinality(photo_paths) <= 5),
  youtube_url  text check (char_length(youtube_url) <= 300),
  email        text check (char_length(email) <= 254) -- private: never shown publicly
);

create index memories_status_created_at_idx on public.memories (status, created_at desc);

-- All reads and writes go through the site's server using the service role key.
-- RLS is on with no policies, so the public anon key can't read emails or
-- pending submissions even if someone calls the Supabase API directly.
alter table public.memories enable row level security;
revoke all on public.memories from anon, authenticated;

-- Photo storage. The bucket is public so approved photos load fast from the CDN;
-- uploads are only possible through short-lived signed URLs the server hands out.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memory-photos', 'memory-photos', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
