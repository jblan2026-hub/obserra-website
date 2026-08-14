begin;

alter table public.fdacs_class_d_lias_reporting_queue
  alter column reporting_due_on set default public.fdacs_class_d_add_business_days(current_date, 3);

create or replace function public.fdacs_class_d_lias_queue_prepared_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.fdacs_class_d_lias_workflow_events (
    queue_id, completion_record_id, enrollment_id, event_type, actor_clerk_user_id,
    event_note, correlation_id, metadata
  ) values (
    new.id, new.completion_record_id, new.enrollment_id, 'prepared', new.prepared_by_clerk_user_id,
    'Successful completion prepared for manual LIAS reporting.', new.correlation_id,
    jsonb_build_object('reportingDueOn', new.reporting_due_on, 'executionMode', 'manual_queue_only')
  );
  return new;
end;
$$;

drop trigger if exists fdacs_class_d_lias_queue_prepared_event on public.fdacs_class_d_lias_reporting_queue;
create trigger fdacs_class_d_lias_queue_prepared_event
after insert on public.fdacs_class_d_lias_reporting_queue
for each row execute function public.fdacs_class_d_lias_queue_prepared_event();

insert into public.fdacs_class_d_lias_workflow_events (
  queue_id, completion_record_id, enrollment_id, event_type, actor_clerk_user_id,
  event_note, correlation_id, occurred_at, metadata
)
select q.id, q.completion_record_id, q.enrollment_id, 'prepared', q.prepared_by_clerk_user_id,
       'Successful completion prepared for manual LIAS reporting.', q.correlation_id, q.prepared_at,
       jsonb_build_object('reportingDueOn', q.reporting_due_on, 'executionMode', 'manual_queue_only')
from public.fdacs_class_d_lias_reporting_queue q
where not exists (
  select 1 from public.fdacs_class_d_lias_workflow_events e
  where e.queue_id = q.id and e.event_type = 'prepared'
);

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
  v_queue public.fdacs_class_d_lias_reporting_queue%rowtype;
  v_document_id uuid;
begin
  select * into v_completion
  from public.fdacs_class_d_completion_records
  where id = p_completion_record_id and status <> 'voided'
  for update;

  if v_completion.id is null then raise exception 'active completion record not found'; end if;
  if p_document_type not in ('fdacs_16103','obserra_course_completion','class_d_application_instructions') then raise exception 'unsupported completion document type'; end if;
  if p_source_system not in ('lias','obserra','fdacs_public') then raise exception 'unsupported completion document source'; end if;
  if p_sha256 is not null and char_length(p_sha256) <> 64 then raise exception 'document SHA-256 is invalid'; end if;

  if p_document_type = 'fdacs_16103' then
    if p_source_system <> 'lias' then raise exception 'FDACS-16103 must originate from LIAS'; end if;
    if p_storage_object_key is null or char_length(trim(p_storage_object_key)) < 3 then raise exception 'LIAS-generated FDACS-16103 storage object is required'; end if;
    if p_external_reference is null or char_length(trim(p_external_reference)) < 3 then raise exception 'LIAS certificate reference is required'; end if;

    select * into v_queue
    from public.fdacs_class_d_lias_reporting_queue
    where completion_record_id = p_completion_record_id
    for update;

    if v_queue.id is null or v_queue.status <> 'confirmed' then
      raise exception 'LIAS certificate must be confirmed before FDACS-16103 is registered for student delivery';
    end if;
    if v_queue.certificate_reference is distinct from trim(p_external_reference) then
      raise exception 'FDACS-16103 reference must match the confirmed LIAS certificate reference';
    end if;
  end if;

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
