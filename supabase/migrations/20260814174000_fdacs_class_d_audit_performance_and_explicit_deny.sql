begin;

-- Cover every foreign key introduced by the PII boundary, automatic archive,
-- identity/attendance, and investigator-audit migrations. These tables are
-- currently empty or control-only, so ordinary transactional index creation
-- is appropriate and avoids an untracked concurrent-DDL exception.
create index if not exists fdacs_completion_docs_artifact_idx
  on public.fdacs_class_d_completion_documents(protected_artifact_id);
create index if not exists fdacs_course_files_exam_artifact_idx
  on public.fdacs_class_d_course_files(final_exam_artifact_id);
create index if not exists fdacs_course_files_materials_idx
  on public.fdacs_class_d_course_files(materials_artifact_id);
create index if not exists fdacs_course_files_references_idx
  on public.fdacs_class_d_course_files(references_artifact_id);
create index if not exists fdacs_course_files_schedule_idx
  on public.fdacs_class_d_course_files(schedule_artifact_id);
create index if not exists fdacs_course_files_supersedes_idx
  on public.fdacs_class_d_course_files(supersedes_course_file_id);
create index if not exists fdacs_daily_att_daily_identity_idx
  on public.fdacs_class_d_daily_attendance_attestations(daily_identity_checkin_id);
create index if not exists fdacs_daily_att_identity_att_idx
  on public.fdacs_class_d_daily_attendance_attestations(identity_attestation_id);
create index if not exists fdacs_daily_att_instructor_file_idx
  on public.fdacs_class_d_daily_attendance_attestations(instructor_file_id);
create index if not exists fdacs_daily_att_cohort_idx
  on public.fdacs_class_d_daily_attendance_attestations(cohort_id);
create index if not exists fdacs_daily_identity_att_idx
  on public.fdacs_class_d_daily_identity_checkins(identity_attestation_id);
create index if not exists fdacs_daily_identity_cohort_idx
  on public.fdacs_class_d_daily_identity_checkins(cohort_id);
create index if not exists fdacs_daily_identity_instructor_idx
  on public.fdacs_class_d_daily_identity_checkins(instructor_file_id);
create index if not exists fdacs_instructor_files_supersedes_idx
  on public.fdacs_class_d_instructor_files(supersedes_instructor_file_id);
create index if not exists fdacs_instructor_files_license_artifact_idx
  on public.fdacs_class_d_instructor_files(license_artifact_id);
create index if not exists fdacs_instructor_files_qualification_idx
  on public.fdacs_class_d_instructor_files(qualification_artifact_id);
create index if not exists fdacs_identity_att_verification_idx
  on public.fdacs_class_d_instructor_identity_attestations(verification_session_id);
create index if not exists fdacs_identity_att_instructor_idx
  on public.fdacs_class_d_instructor_identity_attestations(instructor_file_id);
create index if not exists fdacs_identity_att_acceptance_idx
  on public.fdacs_class_d_instructor_identity_attestations(acceptance_run_id);
create index if not exists fdacs_archive_jobs_completion_idx
  on public.fdacs_class_d_record_archive_jobs(completion_record_id);
create index if not exists fdacs_archive_jobs_artifact_idx
  on public.fdacs_class_d_record_archive_jobs(protected_artifact_id);
create index if not exists fdacs_authority_snapshot_authority_idx
  on public.fdacs_class_d_record_authority_snapshots(authority_id);
create index if not exists fdacs_session_signature_artifact_idx
  on public.fdacs_class_d_session_signature_records(signature_artifact_id);
create index if not exists fdacs_session_signature_attendance_idx
  on public.fdacs_class_d_session_signature_records(attendance_entry_id);
create index if not exists fdacs_session_signature_enrollment_idx
  on public.fdacs_class_d_session_signature_records(enrollment_id);
create index if not exists fdacs_signed_exam_artifact_idx
  on public.fdacs_class_d_signed_final_exam_records(signed_exam_artifact_id);
create index if not exists fdacs_signed_exam_enrollment_idx
  on public.fdacs_class_d_signed_final_exam_records(enrollment_id);

-- Direct table access is intentionally unavailable. Add a named restrictive
-- deny policy to make the browser-deny posture explicit to provider tooling;
-- service operations continue only through the narrowly granted SECURITY
-- DEFINER functions.
do $$
declare
  v_table record;
begin
  for v_table in
    select c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public'
      and c.relkind='r'
      and c.relname like 'fdacs_class_d_%'
    order by c.relname
  loop
    if not exists (
      select 1
      from pg_policy p
      join pg_class c on c.oid=p.polrelid
      join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public'
        and c.relname=v_table.table_name
        and p.polname='fdacs_browser_deny_all'
    ) then
      execute format(
        'create policy fdacs_browser_deny_all on public.%I as restrictive for all to anon, authenticated using (false) with check (false)',
        v_table.table_name
      );
    end if;
    execute format('revoke all on table public.%I from public, anon, authenticated',v_table.table_name);
  end loop;
end;
$$;

commit;
