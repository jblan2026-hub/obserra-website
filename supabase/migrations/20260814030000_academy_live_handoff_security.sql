-- Secure the Academy production live handoff table by default.
-- The table is backend-only operational evidence and must never be client-readable.

alter table public.academy_production_live_handoff enable row level security;
alter table public.academy_production_live_handoff force row level security;

revoke all on table public.academy_production_live_handoff from anon;
revoke all on table public.academy_production_live_handoff from authenticated;

grant select, insert, update, delete on table public.academy_production_live_handoff to service_role;
