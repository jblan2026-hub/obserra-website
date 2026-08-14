-- Gate 35: bind Stripe event replays and paid claims to every material payment identity field.
-- This forward-only migration inserts no records and does not enable Florida Class D production.

alter table public.academy_payment_events
  add constraint academy_payment_events_user_id check (
    clerk_user_id is null or char_length(clerk_user_id) between 3 and 255
  );

create or replace function public.academy_record_paid_checkout(
  p_event_id text,
  p_event_type text,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_course_slug text,
  p_course_version text,
  p_identity_mode text,
  p_clerk_user_id text,
  p_purchaser_email_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.academy_payment_events%rowtype;
  v_terminal boolean;
begin
  insert into public.academy_payment_events (
    event_id, event_type, checkout_session_id, payment_intent_id, course_slug,
    course_version, identity_mode, clerk_user_id, purchaser_email_hash
  ) values (
    p_event_id, p_event_type, p_checkout_session_id, nullif(p_payment_intent_id, ''),
    p_course_slug, p_course_version, p_identity_mode, nullif(p_clerk_user_id, ''),
    nullif(p_purchaser_email_hash, '')
  )
  on conflict (event_id) do update
    set delivery_count = public.academy_payment_events.delivery_count + 1,
        last_received_at = now()
  returning * into v_event;

  if v_event.event_type <> p_event_type or
     v_event.checkout_session_id <> p_checkout_session_id or
     v_event.payment_intent_id is distinct from nullif(p_payment_intent_id, '') or
     v_event.course_slug <> p_course_slug or
     v_event.course_version <> p_course_version or
     v_event.identity_mode <> p_identity_mode or
     v_event.clerk_user_id is distinct from nullif(p_clerk_user_id, '') or
     v_event.purchaser_email_hash is distinct from nullif(p_purchaser_email_hash, '') then
    raise exception 'Stripe event material identity mismatch';
  end if;

  v_terminal := v_event.processing_state in ('fulfilled', 'paid_pending_claim');
  if v_terminal then
    return jsonb_build_object(
      'state', v_event.processing_state,
      'courseId', v_event.course_slug,
      'idempotentReplay', true
    );
  end if;

  if v_event.clerk_user_id is null then
    update public.academy_payment_events
      set processing_state = 'paid_pending_claim', processed_at = now(), failure_code = null
      where event_id = p_event_id;
    insert into public.academy_learner_events (
      clerk_user_id, course_slug, event_type, event_reference, event_payload
    ) values (
      null, p_course_slug, 'enrollment.pending_claim', p_event_id || ':pending-claim',
      jsonb_build_object('checkoutSessionId', p_checkout_session_id, 'identityMode', p_identity_mode)
    ) on conflict (event_reference) do nothing;
    return jsonb_build_object('state', 'paid_pending_claim', 'courseId', p_course_slug, 'idempotentReplay', false);
  end if;

  insert into public.academy_learner_state (
    clerk_user_id, course_slug, access_status, enrolled_at, payment_reference, course_version
  ) values (
    v_event.clerk_user_id, p_course_slug, 'active', now(), p_checkout_session_id, p_course_version
  ) on conflict (clerk_user_id, course_slug) do nothing;

  update public.academy_payment_events
    set processing_state = 'fulfilled', processed_at = now(), failure_code = null
    where event_id = p_event_id;
  insert into public.academy_learner_events (
    clerk_user_id, course_slug, event_type, event_reference, event_payload
  ) values (
    v_event.clerk_user_id, p_course_slug, 'enrollment.fulfilled', p_event_id || ':fulfilled',
    jsonb_build_object('checkoutSessionId', p_checkout_session_id, 'identityMode', p_identity_mode)
  ) on conflict (event_reference) do nothing;

  return jsonb_build_object('state', 'fulfilled', 'courseId', p_course_slug, 'idempotentReplay', false);
end;
$$;

create or replace function public.academy_claim_paid_checkout(
  p_checkout_session_id text,
  p_course_slug text,
  p_course_version text,
  p_clerk_user_id text,
  p_purchaser_email_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.academy_payment_events%rowtype;
  v_state public.academy_learner_state%rowtype;
begin
  if char_length(p_clerk_user_id) not between 3 and 255 then
    raise exception 'Purchaser identity is invalid';
  end if;

  select * into v_event
  from public.academy_payment_events
  where checkout_session_id = p_checkout_session_id and course_slug = p_course_slug
  order by last_received_at desc
  limit 1
  for update;

  if not found or v_event.processing_state not in ('fulfilled', 'paid_pending_claim') then
    raise exception 'Paid checkout event is unavailable';
  end if;
  if v_event.course_version <> p_course_version then
    raise exception 'Paid checkout course version mismatch';
  end if;
  if v_event.clerk_user_id is not null and v_event.clerk_user_id <> p_clerk_user_id then
    raise exception 'Paid checkout belongs to a different identity';
  end if;
  if v_event.clerk_user_id is null and
     v_event.purchaser_email_hash is distinct from nullif(p_purchaser_email_hash, '') then
    raise exception 'Purchaser email verification failed';
  end if;

  insert into public.academy_learner_state (
    clerk_user_id, course_slug, access_status, enrolled_at, payment_reference, course_version
  ) values (
    p_clerk_user_id, p_course_slug, 'active', now(), p_checkout_session_id, v_event.course_version
  ) on conflict (clerk_user_id, course_slug) do nothing;

  update public.academy_payment_events
    set clerk_user_id = p_clerk_user_id,
        processing_state = 'fulfilled',
        processed_at = now(),
        failure_code = null
    where event_id = v_event.event_id;

  insert into public.academy_learner_events (
    clerk_user_id, course_slug, event_type, event_reference, event_payload
  ) values (
    p_clerk_user_id, p_course_slug, 'enrollment.claimed',
    'claim:' || p_checkout_session_id || ':' || p_clerk_user_id,
    jsonb_build_object('checkoutSessionId', p_checkout_session_id, 'courseVersion', v_event.course_version)
  ) on conflict (event_reference) do nothing;

  select * into strict v_state from public.academy_learner_state
    where clerk_user_id = p_clerk_user_id and course_slug = p_course_slug;
  return to_jsonb(v_state);
end;
$$;

revoke all on function public.academy_record_paid_checkout(text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.academy_claim_paid_checkout(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.academy_record_paid_checkout(text, text, text, text, text, text, text, text, text) to service_role;
grant execute on function public.academy_claim_paid_checkout(text, text, text, text, text) to service_role;
