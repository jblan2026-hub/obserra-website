-- Project: ykmrlcfitsubqajgfnye (Obserra Applications Release Authority)
-- Purpose: Pin the append-only trigger function search path so its behavior
-- cannot be changed through role-level search_path mutation.

alter function obserra_release_authority.reject_event_mutation()
  set search_path = '';
