begin;

-- Harden trigger/helper functions surfaced by the Supabase security advisor.
-- These functions are internal database boundaries and must not be callable
-- directly by browser-facing roles.

alter function public.fdacs_class_d_live_append_only()
  set search_path = public;

alter function public.fdacs_class_d_reject_quality_event_mutation()
  set search_path = public;

alter function public.fdacs_class_d_lias_queue_prepared_event()
  set search_path = public;

revoke execute on function public.fdacs_class_d_live_append_only()
  from public, anon, authenticated;
revoke execute on function public.fdacs_class_d_reject_quality_event_mutation()
  from public, anon, authenticated;
revoke execute on function public.fdacs_class_d_lias_queue_prepared_event()
  from public, anon, authenticated;

grant execute on function public.fdacs_class_d_live_append_only()
  to service_role;
grant execute on function public.fdacs_class_d_reject_quality_event_mutation()
  to service_role;
grant execute on function public.fdacs_class_d_lias_queue_prepared_event()
  to service_role;

commit;
