# LearnWorlds Continuous Handoff Addendum: Cinematic Enterprise Production Standard

**Date:** 2026-08-11  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Owner direction

The owner directed that every Obserra Academy course use realistic, cinematic, Hollywood-caliber craft and Fortune 500 executive presentation quality. The owner rejected robotic avatar delivery, low quality template presentation, static slide narration, and the visual style previously observed in the PMP course.

The owner also directed that:

1. Every course meet the same production standard.
2. HeyGen and Pollo AI be maximized for quality rather than constrained by subscription credits.
3. Learner dashboard shells remain available while video production continues.
4. Course shells be merged and transferred into LearnWorlds only after the complete acceptance gates pass.
5. Handoff, activity, and failure records be updated continuously so future sessions do not relearn prior work.

## Common quality standard established

Added the machine-readable standard:

```text
config/academy-cinematic-production-standard.json
```

Standard ID:

```text
obserra-cinematic-enterprise-v1
```

The standard applies to every governed Academy course, every department, every course level, and every legacy course rebuild. Course tier may change release priority or marketing investment. Course tier may not reduce video quality, presenter realism, instructional depth, accessibility, rights controls, LearnWorlds playback requirements, or owner approval.

## Media factory upgraded

Updated:

```text
config/academy-media-factory.json
scripts/academy-media-factory.mjs
test/academy-media-factory.test.mjs
test/academy-cinematic-production-standard.test.mjs
```

Every course now receives the same baseline cinematic media architecture:

```text
HeyGen course welcome: 1
HeyGen module anchor films: 5
HeyGen course trailer host: 1
Pollo module cinematic visual packs: 5
Pollo website hero loop: 1
Pollo vertical campaign clips: 3
Pollo LinkedIn executive clip: 1
Total assets per course: 17
```

Current 60 course portfolio target:

```text
HeyGen assets: 420
Pollo assets: 600
Total governed media assets: 1020
```

## Anti-robotic presenter controls

Every HeyGen presenter asset requires:

1. Authorized Dr. Jody Blanchard avatar and voice only.
2. No uninterrupted avatar segment longer than 20 seconds.
3. Presenter screen time between 35 and 55 percent.
4. Cinematic visual time between 45 and 65 percent.
5. Natural breathing, pauses, emphasis, blinking, eye contact, and restrained gestures.
6. Likeness, voice similarity, pronunciation, and lip synchronization approval.
7. A scene plan, shot list, storyboard, and edit decision list.
8. 1920 by 1080 minimum master, Rec.709 color, and 48 kHz audio.
9. Selectable captions, verified transcript, and music free alternate master.
10. Desktop and mobile LearnWorlds playback approval.

The following patterns are prohibited:

1. A full course or module consisting only of a talking avatar.
2. Robotic or evenly metered speech.
3. Static slide narration.
4. Repeating the same framing for an entire lesson.
5. Unreviewed synthetic voice.
6. Placeholder template content.
7. Quality reduction based on credit balance.

## Cinematic visual controls

Every Pollo module pack requires:

1. At least four distinct visual contexts.
2. Motivated camera movement and lighting.
3. Physically plausible people, objects, and motion.
4. Consistent people, wardrobe, locations, props, and screen direction.
5. No generated text inside scenes.
6. No third party logos or public figures.
7. No generic looping stock appearance.
8. No morphing anatomy, faces, hands, text, or objects.
9. No excessive neon or science fiction gimmicks.
10. Clean editorial head and tail handles.

## LearnWorlds course experience controls

Each module film must be uploaded as a LearnWorlds video learning activity with:

1. Professional thumbnail.
2. Descriptive title.
3. Selectable captions.
4. Verified transcript.
5. Chapters or table of contents.
6. Knowledge check immediately after the module film.
7. Completion rule.
8. Desktop playback validation.
9. Mobile playback validation.
10. Removal of all placeholder template people, copy, images, metrics, and branding.

## Cybersecurity Foundations canary upgraded

Updated:

```text
docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md
```

The canary now includes:

1. A 75 second course welcome script.
2. A scene by scene edit plan.
3. Five 5 to 8 minute module anchor film briefs.
4. Five module specific Pollo visual prompts.
5. Website and social assets.
6. LearnWorlds activity requirements.
7. A 15 category quality scorecard.
8. A minimum average score of 4.5 with no category below 4.

The owner is still refining the HeyGen avatar and voice. No canary video is claimed accepted yet.

## Course shell state

The authenticated website learner dashboard contains the governed course shells. Shell visibility does not create enrollment, unlock protected lessons, start checkout, or prove course readiness.

The LearnWorlds canary shell exists. The remaining shells have not been represented as uploaded into LearnWorlds. Transfer or creation of remaining LearnWorlds shells remains blocked until the governed import or creation method and owner acceptance are proven.

Official LearnWorlds guidance confirms that course creation uses the Course Creation Wizard and that Draft or Coming Soon status can be used while course content is built. LearnWorlds also supports course cloning and importing within the school. The production plan will use Draft shells and a validated master template rather than exposing incomplete courses.

## Failures recorded during this update

### Concurrent file revision conflict

The first attempt to update `config/academy-media-factory.json` used a stale blob SHA and received GitHub HTTP 409. The file had been updated by another committed action after the previous read.

Correction:

1. Re-read the current file and current blob SHA.
2. Merged the already committed cinematic fields with the stricter common standard.
3. Updated the file using the current SHA.

Prevention rule:

Always re-read a file immediately before sequential updates when multiple repository writes are occurring.

### Existing test file discovered after create attempt

The first attempt to create `test/academy-cinematic-production-standard.test.mjs` received GitHub HTTP 422 because the path already existed from another committed action.

Correction:

1. Fetched the existing file.
2. Replaced it through `update_file` using its current blob SHA.
3. Preserved the existing intent while aligning assertions to the new standard.

Prevention rule:

Before creating a file in an actively changing branch, check whether the exact path already exists. Use update rather than create when it does.

## Current factual status

```text
Cinematic production standard: implemented
Same quality standard across all courses: implemented
Media factory target: 1020 assets across 60 courses
Cybersecurity Foundations cinematic production pack: updated
Learner dashboard shells: implemented on branch
HeyGen avatar and voice: owner still refining
15 second likeness canary: not yet accepted
Full Cybersecurity Foundations media canary: not yet generated and accepted
Remaining LearnWorlds shells uploaded: not yet proven
Pull request merged: no
Production cutover: not authorized
```

## Merge and LearnWorlds upload boundary

Do not merge pull request 55 or represent the LearnWorlds shell transfer as complete until:

1. Current branch CI passes after the cinematic changes.
2. The HeyGen likeness canary passes.
3. The Cybersecurity Foundations cinematic media package passes.
4. LearnWorlds desktop and mobile playback pass.
5. The course assessment and certificate pass.
6. The Sandbox learner journey passes.
7. The master LearnWorlds course template is validated.
8. The shell transfer method is proven without publishing incomplete courses.
9. Explicit owner approval is recorded.

## Latest file locations

```text
config/academy-cinematic-production-standard.json
config/academy-media-factory.json
scripts/academy-media-factory.mjs
test/academy-media-factory.test.mjs
test/academy-cinematic-production-standard.test.mjs
docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md
docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md
docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md
docs/academy-media-pipeline/ACTIVITY-LEDGER.md
docs/academy-media-pipeline/FAILURE-REGISTER.md
docs/LEARNWORLDS-CONTINUOUS-HANDOFF.md
```
