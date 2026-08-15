begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

do $identity_authority_post_apply_assertions$
declare
  v_bind text := lower(pg_get_functiondef(
    'public.obserra_bind_identity(uuid,text,text[],boolean,uuid)'::regprocedure
  ));
  v_set_roles text := lower(pg_get_functiondef(
    'public.obserra_set_subject_roles(text,text[],uuid)'::regprocedure
  ));
  v_deprovision text := lower(pg_get_functiondef(
    'public.obserra_deprovision_subject(text,uuid)'::regprocedure
  ));
begin
  if not has_schema_privilege('service_role', 'identity_private', 'USAGE')
    or has_schema_privilege('anon', 'identity_private', 'USAGE')
    or has_schema_privilege('authenticated', 'identity_private', 'USAGE')
    or not has_table_privilege('service_role', 'identity_private.subjects', 'SELECT')
    or not has_table_privilege('service_role', 'identity_private.provider_links', 'SELECT')
    or not has_table_privilege('service_role', 'identity_private.authorization_audit_events', 'SELECT')
    or has_table_privilege('service_role', 'identity_private.subjects', 'INSERT,UPDATE,DELETE')
    or has_table_privilege('service_role', 'identity_private.provider_links', 'INSERT,UPDATE,DELETE')
    or has_table_privilege('service_role', 'identity_private.authorization_audit_events', 'INSERT,UPDATE,DELETE')
    or not has_function_privilege('authenticated', 'public.obserra_current_identity_authority(uuid)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.obserra_request_owner_activation(uuid)', 'EXECUTE')
    or has_function_privilege('anon', 'public.obserra_current_identity_authority(uuid)', 'EXECUTE')
    or has_function_privilege('anon', 'public.obserra_request_owner_activation(uuid)', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.obserra_bind_identity(uuid,text,text[],boolean,uuid)', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.obserra_set_subject_roles(text,text[],uuid)', 'EXECUTE')
    or not has_function_privilege('service_role', 'public.obserra_deprovision_subject(text,uuid)', 'EXECUTE') then
    raise exception 'effective identity authority privilege assertion failed';
  end if;

  if position('update auth.users' in v_bind) = 0
    or position('delete from auth.sessions' in v_bind) = 0
    or position('update auth.users' in v_bind) > position('delete from auth.sessions' in v_bind)
    or position('update auth.users' in v_set_roles) = 0
    or position('delete from auth.sessions' in v_set_roles) = 0
    or position('update auth.users' in v_set_roles) > position('delete from auth.sessions' in v_set_roles)
    or position('update auth.users' in v_deprovision) = 0
    or position('delete from auth.sessions' in v_deprovision) = 0
    or position('update auth.users' in v_deprovision) > position('delete from auth.sessions' in v_deprovision)
    or position('obserra_subject_id' in v_bind) = 0
    or position('role_version' in v_bind) = 0
    or position('identity_status' in v_bind) = 0
    or position('roles' in v_bind) = 0
    or position('identity_status' in v_deprovision) = 0 then
    raise exception 'governed app metadata assertion failed';
  end if;
end;
$identity_authority_post_apply_assertions$;

rollback;
