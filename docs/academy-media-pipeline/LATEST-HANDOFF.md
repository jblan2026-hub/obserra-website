# Obserra Academy and Website Latest Handoff

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/learnworlds-commercial-pipeline`

Pull request: `55`

Last updated: 2026-08-11

Academy production cutover: Not authorized

Website cinematic media activation: Not authorized

## Read this first

This file is the canonical current-state pointer for the Obserra Academy, LearnWorlds, HeyGen, Pollo AI, learner dashboard, website cinematic media, and website advertising work.

A future session must read this file before making recommendations, changing code, creating course media, creating website media, merging the pull request, or representing any course, shell transfer, website asset, or production release as complete.

Then read:

1. `docs/OBSERRA-ACADEMY-RESTART-HERE.md`
2. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md`
3. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md`
4. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-WEBSITE-CINEMATIC-ADS.md`
5. `docs/academy-media-pipeline/ACTIVITY-LEDGER.md`
6. `docs/academy-media-pipeline/FAILURE-REGISTER.md`
7. `docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md`
8. `docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md`
9. `docs/pollo-website-campaigns/POLLO-WEBSITE-INTERACTIVE-ADS-PRODUCTION-PACK.md`
10. Pull request `55`

## Current verified architecture

```text
Obserra website
-> marketing, catalog, learner shell dashboard, official-brand campaign ads, and governed enrollment routing
-> feature-flagged Pollo cinematic website media with official poster fallbacks
-> LearnWorlds checkout and learner delivery
-> HeyGen authorized presenter layer
-> Pollo cinematic visual layer
-> governed media intake and validation
-> assessment, completion, certificate, and reporting
```

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

The homepage now contains feature-flagged cinematic media slots for:

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
10. No provider key or automatic spend authorization in the website code.

Feature flag:

```text
NEXT_PUBLIC_OBSERRA_CINEMATIC_MEDIA_ENABLED=false
```

The flag must remain false until every referenced active MP4 exists, passes technical and brand review, passes desktop and mobile review, and receives owner approval.

## Current repository state

```text
Learner dashboard shells: implemented on branch
60 course LearnWorlds Draft shell plan: implemented
Cinematic course media factory: implemented
Machine readable cinematic course standard: implemented
Cybersecurity Foundations cinematic production pack: implemented
Provider readiness adapter: implemented
Media receipt and intake validator: implemented
Website cinematic media component: implemented
Homepage hero and platform video slots: implemented
Four official-brand website campaign ads: implemented
Website cinematic asset manifest: implemented
Pollo website prompt and shot pack: implemented
Website cinematic validation tests: implemented
Current pull request: open and Draft
Pull request merged: no
```

## Current external truth

```text
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

The expanded cinematic course factory has passed its direct factory tests, including:

```text
60 courses
17 assets per course
1020 total assets
420 HeyGen assets
600 Pollo assets
Five module anchor films per course
Five module visual packs per course
```

A prior full suite at commit `89fdbdad274d11480f3a7de72cf7f5dded53e9d6` reported 78 passed and 1 failed because a documentation assertion expected one exact connective phrase. The assertion was corrected in commit `a04576292044ddc11122b0d08905b6f4987cd9a0`.

The new website cinematic implementation adds tests for feature flag behavior, poster fallback, error fallback, reduced motion, viewport playback, pause and play, campaign coverage, official logo use, governed asset paths, poster availability, and credential boundaries.

Complete current-head GitHub Actions validation is required before the latest course, website, and audit changes can be represented as passing.

## Current blockers

1. Complete current-head GitHub Actions validation.
2. Finish and approve the HeyGen likeness and voice canary.
3. Create and approve the 16 by 9 and 9 by 16 HeyGen master templates.
4. Confirm the private Pollo workspace and governed visual presets.
5. Generate and approve the Cybersecurity Foundations cinematic welcome, five module films, and five module visual packs.
6. Load the real course activities, assessment, transcript, captions, and completion rules into LearnWorlds.
7. Validate LearnWorlds desktop and mobile playback.
8. Validate assessment, certificate, and complete Sandbox learner journey.
9. Remove all placeholder and legacy LearnWorlds branding and content.
10. Generate the six governed Pollo website assets.
11. Upload the approved MP4 files to their exact repository paths.
12. Validate seamless loops, official branding, desktop, mobile, reduced motion, and performance.
13. Keep the website cinematic feature flag false until owner approval.
14. Obtain explicit owner approval before merge, Academy publication, website cinematic activation, or portfolio scale out.

## Merge, shell transfer, and website activation boundary

Do not merge pull request 55 while current-head CI is red or pending.

Do not claim the remaining LearnWorlds shells are uploaded until authenticated LearnWorlds evidence exists.

Do not claim Pollo website assets are rendered, uploaded, active, or deployed until the actual approved MP4 files exist and the feature flag is enabled in a validated deployment.

After the course canary, website assets, and current-head validation pass, the controlled sequence is:

```text
owner approval
-> mark pull request ready
-> merge validated branch
-> verify production deployment
-> transfer or create Draft LearnWorlds shells
-> capture every LearnWorlds course identifier
-> keep incomplete courses private
-> load approved course media and activities in governed batches
-> upload approved Pollo website MP4 files
-> validate website fallback and playback behavior
-> enable the website cinematic feature flag
-> verify production website behavior
```

## Latest audit and implementation locations

```text
Canonical latest handoff:
docs/academy-media-pipeline/LATEST-HANDOFF.md

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

## Continuation instruction

```text
Read docs/academy-media-pipeline/LATEST-HANDOFF.md first on branch feature/learnworlds-commercial-pipeline in jblan2026-hub/obserra-website. Then read every file listed under Read this first. Continue from the first incomplete blocker. Preserve every failure, update the activity ledger after every action, update the failure register after every failed action, and never claim LearnWorlds upload, Pollo rendering, media acceptance, merge, website activation, publication, or production release without direct evidence.
```
