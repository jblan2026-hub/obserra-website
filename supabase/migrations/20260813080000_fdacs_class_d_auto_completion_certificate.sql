begin;

alter table public.fdacs_class_d_completion_documents
  add column if not exists render_payload jsonb;

create or replace function public.fdacs_class_d_create_automatic_completion_documents()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_legal_name text;
  v_exam_score integer;
  v_certificate_reference text;
  v_completion_date date;
begin
  if new.verified_instructional_minutes < 2400 then
    raise exception '40 verified instructional hours are required before completion documents can be created';
  end if;

  select i.legal_name
    into v_legal_name
  from public.fdacs_class_d_enrollments e
  join public.fdacs_class_d_student_identities i on i.id = e.student_identity_id
  where e.id = new.enrollment_id
    and i.identity_status = 'verified';

  if v_legal_name is null then
    raise exception 'verified student legal name is required before completion documents can be created';
  end if;

  select score into v_exam_score
  from public.fdacs_class_d_exam_attempts
  where id = new.passed_exam_attempt_id
    and status = 'passed'
    and passed = true;

  if v_exam_score is null or v_exam_score < 128 then
    raise exception 'passing examination evidence is required before any completion certificate or application handoff document can be created';
  end if;

  v_completion_date := coalesce(new.approved_at::date, current_date);
  v_certificate_reference := 'OBS-FL-D-' || upper(substr(replace(new.id::text, '-', ''), 1, 16));

  insert into public.fdacs_class_d_completion_documents (
    enrollment_id,
    completion_record_id,
    document_type,
    status,
    external_reference,
    content_type,
    issued_at,
    issued_by_clerk_user_id,
    source_system,
    correlation_id,
    render_payload
  ) values (
    new.enrollment_id,
    new.id,
    'obserra_course_completion',
    'available',
    v_certificate_reference,
    'text/html',
    coalesce(new.approved_at, now()),
    new.approved_by_clerk_user_id,
    'obserra',
    new.correlation_id,
    jsonb_build_object(
      'schema', 'obserra.fdacs.class-d.course-completion.v1',
      'studentLegalName', v_legal_name,
      'courseTitle', 'Florida Class D Security Officer Training',
      'courseId', 'florida-class-d-40-hour',
      'instructionalHours', 40,
      'verifiedInstructionalMinutes', new.verified_instructional_minutes,
      'completionDate', v_completion_date,
      'certificateId', v_certificate_reference,
      'enrollmentId', new.enrollment_id,
      'completionRecordId', new.id,
      'examScore', v_exam_score,
      'passingScore', 128,
      'provider', 'Obserra Executive Protection & Intelligence LLC',
      'officialStateCertificate', false,
      'licenseIssued', false
    )
  ) on conflict (completion_record_id, document_type, status) do nothing;

  insert into public.fdacs_class_d_completion_documents (
    enrollment_id,
    completion_record_id,
    document_type,
    status,
    external_reference,
    content_type,
    issued_at,
    issued_by_clerk_user_id,
    source_system,
    correlation_id,
    render_payload
  ) values (
    new.enrollment_id,
    new.id,
    'class_d_application_instructions',
    'available',
    'FL-CLASS-D-APPLICATION-HANDOFF',
    'text/html',
    coalesce(new.approved_at, now()),
    new.approved_by_clerk_user_id,
    'obserra',
    new.correlation_id,
    jsonb_build_object(
      'schema', 'obserra.fdacs.class-d.application-handoff.v1',
      'studentLegalName', v_legal_name,
      'completionDate', v_completion_date,
      'certificateId', v_certificate_reference,
      'officialTrainingCertificateRequired', 'FDACS-16103',
      'officialCertificateSource', 'LIAS',
      'completionDoesNotEqualLicense', true
    )
  ) on conflict (completion_record_id, document_type, status) do nothing;

  insert into public.fdacs_class_d_audit_events (
    actor_role,
    actor_clerk_user_id,
    enrollment_id,
    entity_type,
    entity_id,
    action,
    correlation_id,
    metadata
  ) values (
    'system',
    new.approved_by_clerk_user_id,
    new.enrollment_id,
    'completion_document',
    new.id,
    'supplemental_completion_documents_auto_generated_after_exam_pass',
    new.correlation_id,
    jsonb_build_object(
      'certificateReference', v_certificate_reference,
      'studentLegalNameSnapshot', v_legal_name,
      'verifiedInstructionalMinutes', new.verified_instructional_minutes,
      'instructionalHours', 40,
      'examScore', v_exam_score,
      'passingScore', 128,
      'officialFdacs16103Generated', false
    )
  );

  return new;
end;
$$;

drop trigger if exists fdacs_class_d_auto_completion_documents on public.fdacs_class_d_completion_records;
create trigger fdacs_class_d_auto_completion_documents
after insert on public.fdacs_class_d_completion_records
for each row execute function public.fdacs_class_d_create_automatic_completion_documents();

revoke execute on function public.fdacs_class_d_create_automatic_completion_documents() from public, anon, authenticated;
grant execute on function public.fdacs_class_d_create_automatic_completion_documents() to service_role;

commit;
