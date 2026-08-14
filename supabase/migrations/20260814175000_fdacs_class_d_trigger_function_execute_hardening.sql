-- Remove the final browser-role execute grant from the isolated FDACS boundary.
--
-- This trigger function is invoked only by PostgreSQL as the append-only guard
-- on fdacs_class_d_lias_workflow_events. It is not an application RPC.

alter function public.fdacs_class_d_reject_lias_workflow_mutation()
  set search_path = '';

revoke all on function public.fdacs_class_d_reject_lias_workflow_mutation()
  from public, anon, authenticated;

grant execute on function public.fdacs_class_d_reject_lias_workflow_mutation()
  to service_role;
