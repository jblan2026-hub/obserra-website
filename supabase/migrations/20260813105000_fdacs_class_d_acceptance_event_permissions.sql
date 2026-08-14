begin;

revoke update, delete, truncate on table public.fdacs_class_d_acceptance_events from service_role;
grant select, insert on table public.fdacs_class_d_acceptance_events to service_role;

commit;
