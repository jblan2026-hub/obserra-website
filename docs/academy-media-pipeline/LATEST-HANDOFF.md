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

This file is the canonical current state pointer for Obserra Academy security, Supabase, LearnWorlds, HeyGen, Pollo AI, learner dashboard, website cinematic media, and website advertising work.

Security remediation now has priority over course production, shell transfer, media activation, merge, and publication.

A future session must read these sources in order:

1. `docs/academy-media-pipeline/LATEST-HANDOFF.md`
2. `docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md`
3. `docs/OBSERRA-ACADEMY-RESTART-HERE.md`
4. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md`
5. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md`
6. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-WEBSITE-CINEMATIC-ADS.md`
7. `docs/academy-media-pipeline/ACTIVITY-LEDGER.md`
8. `docs/academy-media-pipeline/FAILURE-REGISTER.md`
9. `docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md`
10. `docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md`
11. `docs/pollo-website-campaigns/POLLO-WEBSITE-INTERACTIVE-ADS-PRODUCTION-PACK.md`
12. Pull request `55`

Do not represent the complete environment as secure, uncompromised, production ready, merged, published, or activated until the corresponding evidence is complete.

## Current security incident state

The owner reported a Supabase notice that an Obserra Academy table was publicly accessible and directed that all Academy data and intellectual property be protected from unauthorized access, theft, copying, or exfiltration.

No evidence currently proves that data was taken. No completed forensic review rules out unauthorized access.

### Emergency database containment applied

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

Verified database state:

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
Supabase Storage buckets: 0
```

The current Supabase security advisor reports only informational `RLS Enabled No Policy` notices. Under the present design, no policies means direct API roles remain denied by default.

### Academy catalog Edge Function containment

`academy-public-catalog` is now version 2 with:

```text
Platform JWT verification: enabled
Required caller role: service_role
Wildcard CORS: removed
Cache policy: private and no store
Unauthorized response: 404
Missing control default: unpublished and not purchasable
```

### Critical pending security repairs

1. The website server currently calls the private catalog function without service role authorization.
2. The website control fallback currently exposes the baseline catalog with default published controls when the control service fails. This is fail open behavior.
3. Twelve active Edge Functions still have platform JWT verification disabled and require individual authentication and necessity review.
4. Supabase retains platform managed grants on parts of Storage, Realtime, and GraphQL. Project level review remains required.
5. Supabase credential rotation is not complete.
6. Database, API, Auth, and Edge Function forensic log review is not complete.
7. The GitHub repository is public and contains internal implementation and production planning material.
8. Public Git history, forks, clones, collaborators, deploy keys, applications, and credential exposure have not been fully reviewed.

The complete security evidence and next actions are recorded in:

```text
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md
```

## Current verified architecture

```text
Obserra website
-> server only Academy control access through approved secrets
-> marketing, catalog, learner shell dashboard, official brand campaign ads, and governed enrollment routing
-> feature flagged Pollo cinematic website media with official poster fallbacks
-> LearnWorlds checkout and learner delivery
-> HeyGen authorized presenter layer
-> Pollo cinematic visual layer
-> governed media intake and validation
-> assessment, completion, certificate, and reporting

Supabase
-> deny by default public schema
-> service role access only for approved backend operations
-> no direct browser database access
```

The server only Supabase control path is the required target architecture. The current website adapter has not yet been repaired to meet it.

The retired custom Windows worker farm is not the approved commercial production path.

## Current cinematic course production standard

Standard ID:

```text
obserra-cinematic-enterprise-v1
```

The same standard applies to every course. Course tier may change production order or marketing priority. It may not reduce presenter realism, instructional depth, cinematic quality, sound quality, accessibility, rights controls, LearnWorlds playback requirements, or owner approval requirements.

Every course receives:

```text
HeyGen welcome: 1
HeyGen module anchor films: 5
HeyGen trailer host: 1
Pollo module visual packs: 5
Pollo website hero loop: 1
Pollo vertical campaign clips: 3
Pollo LinkedIn executive clip: 1
Total assets per course: 17
```

Portfolio target:

```text
Courses: 60
HeyGen assets: 420
Pollo assets: 600
Total governed media assets: 1020
Minimum finished video per course: 27 minutes
Target finished video per course: approximately 37 minutes
```

Anti robotic requirements include:

1. No uninterrupted avatar segment longer than 20 seconds.
2. Presenter screen time between 35 and 55 percent.
3. Cinematic visual time between 45 and 65 percent.
4. Natural pauses, emphasis, blinking, eye contact, gestures, and emotional tone.
5. Five module specific cinematic visual packs per course.
6. Scene plan, shot list, storyboard, and edit decision list.
7. At least four distinct visual contexts per module.
8. No robotic narration over static slides.
9. No generic looping stock look or excessive neon cyber imagery.
10. No publication without captions, transcript, rights evidence, playback testing, and owner approval.

## Current website cinematic advertising implementation

Manifest ID:

```text
obserra-website-pollo-cinematic-v1
```

The homepage contains feature flagged cinematic media slots for:

1. EIOS intelligence hero loop.
2. EIOS platform loop.
3. Obserra EIOS website advertisement.
4. Obserra Academy website advertisement.
5. Protection and Intelligence website advertisement.
6. Cybersecurity Advisory website advertisement.

Implemented behavior:

1. Official static poster fallback by default.
2. Muted loop playback only when visible.
3. Automatic pause outside the viewport.
4. User pause and play control.
5. Reduced motion fallback.
6. Video error fallback.
7. Official Obserra logo overlay controlled by the website.
8. Responsive desktop, tablet, and mobile layouts.
9. Direct campaign calls to action.
10. No provider key or automatic spend authorization in website code.

Feature flag:

```text
NEXT_PUBLIC_OBSERRA_CINEMATIC_MEDIA_ENABLED=false
```

The flag remains false until every referenced active MP4 exists, passes technical and brand review, passes desktop and mobile review, passes security review, and receives owner approval.

## Current repository state

```text
Repository visibility: public
Security handoff: created
Learner dashboard shells: implemented on branch
60 course LearnWorlds Draft shell plan: implemented
Cinematic course media factory: implemented
Machine readable cinematic course standard: implemented
Cybersecurity Foundations cinematic production pack: implemented
Provider readiness adapter: implemented
Media receipt and intake validator: implemented
Website cinematic media component: implemented
Homepage hero and platform video slots: implemented
Four official brand website campaign ads: implemented
Website cinematic asset manifest: implemented
Pollo website prompt and shot pack: implemented
Website cinematic validation tests: implemented
Current pull request: open and Draft
Pull request merged: no
```

The public repository is a blocking intellectual property risk. It must be changed to private and reviewed before merge or production use.

## Current external truth

```text
Direct public access to Supabase public schema: blocked
Full Supabase security closure: no
Forensic compromise assessment: incomplete
Supabase credential rotation: incomplete
Remaining Edge Function review: incomplete
GitHub repository private: no
GitHub public history review: incomplete
LearnWorlds Cybersecurity Foundations shell: proven to exist
Remaining LearnWorlds course shells: not proven uploaded
HeyGen avatar and voice: owner still refining
15 second HeyGen likeness canary: not yet accepted
Cybersecurity Foundations cinematic welcome: not yet accepted
Five module anchor films: not yet generated and accepted
Five Pollo module visual packs: not yet generated and accepted
Final assessment: not yet proven
Certificate: not yet proven
Six Pollo website MP4 assets: not rendered
Six Pollo website MP4 assets: not uploaded
Website cinematic feature flag: false
Website cinematic production activation: not authorized
Academy production release: not authorized
```

A repository manifest, CSV, website learner shell, prompt pack, media slot, or planned file path is not proof that a LearnWorlds shell or Pollo video was created. Authenticated provider evidence and the actual approved artifact are required.

## Current validation state

### Supabase containment validation

```text
58 of 58 public base tables have RLS enabled and forced
0 anonymous or authenticated public table grants
0 anonymous or authenticated public function grants
9 of 9 public views use security invoker
academy-public-catalog requires platform verified service role JWT
Security advisor errors: 0
Security advisor warnings: 0
```

### Course and website validation

The expanded cinematic course factory passed direct factory tests for 60 courses, 17 assets per course, 1020 total assets, 420 HeyGen assets, 600 Pollo assets, five module anchor films per course, and five module visual packs per course.

A prior full suite at commit `89fdbdad274d11480f3a7de72cf7f5dded53e9d6` reported 78 passed and 1 failed because a documentation assertion expected one exact connective phrase. The assertion was corrected in commit `a04576292044ddc11122b0d08905b6f4987cd9a0`.

Complete current head GitHub Actions validation is required after the security and documentation changes.

## Mandatory next actions

Security work must occur before production work:

1. Repair the website Academy control adapter to send service role authorization from server only code.
2. Change Academy control failures to fail closed, hide unavailable or unpublished courses, and disable purchasing.
3. Add tests proving no secret reaches browser code, logs, responses, or bundles.
4. Review all twelve remaining Edge Functions and harden, restrict, disable, or delete each one.
5. Review Supabase Storage, Realtime, GraphQL, Auth, API, network, and logging settings.
6. Review the prior twenty four hours of Supabase logs for suspicious access.
7. Rotate Supabase and dependent deployment credentials in a controlled sequence.
8. Change the GitHub repository to private.
9. Review GitHub collaborators, applications, deploy keys, forks, clones, and history exposure.
10. Run current head GitHub Actions and security regression tests.
11. Finish and approve the HeyGen likeness and voice canary.
12. Generate and approve the Cybersecurity Foundations course media.
13. Complete LearnWorlds playback, assessment, certificate, and Sandbox learner acceptance.
14. Generate and validate the six governed Pollo website assets.
15. Obtain explicit owner approval before merge, publication, website activation, shell transfer, or portfolio scale out.

## Merge, shell transfer, and website activation boundary

Do not merge pull request 55 until:

1. The repository is private.
2. Public history and access exposure review is complete.
3. Supabase application compatibility is repaired with fail closed behavior.
4. Remaining Edge Functions are reviewed.
5. Key rotation and forensic log review are complete or formally risk accepted by the owner.
6. Current head CI and security tests pass.
7. The HeyGen and course media canaries pass.
8. LearnWorlds learner, assessment, certificate, and playback acceptance pass.
9. Every active Pollo website asset exists and passes security, technical, and brand review.
10. Explicit owner approval is recorded.

Do not claim the remaining LearnWorlds shells are uploaded until authenticated LearnWorlds evidence exists.

Do not claim Pollo website assets are rendered, uploaded, active, or deployed until the approved MP4 files exist and the feature flag is enabled in a validated deployment.

## Latest audit and implementation locations

```text
Canonical latest handoff:
docs/academy-media-pipeline/LATEST-HANDOFF.md

Supabase security incident and containment handoff:
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md

Restart and continuation instructions:
docs/OBSERRA-ACADEMY-RESTART-HERE.md

Authoritative continuous handoff:
docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md

Cinematic course implementation addendum:
docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md

Website cinematic ads addendum:
docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-WEBSITE-CINEMATIC-ADS.md

Chronological activity ledger:
docs/academy-media-pipeline/ACTIVITY-LEDGER.md

Permanent failure register:
docs/academy-media-pipeline/FAILURE-REGISTER.md

Cinematic course production standard:
docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md

Machine readable course standard:
config/academy-cinematic-production-standard.json

Course media factory configuration:
config/academy-media-factory.json

Cybersecurity Foundations production pack:
docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md

Pollo website prompts, scripts, and shot plans:
docs/pollo-website-campaigns/POLLO-WEBSITE-INTERACTIVE-ADS-PRODUCTION-PACK.md

Website cinematic media manifest:
config/website-cinematic-media.json

Website cinematic media component:
app/components/marketing/CinematicMedia.tsx

Website campaign ads component:
app/components/marketing/WebsiteCampaignAds.tsx

Homepage integration:
app/page.tsx

Official brand and responsive media styles:
app/cinematic-media.css

Pollo output path instructions:
public/media/pollo/README.md

Website cinematic automated tests:
test/website-cinematic-media.test.mjs
```

## Continuous record rule

After every action, update:

```text
docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md
docs/academy-media-pipeline/LATEST-HANDOFF.md
docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md
docs/OBSERRA-ACADEMY-RESTART-HERE.md
docs/academy-media-pipeline/ACTIVITY-LEDGER.md
docs/academy-media-pipeline/FAILURE-REGISTER.md
```

Record both successes and failures immediately.

## Continuation instruction

```text
Read docs/academy-media-pipeline/LATEST-HANDOFF.md first on branch feature/learnworlds-commercial-pipeline in jblan2026-hub/obserra-website. Then read docs/OBSERRA-ACADEMY-SUPABASE-SECURITY-HANDOFF.md and every file listed under Read this first. Continue from the first incomplete security action. Preserve every failure. Never claim security closure, LearnWorlds upload, Pollo rendering, media acceptance, merge, website activation, publication, or production release without direct evidence.
```
