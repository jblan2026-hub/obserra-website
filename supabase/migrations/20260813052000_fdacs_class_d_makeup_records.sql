begin;

create table if not exists public.fdacs_class_d_makeup_assignments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  training_day smallint not null check (training_day between 1 and 5),
  module_id smallint not null check (module_id between 1 and 18),
  delivery_method text not null check (delivery_method in ('live_makeup','recorded_makeup')),
  assigned_minutes integer not null check (assigned_minutes between 1 and 480),
  reason text not null,
  status text not null default 'assigned',
  certified_minutes integer not null default 0,
  assigned_by_clerk_user_id text not null,
  assigned_instructor_clerk_user_id text not null,
  instructor_license_number text not null,
  school_license_number text not null,
  evidence_reference text,
  evidence_started_at timestamptz,
  evidence_ended_at timestamptz,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdacs_class_d_makeup_questions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.fdacs_class_d_makeup_assignments(id) on delete restrict,
  enrollment_id uuid not null references public.fdacs_class_d_enrollments(id) on delete restrict,
  question_text text not null,
  asked_by_clerk_user_id text not null,
  answer_text text,
  answered_by_clerk_user_id text,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fdacs_class_d_makeup_assignments enable row level security;
alter table public.fdacs_class_d_makeup_questions enable row level security;

commit;
