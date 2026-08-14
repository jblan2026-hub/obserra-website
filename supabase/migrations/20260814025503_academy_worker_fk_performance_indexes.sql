-- Add covering indexes for Academy worker foreign keys reported by Supabase performance analysis.

create index if not exists academy_openai_usage_events_command_idx
  on public.academy_openai_usage_events (command_id);

create index if not exists academy_openai_usage_events_node_idx
  on public.academy_openai_usage_events (node_id);

create index if not exists academy_worker_slot_status_command_idx
  on public.academy_worker_slot_status (command_id);
