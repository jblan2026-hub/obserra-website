# Obserra Academy Security Activity Continuation

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/learnworlds-commercial-pipeline`

Recorded: 2026-08-11

Status: Append-only continuation of `ACTIVITY-LEDGER.md` after Activity 64

## Activity 65: Website private catalog integration implemented

Updated:

```text
lib/academy-control-contracts.ts
lib/academy-control.ts
```

The Academy control modules are server only. The website now reads `SUPABASE_SERVICE_ROLE_KEY` only from the server runtime, validates the exact Supabase host and function path, sends service-role authorization, disables caching, rejects redirects, and uses bounded request timeouts.

## Activity 66: Academy control failure behavior changed to fail closed

The default course control now resolves to:

```text
lifecycle: unpublished
publicVisible: false
purchaseEnabled: false
reason: control-authority-unavailable
```

A catalog control failure returns no public courses. A single-course control failure returns no course. The previous baseline-catalog and default-published fallback was removed.

## Activity 67: Supabase service-role deployment boundary documented

Updated `.env.example` with:

```text
SUPABASE_SERVICE_ROLE_KEY=
```

The documentation prohibits `NEXT_PUBLIC` exposure, source-control storage, browser use, logging, or inclusion in generated assets and handoff records.

## Activity 68: Supabase private-control regression tests implemented

Added:

```text
test/academy-supabase-private-control.test.mjs
```

The tests verify:

1. Server-only module boundaries.
2. Service-role authorization headers.
3. No-store private requests.
4. Exact fail-closed defaults.
5. Empty catalog and null course on degraded control.
6. No service-role reference in browser-facing Academy files.
7. Error-code-only logging.

## Activity 69: Security integration CI reached production build

GitHub Actions ran the security integration commit. Unit tests passed and lint passed with the existing unrelated warning.

The production build failed because the legacy `AcademyClient` wrapper did not provide the required `cinematicMediaEnabled` property.

## Activity 70: Legacy Academy client wrapper corrected

Updated:

```text
app/academy/AcademyClient.tsx
```

The wrapper now explicitly passes:

```text
cinematicMediaEnabled={false}
```

This preserves fail-closed cinematic behavior and resolves the TypeScript contract defect. Current-head CI remains required after subsequent security documentation changes.

## Activity 71: Initial Supabase forensic log review started

Reviewed available API, Edge Function, Auth, and Postgres logs.

Observed:

1. Auth logs returned no events in the available window.
2. API logs showed repeated reads of Academy course-control tables with Deno or Supabase Edge Runtime user agents.
3. Edge Function logs showed repeated version 1 public-catalog GET traffic, mostly successful with a small number of service errors.
4. Postgres logs showed containment migrations, checkpoints, and expected privilege-revocation warnings.

The read pattern is consistent with the old public catalog function calling PostgREST internally. This is an inference, not forensic proof that no unauthorized caller accessed the old public function.

## Activity 72: Legacy Edge Function source and authentication reviewed

Reviewed all thirteen active Supabase Edge Function records and relevant source.

Identified:

1. One functional public-catalog function.
2. One owner-control function using custom Clerk verification.
3. Eleven legacy worker, diagnostics, checkpoint, publication, persistent-memory, owner-work, and production-control functions.
4. One static token digest reused across multiple high-privilege functions.
5. Public health or status routes on some legacy functions.
6. Service-role database access inside legacy functions.
7. Dependencies on retired Windows worker and command-center architecture.

## Activity 73: Edge Function security register created

Added:

```text
docs/OBSERRA-ACADEMY-EDGE-FUNCTION-SECURITY-REGISTER.md
```

The register preserves pre-containment versions and hashes, authentication findings, retirement decisions, the shared token digest, current versions and hashes, and the inert-function standard.

## Activity 74: Twelve legacy Edge Functions made inert

Redeployed these functions as generic 404 endpoints with platform JWT verification enabled, no Supabase client, no service-role key, no database access, no CORS, and private no-store headers:

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

## Activity 75: Edge Function inventory verified after containment

Current Supabase function inventory:

```text
Active function records: 13
Platform JWT verification enabled: 13
Functional functions: 1
Functional service-role-only functions: 1
Inert retired functions: 12
Functions accepting the legacy shared static token: 0
```

The only functional function is `academy-public-catalog`, which requires service-role authorization.

## Activity 76: Shared static control token retired from function code

The legacy digest:

```text
49fd34b00dd348760f632382d4a284d0c5036bae5a71e1d2beaa7603090236c7
```

is no longer present in current function versions. External copies of the original token must still be revoked or rotated.

## Activity 77: Owner-control and automation surfaces intentionally disabled

The owner-control, worker, diagnostics, checkpoint, persistent-memory, owner-work, production-control, and release-control APIs are unavailable by design during containment.

They may not be restored by reintroducing the shared static token. Any replacement requires a new owner-only architecture with independent short-lived credentials, exact caller identity, least privilege, rate limiting, and full audit logging.

## Activity 78: Security handoff and Edge Function register refreshed

Updated:

```text
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md
docs/OBSERRA-ACADEMY-EDGE-FUNCTION-SECURITY-REGISTER.md
```

The documents now record the website private-control repair, fail-closed behavior, CI failure and correction, initial log review, inert retirement of legacy functions, current function hashes, and remaining closure actions.

## Current state

```text
Direct public database access: blocked
Public base tables with RLS enabled and forced: 58 of 58
Anonymous or authenticated public table grants: 0
Anonymous or authenticated public function grants: 0
Public views using security invoker: 9 of 9
Website private catalog code: implemented
Website fail-closed behavior: implemented
Website security tests: implemented
Current-head GitHub CI: pending
All Edge Functions with platform JWT verification: 13 of 13
Legacy functions made inert: 12
Functional Edge Functions: academy-public-catalog only
Owner-control function available: no, intentionally inert
Service-role key configured in Vercel: not proven
Service-role and database credential rotation: not complete
Legacy shared token revoked outside function code: not proven
Forensic review: incomplete
GitHub repository visibility: public
GitHub exposure review: incomplete
Full security closure: no
```
