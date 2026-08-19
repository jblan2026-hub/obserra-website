-- Forward-only hardening for connector and owner LMS access paths.
-- Keeps connector secrets private, preserves explicit external deny policies,
-- and avoids per-row auth.uid() re-evaluation in owner LMS RLS policies.

create index if not exists connector_secrets_connector_owner_tenant_idx
  on connector_private.connector_secrets (connector_id, owner_user_id, tenant_key);

create index if not exists connector_secrets_owner_user_idx
  on connector_private.connector_secrets (owner_user_id);

create index if not exists owner_lms_messages_owner_user_idx
  on public.owner_lms_messages (owner_user_id);

create index if not exists owner_lms_notes_session_id_idx
  on public.owner_lms_notes (session_id);

create index if not exists owner_lms_participants_owner_user_idx
  on public.owner_lms_participants (owner_user_id);

create index if not exists owner_lms_sessions_active_course_asset_idx
  on public.owner_lms_sessions (active_course_asset_id);

-- Reassert fail-closed public connector-table policy boundaries.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'integration_connectors',
    'integration_connector_health_events',
    'integration_connector_failures'
  ]
  loop
    execute format('drop policy if exists %I_external_deny on public.%I', table_name, table_name);
    execute format(
      'create policy %I_external_deny on public.%I for all to anon, authenticated using (false) with check (false)',
      table_name,
      table_name
    );
  end loop;
end
$$;

-- Cache auth.uid() once per statement while preserving the private AAL2 owner helper.
drop policy if exists owner_lms_course_assets_owner_all on public.owner_lms_course_assets;
create policy owner_lms_course_assets_owner_all
  on public.owner_lms_course_assets
  for all
  to authenticated
  using ((owner_user_id = (select auth.uid())) and owner_lms_private.obserra_owner_lms_authorized())
  with check ((owner_user_id = (select auth.uid())) and owner_lms_private.obserra_owner_lms_authorized());

drop policy if exists owner_lms_sessions_owner_all on public.owner_lms_sessions;
create policy owner_lms_sessions_owner_all
  on public.owner_lms_sessions
  for all
  to authenticated
  using ((owner_user_id = (select auth.uid())) and owner_lms_private.obserra_owner_lms_authorized())
  with check ((owner_user_id = (select auth.uid())) and owner_lms_private.obserra_owner_lms_authorized());

drop policy if exists owner_lms_notes_owner_all on public.owner_lms_notes;
create policy owner_lms_notes_owner_all
  on public.owner_lms_notes
  for all
  to authenticated
  using ((owner_user_id = (select auth.uid())) and owner_lms_private.obserra_owner_lms_authorized())
  with check ((owner_user_id = (select auth.uid())) and owner_lms_private.obserra_owner_lms_authorized());

drop policy if exists owner_lms_messages_owner_all on public.owner_lms_messages;
create policy owner_lms_messages_owner_all
  on public.owner_lms_messages
  for all
  to authenticated
  using ((owner_user_id = (select auth.uid())) and owner_lms_private.obserra_owner_lms_authorized())
  with check ((owner_user_id = (select auth.uid())) and owner_lms_private.obserra_owner_lms_authorized());

drop policy if exists owner_lms_participants_owner_all on public.owner_lms_participants;
create policy owner_lms_participants_owner_all
  on public.owner_lms_participants
  for all
  to authenticated
  using ((owner_user_id = (select auth.uid())) and owner_lms_private.obserra_owner_lms_authorized())
  with check ((owner_user_id = (select auth.uid())) and owner_lms_private.obserra_owner_lms_authorized());
