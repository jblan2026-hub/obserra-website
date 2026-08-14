begin;

alter table public.fdacs_class_d_makeup_assignments force row level security;
alter table public.fdacs_class_d_makeup_questions force row level security;

revoke all on table public.fdacs_class_d_makeup_assignments from public, anon, authenticated;
revoke all on table public.fdacs_class_d_makeup_questions from public, anon, authenticated;

commit;
