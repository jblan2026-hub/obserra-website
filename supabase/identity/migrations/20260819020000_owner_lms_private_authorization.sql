begin;

set local lock_timeout = '5s';
set local statement_timeout = '2min';

create schema if not exists owner_lms_private;
revoke all on schema owner_lms_private from public, anon, authenticated, service_role;

create or replace function owner_lms_private.obserra_owner_lms_authorized()
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

revoke all on function owner_lms_private.obserra_owner_lms_authorized() from public, anon, authenticated, service_role;
grant usage on schema owner_lms_private to authenticated;
grant execute on function owner_lms_private.obserra_owner_lms_authorized() to authenticated;

drop policy if exists owner_lms_course_assets_owner_all on public.owner_lms_course_assets;
create policy owner_lms_course_assets_owner_all on public.owner_lms_course_assets for all to authenticated
  using (owner_user_id = auth.uid() and owner_lms_private.obserra_owner_lms_authorized())
  with check (owner_user_id = auth.uid() and owner_lms_private.obserra_owner_lms_authorized());

drop policy if exists owner_lms_sessions_owner_all on public.owner_lms_sessions;
create policy owner_lms_sessions_owner_all on public.owner_lms_sessions for all to authenticated
  using (owner_user_id = auth.uid() and owner_lms_private.obserra_owner_lms_authorized())
  with check (owner_user_id = auth.uid() and owner_lms_private.obserra_owner_lms_authorized());

drop policy if exists owner_lms_notes_owner_all on public.owner_lms_notes;
create policy owner_lms_notes_owner_all on public.owner_lms_notes for all to authenticated
  using (owner_user_id = auth.uid() and owner_lms_private.obserra_owner_lms_authorized())
  with check (owner_user_id = auth.uid() and owner_lms_private.obserra_owner_lms_authorized());

drop policy if exists owner_lms_messages_owner_all on public.owner_lms_messages;
create policy owner_lms_messages_owner_all on public.owner_lms_messages for all to authenticated
  using (owner_user_id = auth.uid() and owner_lms_private.obserra_owner_lms_authorized())
  with check (owner_user_id = auth.uid() and owner_lms_private.obserra_owner_lms_authorized());

drop policy if exists owner_lms_participants_owner_all on public.owner_lms_participants;
create policy owner_lms_participants_owner_all on public.owner_lms_participants for all to authenticated
  using (owner_user_id = auth.uid() and owner_lms_private.obserra_owner_lms_authorized())
  with check (owner_user_id = auth.uid() and owner_lms_private.obserra_owner_lms_authorized());

drop policy if exists owner_lms_storage_select on storage.objects;
create policy owner_lms_storage_select on storage.objects for select to authenticated
  using (
    bucket_id = 'owner-lms-courseware'
    and (storage.foldername(name))[1] = auth.uid()::text
    and owner_lms_private.obserra_owner_lms_authorized()
  );

drop policy if exists owner_lms_storage_insert on storage.objects;
create policy owner_lms_storage_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'owner-lms-courseware'
    and (storage.foldername(name))[1] = auth.uid()::text
    and owner_lms_private.obserra_owner_lms_authorized()
  );

drop policy if exists owner_lms_storage_update on storage.objects;
create policy owner_lms_storage_update on storage.objects for update to authenticated
  using (
    bucket_id = 'owner-lms-courseware'
    and (storage.foldername(name))[1] = auth.uid()::text
    and owner_lms_private.obserra_owner_lms_authorized()
  )
  with check (
    bucket_id = 'owner-lms-courseware'
    and (storage.foldername(name))[1] = auth.uid()::text
    and owner_lms_private.obserra_owner_lms_authorized()
  );

drop policy if exists owner_lms_storage_delete on storage.objects;
create policy owner_lms_storage_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'owner-lms-courseware'
    and (storage.foldername(name))[1] = auth.uid()::text
    and owner_lms_private.obserra_owner_lms_authorized()
  );

drop function public.obserra_owner_lms_authorized();

do $$
declare
  private_function_count integer;
  exposed_function_count integer;
  privileged_private_count integer;
begin
  select count(*)
    into private_function_count
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'owner_lms_private'
     and p.proname = 'obserra_owner_lms_authorized';

  select count(*)
    into privileged_private_count
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'owner_lms_private'
     and p.proname = 'obserra_owner_lms_authorized'
     and p.prosecdef;

  select count(*)
    into exposed_function_count
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and p.proname = 'obserra_owner_lms_authorized';

  if private_function_count <> 1
    or privileged_private_count <> 1
    or exposed_function_count <> 0
    or not has_schema_privilege('authenticated', 'owner_lms_private', 'usage')
    or not has_function_privilege('authenticated', 'owner_lms_private.obserra_owner_lms_authorized()', 'execute') then
    raise exception 'owner LMS private authorization remediation assertion failed';
  end if;
end;
$$;

commit;
