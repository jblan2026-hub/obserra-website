begin;

alter table public.fdacs_class_d_makeup_assignments
  add column if not exists source_live_session_id uuid references public.fdacs_class_d_live_sessions(id) on delete restrict,
  add column if not exists recording_asset_reference text,
  add column if not exists certified_by_clerk_user_id text,
  add column if not exists certified_at timestamptz;

alter table public.fdacs_class_d_makeup_assignments
  add constraint fdacs_class_d_makeup_status_check check (status in ('assigned','in_progress','ready_for_review','certified','cancelled','failed')),
  add constraint fdacs_class_d_makeup_reason_check check (char_length(reason) between 3 and 4000),
  add constraint fdacs_class_d_makeup_certified_minutes_check check (certified_minutes between 0 and assigned_minutes),
  add constraint fdacs_class_d_makeup_recording_ref_check check (recording_asset_reference is null or char_length(recording_asset_reference) between 3 and 500),
  add constraint fdacs_class_d_makeup_evidence_ref_check check (evidence_reference is null or char_length(evidence_reference) between 3 and 500),
  add constraint fdacs_class_d_makeup_evidence_time_check check (evidence_ended_at is null or evidence_started_at is null or evidence_ended_at >= evidence_started_at);

alter table public.fdacs_class_d_makeup_questions
  add column if not exists asked_at timestamptz not null default now(),
  add column if not exists answered_at timestamptz;

alter table public.fdacs_class_d_makeup_questions
  add constraint fdacs_class_d_makeup_question_text_check check (char_length(question_text) between 2 and 4000),
  add constraint fdacs_class_d_makeup_answer_text_check check (answer_text is null or char_length(answer_text) between 2 and 4000);

create index if not exists fdacs_class_d_makeup_enrollment_idx on public.fdacs_class_d_makeup_assignments(enrollment_id, training_day, status, created_at);
create index if not exists fdacs_class_d_makeup_recorded_idx on public.fdacs_class_d_makeup_assignments(enrollment_id, delivery_method, status);
create index if not exists fdacs_class_d_makeup_questions_assignment_idx on public.fdacs_class_d_makeup_questions(assignment_id, asked_at, id);

commit;
