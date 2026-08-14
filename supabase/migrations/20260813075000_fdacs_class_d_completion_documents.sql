begin;

create table if not exists public.fdacs_class_d_completion_documents (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  completion_record_id uuid not null references public.fdacs_class_d_completion_records(id) on delete restrict,
  document_type text not null check (document_type in ('fdacs_16103','obserra_course_completion','class_d_application_instructions')),
  status text not null default 'pending' check (status in ('pending','available','superseded','voided')),
  storage_bucket text,
  storage_object_key text,
  external_reference text,
  sha256 text check (sha256 is null or char_length(sha256) = 64),
  content_type text,
  issued_at timestamptz,
  issued_by_clerk_user_id text,
  source_system text not null check (source_system in ('lias','obserra','fdacs_public')),
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (completion_record_id, document_type, status)
);

create index if not exists fdacs_class_d_completion_documents_enrollment_idx
  on public.fdacs_class_d_completion_documents(enrollment_id, document_type, created_at desc);

alter table public.fdacs_class_d_completion_documents enable row level security;
alter table public.fdacs_class_d_completion_documents force row level security;
revoke all on table public.fdacs_class_d_completion_documents from public, anon, authenticated;
grant all on table public.fdacs_class_d_completion_documents to service_role;

alter table public.fdacs_class_d_audit_events
  drop constraint if exists fdacs_class_d_audit_events_entity_type_check;
alter table public.fdacs_class_d_audit_events
  add constraint fdacs_class_d_audit_events_entity_type_check
  check (entity_type in (
    'identity','enrollment','cohort','attendance','instruction_time','live_session','device_lease',
    'presence','presence_challenge','live_interaction','module_progress','learning_check','remediation',
    'record_hold','acknowledgment','enrollment_review','exam','completion','completion_document','lias'
  ));

create or replace function public.fdacs_class_d_register_completion_document(
  p_completion_record_id uuid,
  p_document_type text,
  p_storage_bucket text,
  p_storage_object_key text,
  p_external_reference text,
  p_sha256 text,
  p_content_type text,
  p_source_system text,
  p_actor_clerk_user_id text,
  p_correlation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_completion public.fdacs_class_d_completion_records%rowtype;
  v_document_id uuid;
begin
  select * into v_completion
  from public.fdacs_class_d_completion_records
  where id = p_completion_record_id and status <> 'voided'
  for update;

  if v_completion.id is null then raise exception 'active completion record not found'; end if;
  if p_document_type not in ('fdacs_16103','obserra_course_completion','class_d_application_instructions') then raise exception 'unsupported completion document type'; end if;
  if p_source_system not in ('lias','obserra','fdacs_public') then raise exception 'unsupported completion document source'; end if;
  if p_document_type = 'fdacs_16103' and p_source_system <> 'lias' then raise exception 'FDACS-16103 must originate from LIAS'; end if;
  if p_document_type = 'fdacs_16103' and (p_storage_object_key is null or char_length(trim(p_storage_object_key)) < 3) then raise exception 'LIAS-generated FDACS-16103 storage object is required'; end if;
  if p_sha256 is not null and char_length(p_sha256) <> 64 then raise exception 'document SHA-256 is invalid'; end if;

  update public.fdacs_class_d_completion_documents
  set status = 'superseded', updated_at = now()
  where completion_record_id = p_completion_record_id
    and document_type = p_document_type
    and status = 'available';

  insert into public.fdacs_class_d_completion_documents (
    enrollment_id, completion_record_id, document_type, status,
    storage_bucket, storage_object_key, external_reference, sha256, content_type,
    issued_at, issued_by_clerk_user_id, source_system, correlation_id
  ) values (
    v_completion.enrollment_id, v_completion.id, p_document_type, 'available',
    nullif(trim(p_storage_bucket),''), nullif(trim(p_storage_object_key),''), nullif(trim(p_external_reference),''),
    p_sha256, nullif(trim(p_content_type),''), now(), p_actor_clerk_user_id, p_source_system, p_correlation_id
  ) returning id into v_document_id;

  insert into public.fdacs_class_d_audit_events (
    actor_role, actor_clerk_user_id, enrollment_id, entity_type, entity_id, action, correlation_id, metadata
  ) values (
    'compliance_admin', p_actor_clerk_user_id, v_completion.enrollment_id, 'completion_document', v_document_id,
    'completion_document_registered', p_correlation_id,
    jsonb_build_object('documentType', p_document_type, 'sourceSystem', p_source_system, 'sha256', p_sha256)
  );

  return v_document_id;
end;
$$;

revoke execute on function public.fdacs_class_d_register_completion_document(uuid,text,text,text,text,text,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.fdacs_class_d_register_completion_document(uuid,text,text,text,text,text,text,text,text,uuid) to service_role;

commit;
