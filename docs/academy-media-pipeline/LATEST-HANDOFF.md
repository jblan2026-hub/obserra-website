# Obserra Academy Latest Handoff

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/learnworlds-commercial-pipeline`

Pull request: `55`

Last updated: 2026-08-11

Production cutover: Not authorized

## Read this first

This file is the canonical current-state pointer for Obserra Academy production. A future session must read this file before making recommendations, changing code, creating course media, merging the pull request, or representing any course as complete.

Then read:

1. `docs/OBSERRA-ACADEMY-RESTART-HERE.md`
2. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md`
3. `docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md`
4. `docs/academy-media-pipeline/ACTIVITY-LEDGER.md`
5. `docs/academy-media-pipeline/FAILURE-REGISTER.md`
6. `docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md`
7. `docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md`
8. Pull request `55`

## Current verified architecture

```text
Obserra website
-> marketing, catalog, learner shell dashboard, and governed enrollment routing
-> LearnWorlds checkout and learner delivery
-> HeyGen authorized presenter layer
-> Pollo cinematic visual layer
-> governed media intake and validation
-> assessment, completion, certificate, and reporting
```

The retired custom Windows worker farm is not the approved commercial production path.

## Current cinematic production standard

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

## Current repository state

```text
Learner dashboard shells: implemented on branch
60 course LearnWorlds Draft shell manifest: implemented
Cinematic media factory: implemented
Machine readable cinematic standard: implemented
Cybersecurity Foundations cinematic production pack: implemented
Provider readiness adapter: implemented
Media receipt and intake validator: implemented
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
Production course release: not authorized
```

A repository manifest, CSV, website learner shell, or generated package is not proof that a LearnWorlds course shell was created. Authenticated LearnWorlds evidence is required for every shell.

## Current validation state

The expanded cinematic factory itself has passed its direct factory tests, including:

```text
60 courses
17 assets per course
1020 total assets
420 HeyGen assets
600 Pollo assets
Five module anchor films per course
Five module visual packs per course
```

At commit `89fdbdad274d11480f3a7de72cf7f5dded53e9d6`, the full suite reported:

```text
Tests: 79
Passed: 78
Failed: 1
```

The failure was a documentation wording assertion. The standard prohibited robotic avatar production correctly, but the test expected one exact connective phrase. The assertion was corrected in commit:

```text
a04576292044ddc11122b0d08905b6f4987cd9a0
```

Additional audit updates followed. Complete current-head GitHub Actions validation is required before merge or any passing claim.

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
10. Obtain explicit owner approval before merge, publication, or portfolio scale out.

## Merge and shell transfer boundary

Do not merge pull request 55 while current-head CI is red or pending.

Do not claim the remaining LearnWorlds shells are uploaded until authenticated LearnWorlds evidence exists.

After the canary and current-head validation pass, the controlled sequence is:

```text
owner approval
-> mark pull request ready
-> merge validated branch
-> verify production deployment
-> transfer or create Draft LearnWorlds shells
-> capture every LearnWorlds course identifier
-> keep incomplete courses private
-> load approved media and activities in governed batches
```

## Latest audit locations

```text
Canonical latest handoff:
docs/academy-media-pipeline/LATEST-HANDOFF.md

Restart and continuation instructions:
docs/OBSERRA-ACADEMY-RESTART-HERE.md

Authoritative continuous handoff:
docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md

Cinematic implementation addendum:
docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md

Chronological activity ledger:
docs/academy-media-pipeline/ACTIVITY-LEDGER.md

Permanent failure register:
docs/academy-media-pipeline/FAILURE-REGISTER.md

Cinematic production standard:
docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md

Machine readable standard:
config/academy-cinematic-production-standard.json

Media factory configuration:
config/academy-media-factory.json

Cybersecurity Foundations production pack:
docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md
```

## Continuation instruction

```text
Read docs/academy-media-pipeline/LATEST-HANDOFF.md first on branch feature/learnworlds-commercial-pipeline in jblan2026-hub/obserra-website. Then read every file listed under Read this first. Continue from the first incomplete blocker. Preserve every failure, update the activity ledger after every action, update the failure register after every failed action, and never claim LearnWorlds upload, media acceptance, merge, publication, or production release without direct evidence.
```