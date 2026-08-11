# Obserra Academy, Supabase, and Website: Restart Here

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Business email:** `info@obserrallc.com`  
**Repository:** `jblan2026-hub/obserra-website`  
**Working branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Last updated:** 2026-08-11  
**Security closure:** Not complete  
**Academy production cutover:** Not authorized  
**Website cinematic activation:** Not authorized

## Mandatory restart instruction

Read these sources before making recommendations or changes:

1. `docs/academy-media-pipeline/LATEST-HANDOFF.md`
2. `docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md`
3. `docs/OBSERRA-ACADEMY-EDGE-FUNCTION-SECURITY-REGISTER.md`
4. `docs/academy-media-pipeline/SECURITY-ACTIVITY-CONTINUATION.md`
5. `docs/academy-media-pipeline/SECURITY-FAILURE-CONTINUATION.md`
6. `docs/OBSERRA-ACADEMY-RESTART-HERE.md`
7. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md`
8. `docs/academy-media-pipeline/ACTIVITY-LEDGER.md`
9. `docs/academy-media-pipeline/FAILURE-REGISTER.md`
10. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md`
11. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-WEBSITE-CINEMATIC-ADS.md`
12. `docs/academy-media-pipeline/canary/HEYGEN-15-SECOND-LIKENESS-CANARY.md`
13. `docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md`
14. Pull request `#55`

Use this continuation instruction:

```text
Read docs/academy-media-pipeline/LATEST-HANDOFF.md first on branch feature/learnworlds-commercial-pipeline in jblan2026-hub/obserra-website. Then read the Supabase security handoff, Edge Function security register, security activity continuation, security failure continuation, and continuous Academy handoff. Continue from the first incomplete security action. Record every success and failure immediately. Never claim security closure, LearnWorlds upload, Pollo rendering, media acceptance, merge, website activation, publication, or production release without direct evidence.
```

## Executive truth

A Supabase public-exposure condition was identified for Obserra Academy.

Emergency containment now includes:

1. Direct anonymous and ordinary authenticated access removed from the Obserra `public` schema.
2. RLS enabled and forced on all 58 public base tables.
3. Direct public table and function grants reduced to zero.
4. All nine public views changed to security-invoker behavior.
5. `academy-public-catalog` restricted to service-role server calls.
6. Website Academy controls changed to server-only authorization and fail-closed behavior.
7. All thirteen Edge Function records changed to platform JWT verification.
8. Twelve legacy Edge Functions replaced by inert 404 implementations with no database access.
9. The shared static legacy control token retired from current function code.

Full closure is not complete.

```text
Database direct public access: blocked
Website private-control code: implemented
Website fail-closed behavior: implemented
Website security tests: implemented
Current-head CI: pending
Functional Edge Functions: 1
Inert legacy Edge Functions: 12
Owner-control availability: intentionally disabled
Vercel service-role secret configured: not proven
Supabase credential rotation: incomplete
Legacy static-token external revocation: not proven
Forensic review: incomplete
GitHub repository visibility: public
GitHub exposure review: incomplete
LearnWorlds canary shell: exists
Remaining LearnWorlds shells: not proven uploaded
HeyGen likeness canary: not accepted
Complete Cybersecurity Foundations media: not accepted
Pollo website MP4 assets: not rendered or uploaded
Website cinematic feature flag: false
Pull request merged: no
Full security closure: no
```

No statement may describe the environment as secure, uncompromised, published, usable, uploaded, active, commercially ready, or complete until the corresponding evidence passes.

## Supabase project

```text
Project: Obserra Academy
Project reference: nwxnyqlyzyufgoadtqxs
Region: us-east-1
```

Applied migrations:

```text
20260811223159 emergency_private_database_lockdown_v2
20260811224121 disable_unused_public_api_surfaces
```

Current database verification:

```text
Public base tables: 58
RLS enabled and forced: 58
Anonymous or authenticated public table grants: 0
Anonymous or authenticated public function grants: 0
Public views using security invoker: 9 of 9
Storage buckets: 0
Security Advisor errors: 0
Security Advisor warnings: 0
```

## Current Edge Function state

```text
Active function records: 13
Platform JWT verification enabled: 13
Functional functions: 1
Service-role-only functional functions: 1
Inert retired functions: 12
```

The only functional function is `academy-public-catalog`. The owner-control, worker, diagnostics, checkpoint, publication, application-worker, owner-work, persistent-memory, production-control, and release-control functions are inert by design.

## Current website private-control state

Updated:

```text
lib/academy-control-contracts.ts
lib/academy-control.ts
.env.example
test/academy-supabase-private-control.test.mjs
app/academy/AcademyClient.tsx
```

Required deployment secret:

```text
SUPABASE_SERVICE_ROLE_KEY
```

The value must be stored only in the approved Vercel secret store and must never use a `NEXT_PUBLIC` prefix or enter browser code, logs, source control, documentation, or generated assets.

## Forensic truth

Available logs showed old public-catalog traffic and Deno or Edge Runtime reads of Academy control tables. This is consistent with the previous public function's internal PostgREST calls.

The log window and caller attribution are incomplete. Data theft is not proven. An uncompromised conclusion is not authorized.

## GitHub blocking condition

```text
Repository: jblan2026-hub/obserra-website
Visibility: public
Pull request 55: open and Draft
```

The repository must be changed to private. Review collaborators, installed applications, deploy keys, Actions, forks, clones, and public Git history before merge or production use.

## LearnWorlds current state

```text
School: Obserra EPI Academy
School ID: 6a7a693d353feb69c94c7654
School URL: https://obserraepillc.learnworlds.com
Governed API URL: https://obserraepillc.learnworlds.com/admin/api/
Preferred custom domain: https://academy.obserrallc.com
Business email: info@obserrallc.com

Canary course ID: cybersecurity-foundations-for-new-professionals
Store product ID: cybersecurity_foundations_for_new_professionals
Package ID: package_6a7b2d3710387
Status: sandbox
List price: $149
Sandbox offer: $99
```

Sandbox checkout, purchase, invoice, enrollment, and course-shell opening were proven. The real course, assessment, certificate, and remaining shells are not complete or proven.

## Course and website media state

```text
Course standard: obserra-cinematic-enterprise-v1
Courses: 60
Assets per course: 17
Portfolio assets: 1020
Maximum uninterrupted avatar segment: 20 seconds
Website cinematic manifest: obserra-website-pollo-cinematic-v1
Website cinematic feature flag: false
Pollo website MP4 assets rendered: no
Pollo website MP4 assets uploaded: no
```

## Exact next actions

1. Run current-head GitHub Actions.
2. Configure the Supabase service-role key in the approved Vercel secret store.
3. Validate the private catalog in a protected Preview deployment.
4. Verify anonymous and ordinary authenticated denial paths.
5. Review Supabase managed-service and network settings.
6. Continue forensic log review.
7. Rotate Supabase and retired-control credentials.
8. Make the GitHub repository private and review public exposure.
9. Finish the HeyGen likeness and course-media canaries.
10. Complete LearnWorlds playback, assessment, certificate, and learner acceptance.
11. Generate and validate the six Pollo website assets.
12. Obtain explicit owner approval before merge, publication, shell transfer, or website activation.

## Non-negotiable blockers

Do not merge, publish, transfer remaining shells, or activate cinematic media until:

1. Repository visibility is private.
2. Public-history and access review is complete.
3. Protected Supabase runtime validation passes.
4. Current-head CI and security tests pass.
5. Credential rotation and forensic review are complete or explicitly risk accepted.
6. HeyGen and course-media canaries pass.
7. LearnWorlds playback, assessment, completion, certificate, and Sandbox learner acceptance pass.
8. Every active Pollo website asset exists and passes security, technical, and brand review.
9. Explicit owner approval is documented.

## Continuous audit rule

After every action, update the dedicated security handoff or continuation record immediately:

```text
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md
docs/OBSERRA-ACADEMY-EDGE-FUNCTION-SECURITY-REGISTER.md
docs/academy-media-pipeline/LATEST-HANDOFF.md
docs/academy-media-pipeline/SECURITY-ACTIVITY-CONTINUATION.md
docs/academy-media-pipeline/SECURITY-FAILURE-CONTINUATION.md
```

The continuation files must be consolidated into the original activity and failure registers before release.
