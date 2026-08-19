begin;

set local lock_timeout = '5s';
set local statement_timeout = '2min';

create or replace function public.obserra_owner_lms_authorized()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from identity_private.provider_links l
      join identity_private.subjects s
        on s.principal_id = l.principal_id
      join auth.sessions ses
        on ses.user_id = l.provider_subject
     where l.provider = 'supabase'
       and l.provider_subject = auth.uid()
       and l.status = 'active'
       and s.status = 'active'
       and s.internal_identity = true
       and s.roles @> array['owner']::text[]
       and auth.jwt() ->> 'aal' = 'aal2'
       and ses.id::text = auth.jwt() ->> 'session_id'
  );
$$;

revoke all on function public.obserra_owner_lms_authorized() from public, anon;
grant execute on function public.obserra_owner_lms_authorized() to authenticated;

create table public.owner_lms_course_assets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  object_path text not null unique check (char_length(object_path) between 3 and 500),
  file_name text not null check (char_length(file_name) between 1 and 180),
  title text not null check (char_length(title) between 1 and 180),
  content_type text not null check (char_length(content_type) between 3 and 160),
  size_bytes bigint not null check (size_bytes between 1 and 104857600),
  media_kind text not null check (media_kind in ('powerpoint','slides','image','video')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.owner_lms_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  release_sha text not null check (release_sha ~ '^[0-9a-f]{40}$'),
  daily_room_name text check (daily_room_name is null or daily_room_name ~ '^[A-Za-z0-9_-]{1,128}$'),
  room_expires_at timestamptz not null,
  status text not null default 'live' check (status in ('live','break','ended')),
  media_mode text not null default 'browser_webrtc' check (media_mode in ('browser_webrtc','daily')),
  title text not null default 'Florida Class D Owner Rehearsal' check (char_length(title) between 1 and 160),
  break_started_at timestamptz,
  break_ends_at timestamptz,
  break_label text check (break_label is null or char_length(break_label) between 1 and 120),
  active_course_asset_id uuid references public.owner_lms_course_assets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, daily_room_name),
  check ((status = 'break' and break_started_at is not null and break_ends_at is not null and break_ends_at > break_started_at) or status <> 'break'),
  check ((media_mode = 'daily' and daily_room_name is not null) or media_mode = 'browser_webrtc')
);

create table public.owner_lms_notes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  session_id uuid not null references public.owner_lms_sessions(id) on delete cascade,
  note_text text not null default '' check (char_length(note_text) <= 20000),
  saved_at timestamptz not null default now(),
  unique (owner_user_id, session_id)
);

create table public.owner_lms_messages (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  session_id uuid not null references public.owner_lms_sessions(id) on delete cascade,
  sender_surface text not null check (sender_surface in ('instructor','learner_1','learner_2','learner_3')),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.owner_lms_participants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  session_id uuid not null references public.owner_lms_sessions(id) on delete cascade,
  surface text not null check (surface in ('learner_1','learner_2','learner_3')),
  display_name text not null check (char_length(display_name) between 1 and 80),
  status text not null default 'connected' check (status in ('connected','away','disconnected')),
  hand_raised boolean not null default false,
  last_seen_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, surface)
);

create index owner_lms_sessions_owner_created_idx on public.owner_lms_sessions (owner_user_id, created_at desc);
create index owner_lms_messages_session_created_idx on public.owner_lms_messages (session_id, created_at asc);
create index owner_lms_course_assets_owner_created_idx on public.owner_lms_course_assets (owner_user_id, created_at desc);
create index owner_lms_participants_session_seen_idx on public.owner_lms_participants (session_id, last_seen_at desc);

alter table public.owner_lms_course_assets enable row level security;
alter table public.owner_lms_course_assets force row level security;
alter table public.owner_lms_sessions enable row level security;
alter table public.owner_lms_sessions force row level security;
alter table public.owner_lms_notes enable row level security;
alter table public.owner_lms_notes force row level security;
alter table public.owner_lms_messages enable row level security;
alter table public.owner_lms_messages force row level security;
alter table public.owner_lms_participants enable row level security;
alter table public.owner_lms_participants force row level security;

create policy owner_lms_course_assets_owner_all on public.owner_lms_course_assets for all to authenticated
  using (owner_user_id = auth.uid() and public.obserra_owner_lms_authorized())
  with check (owner_user_id = auth.uid() and public.obserra_owner_lms_authorized());
create policy owner_lms_sessions_owner_all on public.owner_lms_sessions for all to authenticated
  using (owner_user_id = auth.uid() and public.obserra_owner_lms_authorized())
  with check (owner_user_id = auth.uid() and public.obserra_owner_lms_authorized());
create policy owner_lms_notes_owner_all on public.owner_lms_notes for all to authenticated
  using (owner_user_id = auth.uid() and public.obserra_owner_lms_authorized())
  with check (owner_user_id = auth.uid() and public.obserra_owner_lms_authorized());
create policy owner_lms_messages_owner_all on public.owner_lms_messages for all to authenticated
  using (owner_user_id = auth.uid() and public.obserra_owner_lms_authorized())
  with check (owner_user_id = auth.uid() and public.obserra_owner_lms_authorized());
create policy owner_lms_participants_owner_all on public.owner_lms_participants for all to authenticated
  using (owner_user_id = auth.uid() and public.obserra_owner_lms_authorized())
  with check (owner_user_id = auth.uid() and public.obserra_owner_lms_authorized());

revoke all on table public.owner_lms_course_assets, public.owner_lms_sessions, public.owner_lms_notes, public.owner_lms_messages, public.owner_lms_participants from public, anon;
grant select, insert, update, delete on table public.owner_lms_course_assets, public.owner_lms_sessions, public.owner_lms_notes, public.owner_lms_messages, public.owner_lms_participants to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'owner-lms-courseware',
  'owner-lms-courseware',
  false,
  104857600,
  array[
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]::text[]
);

create policy owner_lms_storage_select on storage.objects for select to authenticated
  using (bucket_id = 'owner-lms-courseware' and (storage.foldername(name))[1] = auth.uid()::text and public.obserra_owner_lms_authorized());
create policy owner_lms_storage_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'owner-lms-courseware' and (storage.foldername(name))[1] = auth.uid()::text and public.obserra_owner_lms_authorized());
create policy owner_lms_storage_update on storage.objects for update to authenticated
  using (bucket_id = 'owner-lms-courseware' and (storage.foldername(name))[1] = auth.uid()::text and public.obserra_owner_lms_authorized())
  with check (bucket_id = 'owner-lms-courseware' and (storage.foldername(name))[1] = auth.uid()::text and public.obserra_owner_lms_authorized());
create policy owner_lms_storage_delete on storage.objects for delete to authenticated
  using (bucket_id = 'owner-lms-courseware' and (storage.foldername(name))[1] = auth.uid()::text and public.obserra_owner_lms_authorized());

alter publication supabase_realtime add table public.owner_lms_messages;
alter publication supabase_realtime add table public.owner_lms_sessions;
alter publication supabase_realtime add table public.owner_lms_participants;

commit;
