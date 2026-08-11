# Obserra Academy Supabase Security Handoff

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/learnworlds-commercial-pipeline`

Pull request: `55`

Supabase project: `Obserra Academy`

Supabase project reference: `nwxnyqlyzyufgoadtqxs`

Region: `us-east-1`

Recorded: 2026-08-11

Last updated: 2026-08-11

Status: Emergency database, application-control, and Edge Function containment applied. Credential rotation, full forensics, GitHub privacy remediation, deployment-secret configuration, and current-head CI remain incomplete.

## Owner direction

The owner reported a Supabase notice indicating that an Obserra Academy table was publicly accessible and directed that all Academy data, intellectual property, learner information, production records, prompts, course content, assessment material, media metadata, and operational data be protected from unauthorized access, theft, copying, or exfiltration.

The governing rule is deny by default. Browser clients, anonymous users, ordinary authenticated Supabase users, public PostgREST callers, public GraphQL callers, public RPC callers, retired worker clients, and obsolete production-control clients must not receive direct database access.

Trusted backend access is allowed only through approved server-side code, narrowly authorized service-role operations, credentials stored in an approved secret manager, and explicit fail-closed controls.

## Initial security findings

The Supabase security advisor, database catalogs, Edge Function source, and repository state identified material exposure conditions before containment:

1. Multiple tables in the exposed `public` schema did not have row-level security enabled.
2. Anonymous and authenticated roles held direct privileges on Academy production, integration, worker, usage, audit, and owner-work objects.
3. Several views used owner-security semantics rather than invoker-security semantics.
4. Multiple security-definer functions were executable by anonymous or ordinary authenticated roles.
5. One function had a mutable search path.
6. The `academy-public-catalog` Edge Function was publicly callable, used a service-role client internally, returned cross-origin responses to any origin, and did not require platform JWT verification.
7. Twelve additional Edge Functions had platform JWT verification disabled.
8. Multiple high-privilege legacy functions reused one static bearer-token digest embedded in function source.
9. Several legacy functions were tied to the retired local Windows worker farm, obsolete publication flows, owner-work automation, or persistent-memory control paths that are not part of the approved commercial architecture.
10. The GitHub repository containing internal Academy implementation and production-planning material is public.

These findings created a credible risk of unauthorized access, modification, operational disruption, or intellectual-property exposure. They do not prove that data was taken. No completed forensic review rules out unauthorized access.

## Emergency database containment

### Migration 20260811223159

```text
emergency_private_database_lockdown_v2
```

This migration:

1. Revoked direct privileges on the `public` schema from `public`, `anon`, and `authenticated`.
2. Revoked direct table and view privileges from those roles.
3. Revoked sequence privileges.
4. Revoked RPC execution.
5. Revoked exposed type usage.
6. Preserved trusted backend access for `service_role`.
7. Enabled row-level security on every base table in the `public` schema.
8. Forced row-level security on every base table in the `public` schema.
9. Changed every public view to security-invoker behavior.
10. Pinned the mutable function search path.
11. Established deny-by-default privileges for future objects created by the database owner.

### Migration 20260811224121

```text
disable_unused_public_api_surfaces
```

This migration attempted to remove anonymous and ordinary authenticated access to unused Storage, Realtime, and GraphQL database surfaces. Supabase retains platform-managed grants on parts of these schemas.

Current residual facts:

1. No Supabase Storage buckets exist.
2. Storage tables have RLS enabled and no permissive policies.
3. The approved Obserra Academy architecture does not require direct browser use of Storage, Realtime, or GraphQL.
4. Direct access to the Obserra `public` schema is independently blocked.
5. Project-level managed-service review remains required.

## Verified database state

Direct post-migration verification produced:

```text
Public schema base tables: 58
RLS enabled tables: 58
RLS forced tables: 58
Anonymous public schema usage: false
Authenticated public schema usage: false
Anonymous or authenticated public table grants: 0
Anonymous or authenticated public function grants: 0
Public views: 9
Security-invoker public views: 9
Non-security-invoker public views: 0
Supabase Storage buckets: 0
```

The current Supabase security advisor reports only informational `RLS Enabled No Policy` notices. Under the present architecture, the absence of policies is intentional because direct API roles are denied by default and approved server-side operations use service-role access.

The prior advisor errors and warnings for public RLS exposure, security-definer views, public security-definer RPC execution, and mutable search path are no longer present.

## Private Academy catalog control

The `academy-public-catalog` Edge Function is version 2 with:

```text
Platform JWT verification: enabled
Required caller role: service_role
Public CORS wildcard: removed
Cache policy: private and no store
Unauthorized response: 404
Missing control default: unpublished and not purchasable
Current hash: 7a7c8d2dcf118a72cde0513ee86435a21cb9e5701e5de5b25a60cbbf255112ae
```

The function remains the only functional Edge Function in the project. It is intended only for server-to-server Academy control retrieval.

## Website application-control repair

The website integration was changed from an unauthenticated, cacheable catalog call and fail-open fallback to a server-only, service-role-authorized, fail-closed design.

Updated files:

```text
lib/academy-control-contracts.ts
lib/academy-control.ts
.env.example
test/academy-supabase-private-control.test.mjs
app/academy/AcademyClient.tsx
```

Implemented controls:

1. `server-only` is imported by both control modules.
2. The website reads `SUPABASE_SERVICE_ROLE_KEY` only from the server runtime.
3. The exact Supabase host and function path are validated.
4. Requests use `apikey` and `Authorization: Bearer` headers.
5. Requests use `no-store`, reject redirects, and have bounded timeouts.
6. Missing or invalid service-role configuration fails closed.
7. Catalog failure returns no public courses.
8. Course failure returns no course.
9. Default course controls are unpublished, invisible, and not purchasable.
10. Error logging records only a controlled error code, not credentials or provider response bodies.
11. Browser-facing Academy files are regression-tested to exclude the service-role variable.
12. The legacy Academy client explicitly keeps cinematic media disabled.

Deployment requirement:

```text
SUPABASE_SERVICE_ROLE_KEY
```

This value must be entered only in the Vercel or approved deployment secret store. It must never use a `NEXT_PUBLIC` prefix, enter source control, appear in client code, be printed in logs, or be copied into documentation.

### Current validation state

The new security tests, existing tests, and lint passed on the first security-integration CI attempt. The production build then failed because the legacy `AcademyClient` wrapper did not pass the required `cinematicMediaEnabled` property.

The wrapper was corrected with:

```text
cinematicMediaEnabled={false}
```

Current-head GitHub Actions must run again after all subsequent security and documentation commits. No current-head passing claim is authorized yet.

## Edge Function containment

A complete function inventory and preserved pre-containment hashes are recorded in:

```text
docs/OBSERRA-ACADEMY-EDGE-FUNCTION-SECURITY-REGISTER.md
```

The project currently has thirteen active function records:

```text
Platform JWT verification enabled: 13
Functional functions: 1
Functional service-role-only functions: 1
Inert retired functions: 12
Functions accepting the legacy shared static token: 0
```

The following functions were replaced by inert 404 implementations with platform JWT verification enabled, no Supabase client, no service-role key, no database access, no CORS, and private no-store response headers:

1. `academy-owner-control`
2. `academy-checkpoint-gateway`
3. `academy-local-worker-control`
4. `academy-local-worker-diagnostics`
5. `academy-command-center-publish`
6. `application-worker-control`
7. `academy-worker-operations`
8. `owner-work-control`
9. `obserrian-control`
10. `obserra-production-control`
11. `academy-production-control`
12. `academy-owner-release-control`

The owner-control, worker, diagnostics, checkpoint, persistent-memory, application-worker, production-control, and release-control APIs are unavailable by design during containment.

No legacy function may be restored by reintroducing the shared static token. Any future owner-control or automation capability requires a new isolated architecture, independent short-lived credentials, exact caller identity, least privilege, rate limiting, and complete audit logging.

## Static bearer-token reuse finding

The same digest was embedded across multiple legacy functions:

```text
49fd34b00dd348760f632382d4a284d0c5036bae5a71e1d2beaa7603090236c7
```

The original token value is not recorded in this handoff. The token is retired from current function code. It must still be revoked or rotated in any external client, environment variable, local script, or secret store where it may exist.

## Initial forensic log review

A first-pass review was started across Supabase API, Edge Function, Auth, and Postgres logs.

Observed:

1. Auth logs returned no events in the available window.
2. API logs showed repeated reads of `academy_course_controls` and `academy_course_content_overrides` with Deno or Supabase Edge Runtime user agents.
3. Edge Function logs showed repeated `academy-public-catalog` version 1 GET traffic, predominantly successful, with a small number of service errors.
4. The API-read pattern is consistent with the old public catalog function calling PostgREST internally.
5. Postgres logs showed expected migration, checkpoint, and privilege-revocation warnings generated during containment.

Current interpretation:

The available records support an inference that the repeated control-table reads were generated by the old Edge Function and website control flow. This is not proof that no unauthorized caller accessed the function, because the old function was publicly callable and the available log window and fields are limited.

Forensic review remains incomplete. Data theft has not been proven, and unauthorized access has not been ruled out.

## GitHub intellectual-property exposure

Current repository state:

```text
Repository: jblan2026-hub/obserra-website
Visibility: public
Pull request 55: open and Draft
Repository contains internal implementation and production-planning material
Secret values intentionally committed: none identified in this review
Public-history exposure assessment: not complete
```

Required owner action:

1. Change the repository to private.
2. Review collaborators, outside access, deploy keys, installed applications, Actions, forks, and public clones.
3. Review Git history for confidential intellectual property and secret material.
4. Rotate any credential that may have been copied, logged, committed, or exposed in a screenshot.
5. Preserve audit evidence before rewriting history or deleting material.

The repository remains a merge blocker until visibility and exposure review are complete.

## Credential and secret boundary

No secret value is recorded in this handoff.

The following material must remain only in approved secret stores:

1. Supabase service-role key.
2. Supabase database password.
3. Supabase JWT-signing material.
4. Retired legacy control token, until revoked everywhere.
5. Clerk secret key and session secrets.
6. Stripe keys and webhook secrets.
7. LearnWorlds client secret and access token.
8. HeyGen and Pollo API keys or webhook secrets.
9. Certificate-signing keys.
10. Owner bootstrap codes.
11. Any private encryption key or recovery code.

## Current security status

```text
Direct anonymous access to public schema: blocked
Direct authenticated access to public schema: blocked
Direct public table grants in public schema: zero
Direct public function grants in public schema: zero
RLS enabled and forced on all public base tables: yes
Public views using security invoker: all
Supabase Storage buckets: none
Academy private catalog Edge Function: service-role only
Website private catalog code: implemented
Website fail-closed behavior: implemented
Website security regression tests: implemented
Website current-head CI after final fixes: pending
All Edge Functions with platform JWT verification: yes
Retired legacy functions made inert: 12
Legacy shared static token accepted by current functions: no
Owner-control Edge Function available: no, intentionally inert
Supabase key rotation complete: no
Legacy static-token revocation complete: not proven
Forensic log review complete: no
Vercel service-role secret configured: not proven
GitHub repository private: no
Public Git history exposure review complete: no
Full security closure: no
```

## Required next actions

1. Update all handoff, activity, failure, and restart records after every security action.
2. Run current-head GitHub Actions and resolve any security-integration failures.
3. Configure `SUPABASE_SERVICE_ROLE_KEY` in the approved Vercel secret store without exposing it.
4. Validate the private catalog path in a protected Preview deployment.
5. Verify anonymous and ordinary authenticated calls cannot retrieve database or Edge Function data.
6. Review Supabase Auth, Storage, Realtime, GraphQL, API, network, and logging settings.
7. Continue forensic review across the longest available log-retention window.
8. Rotate the service-role key, database password, JWT-signing material where appropriate, and the retired shared control token in a controlled sequence.
9. Update Vercel and any approved backend clients after rotation.
10. Change the GitHub repository to private and review access and public history.
11. Keep course publication, shell transfer, website cinematic activation, merge, and production cutover blocked until security closure and explicit owner approval.

## Continuous record rule

After every security action, update:

```text
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md
docs/OBSERRA-ACADEMY-EDGE-FUNCTION-SECURITY-REGISTER.md
docs/academy-media-pipeline/LATEST-HANDOFF.md
docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md
docs/OBSERRA-ACADEMY-RESTART-HERE.md
docs/academy-media-pipeline/ACTIVITY-LEDGER.md
docs/academy-media-pipeline/FAILURE-REGISTER.md
```

Record successful and failed actions immediately.

## Truth boundary

The emergency database containment, private catalog hardening, fail-closed website code, and inert retirement of twelve legacy Edge Functions are real and verified at their respective control points.

This does not establish that no prior unauthorized access occurred. It does not complete current-head CI, deployment-secret configuration, protected Preview validation, key rotation, managed-service review, GitHub privacy remediation, or forensic review.

No statement may describe the complete Obserra Academy environment as secure, closed, uncompromised, or production ready until those controls are completed and validated.
