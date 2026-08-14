begin;

-- Gate 28 database performance hardening.
-- These indexes are derived from the actual regulated non-production
-- Supabase performance advisor and pg_catalog foreign-key coverage check.
-- Production Class D activation remains fail closed during schema promotion.
-- Fail quickly rather than waiting on a long DDL lock.
set local lock_timeout = '5s';
set local statement_timeout = '2min';

create index if not exists fdacs_class_d_acceptance_events_run_idx
  on public.fdacs_class_d_acceptance_events (run_id);

create index if not exists fdacs_class_d_completion_records_passed_exam_idx
  on public.fdacs_class_d_completion_records (passed_exam_attempt_id);

create index if not exists fdacs_class_d_exam_attempts_bank_idx
  on public.fdacs_class_d_exam_attempts (bank_id);

create index if not exists fdacs_class_d_exam_attempts_retest_auth_idx
  on public.fdacs_class_d_exam_attempts (retest_authorization_id);

create index if not exists fdacs_class_d_exam_responses_question_idx
  on public.fdacs_class_d_exam_responses (question_id);

create index if not exists fdacs_class_d_retest_consumed_attempt_idx
  on public.fdacs_class_d_exam_retest_authorizations (consumed_by_attempt_id);

create index if not exists fdacs_class_d_lias_events_completion_idx
  on public.fdacs_class_d_lias_workflow_events (completion_record_id);

create index if not exists fdacs_class_d_live_interactions_parent_idx
  on public.fdacs_class_d_live_interactions (parent_interaction_id);

create index if not exists fdacs_class_d_poll_responses_enrollment_idx
  on public.fdacs_class_d_live_poll_responses (enrollment_id);

create index if not exists fdacs_class_d_text_views_device_lease_idx
  on public.fdacs_class_d_live_text_screen_views (device_lease_id);

create index if not exists fdacs_class_d_text_views_enrollment_idx
  on public.fdacs_class_d_live_text_screen_views (enrollment_id);

create index if not exists fdacs_class_d_live_totals_session_idx
  on public.fdacs_class_d_live_time_totals (live_session_id);

create index if not exists fdacs_class_d_makeup_source_session_idx
  on public.fdacs_class_d_makeup_assignments (source_live_session_id);

create index if not exists fdacs_class_d_makeup_questions_enrollment_idx
  on public.fdacs_class_d_makeup_questions (enrollment_id);

create index if not exists fdacs_class_d_presence_session_idx
  on public.fdacs_class_d_presence_challenges (live_session_id);

create index if not exists fdacs_class_d_quality_events_enrollment_idx
  on public.fdacs_class_d_quality_case_events (enrollment_id);

create index if not exists fdacs_class_d_quality_cases_cohort_idx
  on public.fdacs_class_d_quality_cases (cohort_id);

create index if not exists fdacs_class_d_playback_challenges_assignment_idx
  on public.fdacs_class_d_recorded_playback_challenges (assignment_id);

create index if not exists fdacs_class_d_playback_challenges_enrollment_idx
  on public.fdacs_class_d_recorded_playback_challenges (enrollment_id);

create index if not exists fdacs_class_d_retention_completion_idx
  on public.fdacs_class_d_retention_reviews (completion_record_id);

commit;
