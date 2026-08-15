begin;

-- Bind every initial DI photo-identification attestation to the instructor
-- actually assigned to the learner's governed cohort. The protected Daily
-- lobby is application-mediated and never creates instructional-time or
-- attendance evidence; this trigger hardens the durable evidence boundary.

create or replace function public.fdacs_class_d_enforce_identity_attestation_assignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.fdacs_class_d_enrollments e
    join public.fdacs_class_d_live_sessions s on s.cohort_id = e.cohort_id
    where e.id = new.enrollment_id
      and s.instructor_clerk_user_id = new.instructor_clerk_user_id
      and s.instructor_license_number = new.instructor_license_number_snapshot
      and s.status in ('scheduled','live','break','ended')
  ) then
    raise exception 'identity attestation requires the Class DI instructor assigned to the learner cohort';
  end if;
  return new;
end;
$$;

drop trigger if exists fdacs_class_d_identity_attestation_assignment_guard
  on public.fdacs_class_d_instructor_identity_attestations;
create trigger fdacs_class_d_identity_attestation_assignment_guard
before insert on public.fdacs_class_d_instructor_identity_attestations
for each row execute function public.fdacs_class_d_enforce_identity_attestation_assignment();

revoke all on function public.fdacs_class_d_enforce_identity_attestation_assignment()
  from public, anon, authenticated, service_role;

comment on function public.fdacs_class_d_enforce_identity_attestation_assignment() is
  'Fail-closed evidence guard requiring the initial state/federal photo-ID attestation to be signed by the Class DI instructor assigned to the learner cohort. It does not store an ID image, grant attendance, credit instructional time, or authorize production.';

commit;
