create table if not exists public.academy_internal_gateway_keys (
  key_id text primary key,
  public_key_spki_b64 text not null,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  constraint academy_internal_gateway_key_id_format check (key_id ~ '^academy-gateway-v[0-9]+$'),
  constraint academy_internal_gateway_public_key_length check (char_length(public_key_spki_b64) between 40 and 512)
);

alter table public.academy_internal_gateway_keys enable row level security;
alter table public.academy_internal_gateway_keys force row level security;
revoke all on table public.academy_internal_gateway_keys from anon, authenticated;
grant select, update on table public.academy_internal_gateway_keys to service_role;

create unique index if not exists academy_internal_gateway_one_active_key
  on public.academy_internal_gateway_keys ((true))
  where active;

create table if not exists public.academy_internal_gateway_nonces (
  key_id text not null references public.academy_internal_gateway_keys(key_id) on delete cascade,
  nonce uuid not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (key_id, nonce),
  constraint academy_internal_gateway_nonce_expiry check (expires_at > created_at)
);

alter table public.academy_internal_gateway_nonces enable row level security;
alter table public.academy_internal_gateway_nonces force row level security;
revoke all on table public.academy_internal_gateway_nonces from anon, authenticated;
grant select, insert, delete on table public.academy_internal_gateway_nonces to service_role;

create index if not exists academy_internal_gateway_nonces_expires_at_idx
  on public.academy_internal_gateway_nonces (expires_at);

begin;
update public.academy_internal_gateway_keys set active = false where active;
insert into public.academy_internal_gateway_keys (key_id, public_key_spki_b64, active)
values (
  'academy-gateway-v1',
  'MCowBQYDK2VwAyEA+WtBPmESNwcraWZYkN+QUm7p05MavugD4qZ5cRc2Ydc=',
  true
)
on conflict (key_id) do update
set public_key_spki_b64 = excluded.public_key_spki_b64,
    active = true;
commit;
