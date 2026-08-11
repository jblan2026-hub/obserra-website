# Obserra Academy Supabase Security Handoff

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/learnworlds-commercial-pipeline`

Pull request: `55`

Supabase project: `Obserra Academy`

Supabase project reference: `nwxnyqlyzyufgoadtqxs`

Region: `us-east-1`

Recorded: 2026-08-11

Status: Emergency containment applied. Full security remediation and forensic review remain in progress.

## Owner direction

The owner reported a Supabase notice indicating that an Obserra Academy table was publicly accessible and directed that all Academy data, intellectual property, learner information, production records, prompts, course content, assessment material, media metadata, and operational data be protected from unauthorized access, theft, copying, or exfiltration.

The governing rule is now deny by default. Browser clients, anonymous users, ordinary authenticated Supabase users, public PostgREST callers, public GraphQL callers, and public RPC callers must not receive direct database access. Trusted backend services may access required data only through approved server side controls, service role credentials stored in an approved secret manager, and narrowly authorized Edge Functions.

## Initial security findings

The Supabase security advisor and direct catalog inspection identified material exposure conditions before containment:

1. Multiple tables in the exposed `public` schema did not have row level security enabled.
2. Anonymous and authenticated roles held direct privileges on several Academy production, integration, worker, usage, and audit objects.
3. Several views used owner security semantics rather than invoker security semantics.
4. Multiple security definer functions were executable by anonymous or ordinary authenticated roles.
5. One function had a mutable search path.
6. The `academy-public-catalog` Edge Function was publicly callable, used a service role client internally, returned cross origin responses to any origin, and did not require platform JWT verification.
7. The GitHub repository containing internal Academy implementation and production planning material is currently public.

These findings created a credible risk of unauthorized data access or intellectual property exposure. They do not by themselves prove that data was taken. No forensic conclusion has been reached. Compromise has neither been proven nor ruled out.

## Emergency database containment applied

### Migration 20260811223159

```text
emergency_private_database_lockdown_v2
```

This migration:

1. Revoked direct privileges on the `public` schema from `public`, `anon`, and `authenticated`.
2. Revoked direct table and view privileges from `public`, `anon`, and `authenticated`.
3. Revoked sequence privileges from `public`, `anon`, and `authenticated`.
4. Revoked RPC execution from `public`, `anon`, and `authenticated`.
5. Revoked exposed type usage from `public`, `anon`, and `authenticated`.
6. Preserved trusted backend access for `service_role`.
7. Enabled row level security on every base table in the `public` schema.
8. Forced row level security on every base table in the `public` schema.
9. Changed every public view to security invoker behavior.
10. Pinned the mutable function search path.
11. Established deny by default privileges for future objects created by the database owner.

### Migration 20260811224121

```text
disable_unused_public_api_surfaces
```

This migration attempted to remove anonymous and ordinary authenticated access to unused Storage, Realtime, and GraphQL database surfaces. Supabase retains platform managed grants on parts of these schemas. Current containment therefore relies on the following facts:

1. No Supabase Storage buckets currently exist.
2. Storage tables have row level security enabled and no permissive policies.
3. The Obserra Academy application does not require direct client side Storage, Realtime, or GraphQL database access.
4. Public schema access is independently revoked.
5. Remaining platform managed schema grants require continued review and project level configuration validation.

## Current database verification

A direct post migration verification produced the following result:

```text
Public schema base tables: 58
RLS enabled tables: 58
RLS forced tables: 58
Anonymous public schema usage: false
Authenticated public schema usage: false
Anonymous or authenticated public table grants: 0
Anonymous or authenticated public function grants: 0
Public views: 9
Security invoker public views: 9
Non security invoker public views: 0
```

The current Supabase security advisor reports only informational `RLS Enabled No Policy` notices. Under the present architecture, the absence of policies is intentional for direct API roles because the tables are deny by default and backend service role access is used for approved operations. The prior security advisor errors and warnings for public RLS exposure, security definer views, public security definer RPC execution, and mutable search path are no longer present.

## Academy catalog Edge Function containment

The `academy-public-catalog` Edge Function was upgraded to version 2 with:

```text
Platform JWT verification: enabled
Required caller role: service_role
Public CORS wildcard: removed
Cache policy: private and no store
Unauthorized response: 404
Default course state when no control record exists: unpublished and not purchasable
```

The Edge Function now requires a platform validated service role JWT before it can read Academy control or content override data.

## Critical application impact and pending repair

The website server code currently calls `academy-public-catalog` without an Authorization header. The new service role requirement therefore intentionally blocks the existing call.

The current website fallback logic is also not acceptable for the new security model because it falls back to the baseline catalog and default published controls when the control service is unavailable. This is a fail open condition for course visibility and purchasing logic.

Required repair:

1. Move Academy control retrieval to an approved server only request that supplies a service role credential from the deployment secret store.
2. Never expose the service role credential to browser code, logs, responses, client bundles, or repository files.
3. Change all control service failure behavior to fail closed.
4. Hide unpublished catalog records and disable purchase when control authority is unavailable.
5. Add automated tests proving no browser direct database call, no secret exposure, and fail closed behavior.
6. Validate the production server path before restoring runtime dependence on Supabase control data.

Until this repair passes, Academy control plane behavior is considered contained but degraded.

## Edge Function review boundary

Current project inventory contains thirteen active Edge Functions.

```text
Functions with platform JWT verification enabled: 1
Functions with platform JWT verification disabled: 12
```

`academy-owner-control` implements custom Clerk JWT and owner identity verification and therefore requires a focused code review rather than an automatic platform JWT change.

Every other Edge Function with platform JWT verification disabled must be reviewed individually. Each function must be placed into one of these categories:

1. Retain with verified custom authentication and least privilege.
2. Redeploy with platform JWT verification enabled.
3. Restrict to service role only.
4. Disable or delete because it is retired or unnecessary.

No function may remain publicly callable merely because it existed before this incident.

## GitHub intellectual property exposure

The repository is currently public. This is a separate and material intellectual property risk.

Current repository state:

```text
Repository visibility: public
Pull request 55: open and Draft
Repository contains internal implementation and production planning material
Secret values intentionally committed: none identified in this review
Public history exposure assessment: not complete
```

Required owner action:

1. Change `jblan2026-hub/obserra-website` to a private repository.
2. Review collaborators, outside access, deploy keys, installed applications, actions, forks, and public clones.
3. Review Git history for confidential intellectual property and secret material.
4. Rotate any credential that may have been copied, logged, committed, or exposed in a screenshot.
5. Preserve audit evidence before rewriting history or deleting material.

The repository must remain a merge blocker until visibility and exposure review are complete.

## Credential and secret boundary

No secret value is recorded in this handoff.

The following material must remain only in approved secret stores:

1. Supabase service role key.
2. Supabase database password.
3. Supabase JWT signing material.
4. Clerk secret key and session secrets.
5. Stripe keys and webhook secrets.
6. LearnWorlds client secret and access token.
7. HeyGen and Pollo API keys or webhook secrets.
8. Certificate signing keys.
9. Owner bootstrap codes.
10. Any private encryption key or recovery code.

A controlled key rotation plan remains required after application compatibility is restored.

## Current security status

```text
Direct anonymous access to public schema: blocked
Direct authenticated access to public schema: blocked
Direct public table grants in public schema: zero
Direct public function grants in public schema: zero
RLS enabled and forced on all public base tables: yes
Public views using security invoker: all
Supabase Storage buckets: none
Academy public catalog Edge Function: service role only
Website integration with private catalog function: not yet repaired
Website control fallback: fail open and must be corrected
Remaining Edge Functions reviewed: no
Supabase key rotation complete: no
Forensic log review complete: no
GitHub repository private: no
Public Git history exposure review complete: no
Full security closure: no
```

## Required next actions

The order of work is mandatory:

1. Update all handoff, activity, failure, and restart records with this incident state.
2. Correct the website Academy control integration to use server only service role access and fail closed behavior.
3. Add security regression tests.
4. Review and harden all twelve remaining Edge Functions.
5. Review Supabase Auth, Storage, Realtime, GraphQL, API settings, network restrictions, and logging.
6. Review the prior twenty four hours of database, API, Auth, and Edge Function logs for suspicious access.
7. Rotate Supabase and dependent deployment credentials in a controlled sequence.
8. Change the GitHub repository to private and review access and history exposure.
9. Run current head GitHub Actions and application acceptance tests.
10. Keep course publication, shell transfer, website cinematic activation, and production cutover blocked until security closure and explicit owner approval.

## Continuous record rule

After every security action, update these files immediately:

```text
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md
docs/academy-media-pipeline/LATEST-HANDOFF.md
docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md
docs/OBSERRA-ACADEMY-RESTART-HERE.md
docs/academy-media-pipeline/ACTIVITY-LEDGER.md
docs/academy-media-pipeline/FAILURE-REGISTER.md
```

Record both successful and failed actions. Do not wait until the end of a session.

## Truth boundary

The emergency database containment is real and verified. It materially reduces direct database exposure.

It does not establish that no prior unauthorized access occurred. It does not complete Edge Function hardening, key rotation, GitHub privacy remediation, forensic review, or application compatibility repair. No statement may describe the entire Obserra Academy environment as secure, closed, uncompromised, or production ready until those controls are completed and validated.
