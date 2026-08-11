# Obserra Academy, Supabase, LearnWorlds, HeyGen, Pollo, and Website Continuous Handoff

**Owner:** OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Last updated:** 2026-08-11  
**Security closure:** Not complete  
**Academy production cutover:** Not authorized  
**Website cinematic activation:** Not authorized

## Restart instruction

A future session must read these sources in order:

1. `docs/academy-media-pipeline/LATEST-HANDOFF.md`
2. `docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md`
3. `docs/OBSERRA-ACADEMY-RESTART-HERE.md`
4. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md`
5. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md`
6. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-WEBSITE-CINEMATIC-ADS.md`
7. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-LEARNER-DASHBOARD-COURSE-SHELLS.md`
8. `docs/academy-media-pipeline/ACTIVITY-LEDGER.md`
9. `docs/academy-media-pipeline/FAILURE-REGISTER.md`
10. `docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md`
11. `docs/academy-media-pipeline/canary/HEYGEN-15-SECOND-LIKENESS-CANARY.md`
12. `docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md`
13. `docs/pollo-website-campaigns/POLLO-WEBSITE-INTERACTIVE-ADS-PRODUCTION-PACK.md`
14. Pull request `#55`

Security remediation is the first workstream. Do not resume ordinary production work until the first incomplete security action is identified and addressed.

## Executive truth

The LearnWorlds Sandbox commerce path works. Learner dashboard shells, the cinematic course production system, the LearnWorlds Draft shell plan, and the feature flagged website cinematic media and advertising system exist on the branch.

A Supabase public exposure condition was identified. Emergency containment has been applied and verified for the exposed `public` schema. Full remediation, application compatibility, Edge Function review, forensic review, credential rotation, and GitHub privacy remediation remain incomplete.

```text
Supabase public schema direct anonymous access: blocked
Supabase public schema direct authenticated access: blocked
Public base tables with RLS enabled and forced: 58 of 58
Anonymous or authenticated public table grants: 0
Anonymous or authenticated public function grants: 0
Public views using security invoker: 9 of 9
Academy catalog Edge Function: service role only
Website private catalog integration: not yet repaired
Website control failure behavior: fail open and must be corrected
Remaining Edge Functions reviewed: no
Supabase key rotation: not complete
Supabase forensic review: not complete
GitHub repository visibility: public
GitHub exposure review: not complete
LearnWorlds Sandbox checkout: passed
Sandbox purchase: passed
Invoice generation: passed
Learner enrollment: passed
LearnWorlds canary shell opens: passed
Authenticated website learner shells: implemented
60 course LearnWorlds Draft shell plan: implemented
Cinematic course production standard: implemented
Website cinematic component and four official brand ads: implemented
HeyGen likeness canary: not accepted
Complete Cybersecurity Foundations course media: not accepted
Remaining LearnWorlds shells: not proven uploaded
Six Pollo website videos: not rendered or uploaded
Pull request merged: no
Production ready course: no
Production website activation: no
Full security closure: no
```

No response may describe the environment as secure, uncompromised, production ready, published, activated, or complete until the corresponding evidence passes.

## Supabase security incident and containment

Supabase project:

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

Verified containment:

1. Direct `public` schema usage is revoked from anonymous and ordinary authenticated roles.
2. All 58 public base tables have RLS enabled and forced.
3. Anonymous and authenticated roles have zero direct grants on public tables and functions.
4. All nine public views use security invoker behavior.
5. The prior advisor errors and warnings are cleared.
6. Remaining advisor notices are informational deny by default RLS notices.
7. No Supabase Storage buckets exist.
8. `academy-public-catalog` now requires a platform validated service role JWT.
9. Wildcard CORS was removed from the catalog function.
10. Missing control records now default to unpublished and not purchasable inside the Edge Function.

Detailed evidence and unresolved risks are recorded in:

```text
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md
```

### Pending Supabase remediation

1. Update the website server adapter to supply service role authorization from the deployment secret store.
2. Ensure the service role credential is never available to browser code.
3. Change every Academy control failure path to fail closed.
4. Hide unavailable or unpublished courses and disable purchase when control authority is unavailable.
5. Add security regression tests.
6. Review all twelve remaining Edge Functions with platform JWT verification disabled.
7. Review Storage, Realtime, GraphQL, Auth, API, network, and logging settings.
8. Review database, API, Auth, and Edge Function logs for suspicious access.
9. Rotate Supabase and dependent deployment credentials.
10. Preserve forensic evidence and do not claim that compromise is ruled out.

## GitHub intellectual property boundary

The repository is currently public. This is a blocking security condition.

```text
Repository: jblan2026-hub/obserra-website
Visibility: public
Pull request 55: open and Draft
```

Required owner action:

1. Change the repository to private.
2. Review collaborators, applications, deploy keys, actions, forks, and clones.
3. Review public Git history for intellectual property and secret exposure.
4. Rotate affected credentials where exposure is possible.
5. Preserve audit evidence before any history rewrite or deletion.

Confidential course source material, assessment answers, learner data, raw avatar footage, voice clone source files, private prompts, access tokens, signing keys, and database credentials are prohibited from the public repository.

## Approved architecture

```text
Obserra website
-> server only Academy control access through approved secret storage
-> marketing, search, catalog, learner shells, official brand ads, and feature flagged cinematic media
-> governed LearnWorlds checkout
-> LearnWorlds learner identity and course delivery
-> HeyGen authorized presenter layer
-> Pollo cinematic course and website visual layer
-> assessment
-> certificate
-> reporting

Supabase
-> deny by default database posture
-> no direct browser database access
-> approved backend and Edge Function access only
```

LearnWorlds is the authoritative LMS. HeyGen is the authoritative presenter layer. Pollo AI is the cinematic visual layer. Supabase is a protected backend data service, not a public client database.

## LearnWorlds account and canary

```text
School: Obserra EPI Academy
School ID: 6a7a693d353feb69c94c7654
School URL: https://obserraepillc.learnworlds.com
Governed API URL: https://obserraepillc.learnworlds.com/admin/api/
Preferred custom domain: https://academy.obserrallc.com
Business email: info@obserrallc.com

Obserra course ID: cybersecurity-foundations
LearnWorlds course ID: cybersecurity-foundations-for-new-professionals
Store product ID: cybersecurity_foundations_for_new_professionals
Package ID: package_6a7b2d3710387
Status: sandbox
List price: $149
Sandbox launch offer: $99
Discount: $50
```

The canary shell is not a complete course. Checkout and enrollment success do not prove instructional readiness.

## Authenticated learner dashboard shells

The protected website route `/portal` displays the governed Academy catalog as course shells.

```text
Verified Clerk entitlement -> Enrolled
Published LearnWorlds mapping -> Available
Sandbox LearnWorlds mapping -> Pilot shell
No released mapping -> In production
```

The dashboard does not create LearnWorlds courses, grant enrollment, unlock lessons, or prove publication. The remaining LearnWorlds shell transfer is not complete.

## Common cinematic enterprise course standard

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

The owner rejected robotic, static, low quality course production. Every course must use the same cinematic enterprise standard.

Required controls include natural presenter pacing, five module anchor films, five module visual packs, scene plans, shot lists, 1080p minimum masters, 48 kHz audio, captions, transcript, rights evidence, accessibility, LearnWorlds playback validation, and owner approval.

## Website cinematic media and official brand ads

```text
Manifest ID: obserra-website-pollo-cinematic-v1
Feature flag: NEXT_PUBLIC_OBSERRA_CINEMATIC_MEDIA_ENABLED=false
```

Implemented slots:

1. EIOS intelligence hero loop.
2. EIOS platform loop.
3. Obserra EIOS advertisement.
4. Obserra Academy advertisement.
5. Protection and Intelligence advertisement.
6. Cybersecurity Advisory advertisement.

The system uses official poster fallbacks, viewport aware muted playback, user controls, reduced motion fallback, video error fallback, official logo overlays, and responsive layouts.

```text
Six Pollo MP4 files rendered: no
Six Pollo MP4 files uploaded: no
Website cinematic feature flag enabled: no
Production activation: no
```

## Immediate work order

### Security phase

1. Repair server only private catalog authorization.
2. Make control failures fail closed.
3. Add security tests.
4. Review and harden all remaining Edge Functions.
5. Review managed Supabase service settings.
6. Review forensic logs.
7. Rotate credentials.
8. Make the GitHub repository private and review exposure.
9. Run current head CI and security acceptance.

### Course phase

1. Finish the authorized HeyGen avatar and voice.
2. Render and approve the 15 second likeness canary.
3. Produce the Cybersecurity Foundations welcome, five module films, and five visual packs.
4. Load approved media into LearnWorlds with captions, transcripts, thumbnails, chapters, knowledge checks, and completion rules.
5. Import the 25 question assessment with an 80 percent passing score.
6. Validate desktop, mobile, completion, assessment, certificate, and Sandbox learner journey.

### Website media phase

1. Generate the two website loops and four official brand advertisements in Pollo.
2. Reject generated text, third party marks, public figures, morphing, weak brand match, or unrealistic motion.
3. Store provider asset IDs, prompts, hashes, and approval evidence.
4. Validate desktop, mobile, loop seam, poster fallback, reduced motion, and performance.
5. Keep the feature flag false until approved.

## Non negotiable merge and activation blockers

Do not merge, publish courses, create a production cutover, claim the remaining LearnWorlds shells are uploaded, or activate website cinematic media until:

1. Repository visibility is private.
2. Public history and access exposure review is complete.
3. Supabase application compatibility uses server only authorization and fail closed behavior.
4. Remaining Edge Functions are reviewed.
5. Key rotation and forensic review are complete or explicitly risk accepted.
6. Current head CI and security tests pass.
7. The HeyGen likeness canary passes.
8. The complete Cybersecurity Foundations media package passes.
9. All five module experiences work in LearnWorlds.
10. Captions, transcripts, thumbnails, chapters, and knowledge checks are complete.
11. The final assessment, completion rules, and certificate pass.
12. Placeholder and legacy branding are removed.
13. Website and LearnWorlds pricing match.
14. A Sandbox learner completes the real course.
15. Every active Pollo website MP4 exists and passes security, technical, and brand review.
16. Explicit owner approval is documented.

## Continuous audit rule

After every action, update:

```text
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md
docs/academy-media-pipeline/LATEST-HANDOFF.md
docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md
docs/OBSERRA-ACADEMY-RESTART-HERE.md
docs/academy-media-pipeline/ACTIVITY-LEDGER.md
docs/academy-media-pipeline/FAILURE-REGISTER.md
```

Record successful and failed actions immediately.

## Latest file locations

```text
Canonical latest handoff:
docs/academy-media-pipeline/LATEST-HANDOFF.md

Supabase security handoff:
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md

Restart instructions:
docs/OBSERRA-ACADEMY-RESTART-HERE.md

Continuous handoff:
docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md

Activity ledger:
docs/academy-media-pipeline/ACTIVITY-LEDGER.md

Failure register:
docs/academy-media-pipeline/FAILURE-REGISTER.md

Cinematic course addendum:
docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md

Website cinematic ads addendum:
docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-WEBSITE-CINEMATIC-ADS.md

Learner dashboard shell addendum:
docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-LEARNER-DASHBOARD-COURSE-SHELLS.md

Course production standard:
docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md

HeyGen likeness canary:
docs/academy-media-pipeline/canary/HEYGEN-15-SECOND-LIKENESS-CANARY.md

Cybersecurity Foundations production pack:
docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md

Pollo website production pack:
docs/pollo-website-campaigns/POLLO-WEBSITE-INTERACTIVE-ADS-PRODUCTION-PACK.md
```

## Resume command

```text
Read docs/academy-media-pipeline/LATEST-HANDOFF.md first on branch feature/learnworlds-commercial-pipeline in jblan2026-hub/obserra-website. Then read docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md and every source listed under Restart instruction. Continue from the first incomplete security action. Record every action and failure immediately. Never claim security closure, LearnWorlds upload, Pollo rendering, media acceptance, merge, website activation, publication, or production release without direct evidence.
```
