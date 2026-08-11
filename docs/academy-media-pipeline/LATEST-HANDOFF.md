# Obserra Academy and Website Latest Handoff

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/learnworlds-commercial-pipeline`

Pull request: `55`

Last updated: 2026-08-11

Security closure: Not complete

Academy production cutover: Not authorized

Website cinematic media activation: Not authorized

## Read this first

This file is the canonical current-state pointer for Obserra Academy security, Supabase, LearnWorlds, HeyGen, Pollo AI, learner dashboard, website cinematic media, and website advertising work.

Security remediation has priority over course production, shell transfer, media activation, merge, and publication.

Read these sources in order:

1. `docs/academy-media-pipeline/LATEST-HANDOFF.md`
2. `docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md`
3. `docs/OBSERRA-ACADEMY-EDGE-FUNCTION-SECURITY-REGISTER.md`
4. `docs/academy-media-pipeline/SECURITY-ACTIVITY-CONTINUATION.md`
5. `docs/academy-media-pipeline/SECURITY-FAILURE-CONTINUATION.md`
6. `docs/OBSERRA-ACADEMY-RESTART-HERE.md`
7. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md`
8. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md`
9. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-WEBSITE-CINEMATIC-ADS.md`
10. `docs/academy-media-pipeline/ACTIVITY-LEDGER.md`
11. `docs/academy-media-pipeline/FAILURE-REGISTER.md`
12. `docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md`
13. `docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md`
14. `docs/pollo-website-campaigns/POLLO-WEBSITE-INTERACTIVE-ADS-PRODUCTION-PACK.md`
15. Pull request `55`

Do not represent the complete environment as secure, uncompromised, production ready, merged, published, uploaded, rendered, or activated until the corresponding evidence is complete.

## Current security incident state

The owner reported a Supabase notice that an Obserra Academy table was publicly accessible and directed that all Academy data and intellectual property be protected from unauthorized access, theft, copying, or exfiltration.

No evidence currently proves that data was taken. No completed forensic review rules out unauthorized access.

### Emergency database containment

Supabase project:

```text
Project: Obserra Academy
Project reference: nwxnyqlyzyufgoadtqxs
Region: us-east-1
Status: ACTIVE_HEALTHY
```

Applied migrations:

```text
20260811223159 emergency_private_database_lockdown_v2
20260811224121 disable_unused_public_api_surfaces
```

Verified state:

```text
Public schema base tables: 58
RLS enabled tables: 58
RLS forced tables: 58
Anonymous public schema usage: false
Authenticated public schema usage: false
Anonymous or authenticated public table grants: 0
Anonymous or authenticated public function grants: 0
Public views using security invoker: 9 of 9
Supabase Storage buckets: 0
Security Advisor errors: 0
Security Advisor warnings: 0
```

Remaining advisor notices are informational deny-by-default `RLS Enabled No Policy` notices.

### Private Academy catalog

`academy-public-catalog` version 2 is the only functional Edge Function.

```text
Platform JWT verification: enabled
Required caller role: service_role
Wildcard CORS: removed
Cache policy: private and no store
Unauthorized response: 404
Missing control default: unpublished and not purchasable
```

### Website application-control repair

Implemented:

1. Server-only Academy control modules.
2. `SUPABASE_SERVICE_ROLE_KEY` read only from server runtime.
3. Exact Supabase host and path validation.
4. Service-role `apikey` and bearer authorization.
5. No-store requests, redirect rejection, and bounded timeouts.
6. Empty catalog and null course on control failure.
7. Unpublished, invisible, not-purchasable default controls.
8. Error-code-only logging.
9. Browser-surface secret regression tests.
10. Explicit `cinematicMediaEnabled={false}` in the legacy Academy wrapper.

Deployment requirement:

```text
SUPABASE_SERVICE_ROLE_KEY
```

The value must be stored only in the approved Vercel secret store. Runtime configuration has not yet been proven.

### Edge Function containment

All thirteen active function records now have platform JWT verification enabled.

```text
Active function records: 13
Functional functions: 1
Functional service-role-only functions: 1
Inert retired functions: 12
Functions accepting the legacy shared static token: 0
```

The following functions are now inert 404 endpoints with no database client or service-role use:

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

The shared legacy token digest is retired from function code. External revocation or rotation is not yet proven.

### Initial forensic review

Available Supabase logs showed repeated version 1 public-catalog traffic and Deno or Edge Runtime reads of Academy control tables. This pattern is consistent with the old public function calling PostgREST internally.

That interpretation is an inference. The old function was publicly callable, the available log window is limited, and caller attribution is incomplete. Data theft is not proven, and unauthorized access is not ruled out.

## GitHub intellectual-property risk

```text
Repository: jblan2026-hub/obserra-website
Visibility: public
Pull request 55: open and Draft
```

The public repository is a blocking intellectual-property risk. It must be made private, and collaborators, applications, deploy keys, Actions, forks, clones, and public history must be reviewed before merge or production use.

No secret value was intentionally identified in the current review. Public intellectual-property exposure remains material even without a committed secret.

## Approved architecture

```text
Obserra website
-> server-only Academy control access through approved secrets
-> marketing, catalog, learner shells, official-brand ads, and feature-flagged cinematic media
-> governed LearnWorlds checkout and learner delivery
-> HeyGen authorized presenter layer
-> Pollo cinematic course and website visual layer
-> assessment, certificate, and reporting

Supabase
-> deny-by-default database posture
-> no direct browser database access
-> one private service-role catalog function
-> retired automation functions kept inert
```

The retired custom Windows worker farm and legacy command-center control plane are not approved production paths.

## Current course and media systems

### Cinematic course standard

```text
Standard ID: obserra-cinematic-enterprise-v1
Courses: 60
HeyGen assets per course: 7
Pollo assets per course: 10
Total assets per course: 17
Portfolio assets: 1020
Minimum finished video per course: 27 minutes
Target finished video per course: approximately 37 minutes
Maximum uninterrupted avatar segment: 20 seconds
```

### Website cinematic ads

```text
Manifest ID: obserra-website-pollo-cinematic-v1
Feature flag: NEXT_PUBLIC_OBSERRA_CINEMATIC_MEDIA_ENABLED=false
```

Implemented slots:

1. EIOS intelligence hero.
2. EIOS platform visualization.
3. Obserra EIOS advertisement.
4. Obserra Academy advertisement.
5. Protection and Intelligence advertisement.
6. Cybersecurity Advisory advertisement.

All six Pollo MP4 assets remain unrendered and unuploaded. Official static poster fallbacks remain active.

## Current repository and external truth

```text
Database direct public access: blocked
Website private-control code: implemented
Website fail-closed behavior: implemented
Website security tests: implemented
Current-head GitHub CI: pending
All Edge Functions with platform JWT: 13 of 13
Retired Edge Functions made inert: 12
Owner-control availability: intentionally disabled
Vercel service-role secret configured: not proven
Supabase credential rotation: incomplete
Legacy shared-token external revocation: not proven
Forensic review: incomplete
GitHub repository private: no
GitHub public-history review: incomplete
LearnWorlds Cybersecurity Foundations shell: proven to exist
Remaining LearnWorlds shells: not proven uploaded
HeyGen avatar and voice: owner still refining
HeyGen likeness canary: not accepted
Complete Cybersecurity Foundations media: not accepted
Final assessment: not proven
Certificate: not proven
Pollo website MP4 assets rendered: no
Pollo website MP4 assets uploaded: no
Website cinematic feature flag: false
Pull request merged: no
Production course release: no
Website cinematic production activation: no
Full security closure: no
```

A repository manifest, website shell, prompt pack, media slot, planned filename, or generated plan is not proof that a LearnWorlds shell or Pollo video exists. Authenticated provider evidence and the actual accepted artifact are required.

## Current validation state

The new Supabase private-control tests and existing unit tests passed during the first security-integration run. Lint passed with the existing unrelated warning. The production build failed on a missing `cinematicMediaEnabled` property in a legacy wrapper, and that wrapper was corrected.

Complete current-head GitHub Actions validation is required after all subsequent security and documentation commits.

## Mandatory next actions

1. Run current-head GitHub Actions and resolve any remaining security-integration failure.
2. Configure `SUPABASE_SERVICE_ROLE_KEY` in the approved Vercel secret store.
3. Validate the private catalog path in a protected Preview deployment.
4. Verify anonymous and ordinary authenticated callers cannot access database or function data.
5. Review Supabase Auth, Storage, Realtime, GraphQL, API, network, and logging settings.
6. Continue forensic review across the longest available retention period.
7. Rotate Supabase service-role, database, JWT-signing, and retired control-token credentials as appropriate.
8. Update approved backend deployments after rotation.
9. Make the GitHub repository private and complete access and history review.
10. Finish the HeyGen likeness canary and Cybersecurity Foundations media package.
11. Complete LearnWorlds playback, assessment, certificate, and Sandbox learner acceptance.
12. Generate and validate the six governed Pollo website assets.
13. Obtain explicit owner approval before merge, publication, shell transfer, or website activation.

## Merge and activation boundary

Do not merge pull request 55 until:

1. The repository is private.
2. GitHub public-history and access review is complete.
3. The private Supabase catalog works in a protected deployment.
4. Current-head CI and security tests pass.
5. Key rotation and forensic review are complete or formally risk accepted by the owner.
6. The HeyGen and course-media canaries pass.
7. LearnWorlds learner, assessment, certificate, and playback acceptance pass.
8. Every active Pollo website asset exists and passes security, technical, and brand review.
9. Explicit owner approval is recorded.

Do not claim remaining LearnWorlds shells are uploaded without authenticated LearnWorlds evidence.

Do not claim Pollo assets are rendered, uploaded, active, or deployed until the approved MP4 files exist and the feature flag is enabled in a validated deployment.

## Latest records and implementation locations

```text
Canonical latest handoff:
docs/academy-media-pipeline/LATEST-HANDOFF.md

Supabase incident handoff:
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md

Edge Function security register:
docs/OBSERRA-ACADEMY-EDGE-FUNCTION-SECURITY-REGISTER.md

Original chronological activity ledger:
docs/academy-media-pipeline/ACTIVITY-LEDGER.md

Current security activity continuation:
docs/academy-media-pipeline/SECURITY-ACTIVITY-CONTINUATION.md

Original permanent failure register:
docs/academy-media-pipeline/FAILURE-REGISTER.md

Current security failure continuation:
docs/academy-media-pipeline/SECURITY-FAILURE-CONTINUATION.md

Restart instructions:
docs/OBSERRA-ACADEMY-RESTART-HERE.md

Continuous Academy handoff:
docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md

Course production standard:
docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md

Cybersecurity Foundations production pack:
docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md

Pollo website production pack:
docs/pollo-website-campaigns/POLLO-WEBSITE-INTERACTIVE-ADS-PRODUCTION-PACK.md

Private Academy control implementation:
lib/academy-control-contracts.ts
lib/academy-control.ts

Supabase private-control tests:
test/academy-supabase-private-control.test.mjs
```

## Continuous record rule

After every action, update the dedicated security handoff or continuation ledger immediately. Consolidate the continuation files into the original activity and failure registers before release.

## Continuation instruction

```text
Read docs/academy-media-pipeline/LATEST-HANDOFF.md first on branch feature/learnworlds-commercial-pipeline in jblan2026-hub/obserra-website. Then read the Supabase security handoff, Edge Function security register, security activity continuation, and security failure continuation before any other work. Continue from the first incomplete security action. Never claim security closure, LearnWorlds upload, Pollo rendering, media acceptance, merge, website activation, publication, or production release without direct evidence.
```
