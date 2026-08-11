# Obserra Academy, Supabase, LearnWorlds, HeyGen, Pollo, and Website Continuous Handoff

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Last updated:** 2026-08-11  
**Security closure:** Not complete  
**Academy production cutover:** Not authorized  
**Website cinematic activation:** Not authorized

## Mandatory restart order

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
12. `docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md`
13. Pull request `55`

Security remediation is the first workstream. Do not resume ordinary course production, LearnWorlds shell transfer, website-media activation, merge, or publication until the first incomplete security action is addressed.

## Executive truth

A Supabase public-exposure condition was identified for Obserra Academy. Emergency database containment, private catalog hardening, fail-closed website control code, and inert retirement of twelve legacy Edge Functions are implemented.

Full security closure is not complete because current-head CI, protected deployment validation, service-role secret configuration, credential rotation, forensic review, managed-service review, GitHub privacy, and public-history review remain incomplete.

```text
Public base tables with RLS enabled and forced: 58 of 58
Anonymous public schema usage: false
Authenticated public schema usage: false
Anonymous or authenticated public table grants: 0
Anonymous or authenticated public function grants: 0
Public views using security invoker: 9 of 9
Edge Functions with platform JWT verification: 13 of 13
Functional Edge Functions: 1
Inert retired Edge Functions: 12
Legacy shared static token accepted by current functions: no
Website private catalog code: implemented
Website fail-closed behavior: implemented
Website security tests: implemented
Current-head CI: pending
Vercel service-role secret configured: not proven
Supabase credential rotation: incomplete
Forensic review: incomplete
GitHub repository visibility: public
GitHub exposure review: incomplete
LearnWorlds Sandbox commerce: passed
LearnWorlds canary shell: exists
Remaining LearnWorlds shells: not proven uploaded
HeyGen likeness canary: not accepted
Complete Cybersecurity Foundations media: not accepted
Pollo website MP4 assets: not rendered or uploaded
Website cinematic feature flag: false
Pull request merged: no
Full security closure: no
```

No statement may describe the environment as secure, uncompromised, published, uploaded, active, commercially ready, or complete until the corresponding evidence passes.

## Supabase containment state

Project:

```text
Obserra Academy
nwxnyqlyzyufgoadtqxs
us-east-1
```

Applied migrations:

```text
20260811223159 emergency_private_database_lockdown_v2
20260811224121 disable_unused_public_api_surfaces
```

The database now denies direct anonymous and ordinary authenticated access to the Obserra `public` schema. All public base tables have RLS enabled and forced, and all public views use security-invoker behavior.

`academy-public-catalog` is the only functional Edge Function. It requires a platform-validated service-role JWT and returns unpublished, non-purchasable defaults when a control record does not exist.

Twelve legacy worker, diagnostics, checkpoint, publication, persistent-memory, owner-work, production-control, release-control, and owner-control functions were replaced by inert 404 implementations with platform JWT verification enabled and no database access.

Detailed security evidence:

```text
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md
docs/OBSERRA-ACADEMY-EDGE-FUNCTION-SECURITY-REGISTER.md
```

## Website private-control state

Updated:

```text
lib/academy-control-contracts.ts
lib/academy-control.ts
.env.example
test/academy-supabase-private-control.test.mjs
app/academy/AcademyClient.tsx
```

Required server secret:

```text
SUPABASE_SERVICE_ROLE_KEY
```

The website now uses server-only authorization, exact endpoint validation, no-store requests, bounded timeouts, fail-closed catalog and course behavior, and controlled error-code logging.

The key must remain only in the approved deployment secret store. Runtime configuration and protected Preview validation are not yet proven.

## Initial forensic review

Available API and Edge Function logs showed repeated version 1 public-catalog traffic and Deno or Edge Runtime reads of Academy control tables. This is consistent with the old public function calling PostgREST internally.

The available logs do not provide complete caller attribution or a sufficiently long retention window to rule out unauthorized access. Data theft is not proven. An uncompromised conclusion is not authorized.

## GitHub intellectual-property boundary

```text
Repository: jblan2026-hub/obserra-website
Visibility: public
Pull request 55: open and Draft
```

The repository must be changed to private. Collaborators, applications, deploy keys, Actions, forks, clones, and public history must be reviewed. Confidential course source, assessment answers, learner data, raw avatar material, private prompts, signing keys, and provider credentials must never be committed.

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

Sandbox checkout, purchase, invoice, enrollment, and shell opening were proven. The canary remains an incomplete course shell. The remaining LearnWorlds shells are not proven uploaded.

## Course production standard

```text
Standard ID: obserra-cinematic-enterprise-v1
Courses: 60
HeyGen assets per course: 7
Pollo assets per course: 10
Total assets per course: 17
Portfolio assets: 1020
Maximum uninterrupted avatar segment: 20 seconds
Minimum finished video per course: 27 minutes
Target finished video per course: approximately 37 minutes
```

The owner rejected robotic, static, low-quality course production. Every course must use the same cinematic enterprise standard.

## Website cinematic advertising system

```text
Manifest ID: obserra-website-pollo-cinematic-v1
Feature flag: NEXT_PUBLIC_OBSERRA_CINEMATIC_MEDIA_ENABLED=false
```

The homepage supports two cinematic loops and four official-brand campaign ads with static poster fallback, viewport-aware playback, user controls, reduced-motion fallback, video-error fallback, official logo overlay, and responsive layouts.

No Pollo website MP4 is claimed rendered or uploaded.

## Immediate work order

1. Run current-head GitHub Actions.
2. Configure `SUPABASE_SERVICE_ROLE_KEY` in the approved Vercel secret store.
3. Validate the private catalog in a protected Preview deployment.
4. Test anonymous and authenticated denial paths.
5. Review Supabase managed service and network settings.
6. Continue forensic review.
7. Rotate Supabase and retired-control credentials.
8. Make the GitHub repository private and review public exposure.
9. Finish HeyGen and Cybersecurity Foundations media acceptance.
10. Complete LearnWorlds course, assessment, certificate, and learner acceptance.
11. Generate and validate the six Pollo website assets.
12. Obtain explicit owner approval before merge, publication, shell transfer, or website activation.

## Non-negotiable blockers

Do not merge, publish, transfer remaining shells, or activate cinematic media until:

1. The repository is private.
2. Public-history and access review is complete.
3. Protected Supabase runtime validation passes.
4. Current-head CI and security tests pass.
5. Credential rotation and forensic review are complete or explicitly risk accepted.
6. HeyGen and course-media canaries pass.
7. LearnWorlds playback, assessment, completion, certificate, and Sandbox learner acceptance pass.
8. Every active Pollo website asset exists and passes security, technical, and brand review.
9. Explicit owner approval is recorded.

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

## Resume command

```text
Read docs/academy-media-pipeline/LATEST-HANDOFF.md first on branch feature/learnworlds-commercial-pipeline in jblan2026-hub/obserra-website. Then read the Supabase security handoff, Edge Function security register, security activity continuation, and security failure continuation. Continue from the first incomplete security action. Never claim security closure, LearnWorlds upload, Pollo rendering, media acceptance, merge, website activation, publication, or production release without direct evidence.
```
