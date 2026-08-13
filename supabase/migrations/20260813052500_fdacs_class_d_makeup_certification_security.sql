begin;

alter function public.fdacs_class_d_certify_makeup_atomic(
  uuid,
  integer,
  text,
  timestamptz,
  timestamptz,
  text,
  text,
  text,
  uuid
) security definer;

revoke all on function public.fdacs_class_d_certify_makeup_atomic(
  uuid,
  integer,
  text,
  timestamptz,
  timestamptz,
  text,
  text,
  text,
  uuid
) from public, anon, authenticated;

grant execute on function public.fdacs_class_d_certify_makeup_atomic(
  uuid,
  integer,
  text,
  timestamptz,
  timestamptz,
  text,
  text,
  text,
  uuid
) to service_role;

commit;
