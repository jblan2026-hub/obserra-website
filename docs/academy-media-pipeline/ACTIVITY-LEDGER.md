# Obserra Academy HeyGen and Pollo Pipeline Activity Ledger

Owner: OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC

Recorded: 2026-08-11

Status: Permanent chronological audit record

## Activity 1: Commercial context recovered

Read the active LearnWorlds commercial branch and pull request. Confirmed that the website already contains the Academy catalog, Clerk identity, Stripe checkout, signed webhook fulfillment, learner entitlements, course progress, assessments, and signed certificate functionality.

## Activity 2: Annual service decision recorded

Recorded the owner's annual HeyGen and Pollo AI subscriptions and the instruction to maximize both subscriptions across multiple quality-controlled platforms.

## Activity 3: Provider responsibilities assigned

Assigned HeyGen as the consistent instructor and presenter layer. Assigned Pollo AI as the cinematic visual, explainer, website, and social campaign layer. Prohibited duplicate presenter production and uncontrolled provider overlap.

## Activity 4: Commercial API boundary established

Recorded that annual web subscriptions do not automatically authorize separate API usage. Set the production system to manual-first and API-ready. No paid API automation is enabled.

## Activity 5: Annual portfolio model designed

Defined a five-course-per-month, twelve-month operating model with ten flagship courses, fifteen standard courses, and thirty-five catalog courses.

Baseline governed output target at that stage:

```text
HeyGen assets: 250
Pollo assets: 335
Total assets: 585
```

## Activity 6: Deterministic media factory implemented

Added `scripts/academy-media-factory.mjs` to read the governed Academy catalog and generate course-specific HeyGen and Pollo jobs, prompts, platforms, aspect ratios, durations, destinations, idempotency keys, approvals, disclosures, and quality gates.

## Activity 7: Annual configuration implemented

Added `config/academy-media-factory.json` with annual targets, tier assignments, brand controls, disclosure language, and provider-specific quality gates.

## Activity 8: Automated tests implemented

Added tests that:

1. Generate a full synthetic 60-course portfolio.
2. Reject catalogs below the minimum expected size.
3. Validate the real Academy catalog and exact governed asset totals.

## Activity 9: Repository release gate updated

Added:

```text
npm run plan:academy-media
npm run validate:academy-media
```

Added `validate:academy-media` to the governed Academy release validation sequence.

## Activity 10: Operating documentation created

Created the multiplatform README, account setup checklist, annual pipeline design, publishing matrix, owner-only service actions, acceptance states, and quality controls.

## Activity 11: First canary package created

Created the Cybersecurity Foundations production pack containing:

1. A complete HeyGen welcome script.
2. Five module briefs.
3. A HeyGen sales trailer script.
4. Pollo cinematic prompts.
5. Three vertical short themes.
6. A LinkedIn executive clip brief.
7. An acceptance checklist.

## Activity 12: Pull request expanded

Updated pull request 55 to include LearnWorlds commerce and the HeyGen and Pollo annual media pipeline, exact blockers, owner actions, and acceptance gates.

## Activity 13: Core CI evidence captured

For code-bearing commit `f55d454d0d4468561d6a439c97c1d035b2aa7a8c`, the following GitHub Actions completed successfully:

1. Website CI.
2. Academy 70x Production Gate.
3. Application Production Pipeline.
4. Application Release Validation.

Website CI reported:

```text
Tests: 50
Passed: 50
Failed: 0
Lint errors: 0
Existing lint warnings: 1
Production build: passed
```

## Activity 14: Real catalog validation strengthened

Added a media-factory test that runs against the real `app/academy/courseData.ts` catalog and requires the governed course, provider, and tier totals.

## Activity 15: Audit records completed

Created the annual media handoff addendum, dedicated failure register, and dedicated activity ledger. All known failed actions and corrections are recorded.

## Activity 16: Owner-managed credit refill decision applied

Recorded that the owner will manually refill HeyGen and Pollo web-subscription credits when needed. Updated the production model to remain quality first while retaining explicit owner control over every refill and any future separately billed API usage.

## Activity 17: Governed service connection configuration implemented

Added `config/academy-media-services.json` with provider roles, exact governed HTTPS endpoints, required manual evidence, required API environment variables, probe timeouts, and fail-closed security controls.

## Activity 18: Media service readiness adapter implemented

Added `lib/academy-media-services.ts`. The adapter defaults HeyGen and Pollo to manual mode, validates exact provider hosts, evaluates manual and API readiness, supports bounded optional probes, and never returns API keys or secret values.

## Activity 19: Owner-only media readiness endpoint implemented

Added `app/api/admin/academy-media/status/route.ts`. The endpoint uses Clerk owner authorization, returns 404 to unauthorized callers, applies no-store and noindex headers, and supports an explicit `?probe=1` sanitized connection check.

## Activity 20: Secure deployment variables documented

Updated `.env.example` with manual-first and separately authorized API variables for HeyGen and Pollo. No credential value was added to source control.

## Activity 21: Governed media receipt and intake pipeline implemented

Added:

```text
config/academy-media-asset-receipt.schema.json
scripts/academy-media-intake.mjs
```

The pipeline creates receipt templates and validates downloaded media, SHA 256 hashes, path containment, captions, transcripts, rights evidence, quality gates, owner approval, synthetic-media disclosure, resolution, duration, streams, and 48 kHz presenter audio.

## Activity 22: Connection and intake tests implemented

Added:

```text
test/academy-media-services.test.mjs
test/academy-media-intake.test.mjs
```

The tests cover provider endpoint governance, secret boundaries, manual-first operation, owner-only status, deterministic receipt preparation, accepted asset validation, unapproved asset rejection, SHA 256 validation, path containment, and optional FFprobe evidence.

## Activity 23: Package commands expanded

Added:

```text
npm run prepare:academy-media-intake
npm run validate:academy-media-intake
npm run validate:academy-media-canary
```

These commands prepare the complete asset intake tree and enforce the final canary or portfolio acceptance gate after assets are generated and downloaded.

## Activity 24: Current-head CI executed and exact failure captured

GitHub Actions ran the expanded branch. The shared test suite executed 61 tests:

```text
Passed: 60
Failed: 1
```

All four workflows stopped at the same test failure. The failing regression test scanned a broad source-code region and incorrectly treated the internal `process.env.POLLO_API_KEY` request-header reference as evidence that the probe returned a credential.

No deployment, provider generation, billing event, or production cutover occurred.

## Activity 25: Secret-boundary test corrected

Replaced the broad source slice with a precise assertion over the sanitized probe-result object shape. The correction verifies allowed result fields and excludes credential fields.

## Activity 26: Failure recorded and CI restarted

Recorded Failure 6 in the permanent failure register with the exact CI output, root cause, impact, correction, and prevention rule.

## Activity 27: Corrected validation passed

GitHub Actions validated commit `50fea832849c3456626f4ffb0b75627b27bf2c16` and reported all four workflows successful.

Website CI evidence:

```text
Tests: 61
Passed: 61
Failed: 0
Lint errors: 0
Existing lint warnings: 1
Production build: passed
Generated application routes: 134
Owner-site separation smoke: passed
```

## Activity 28: Governed 15-second HeyGen likeness canary added

Added:

```text
docs/academy-media-pipeline/canary/HEYGEN-15-SECOND-LIKENESS-CANARY.md
```

The likeness canary must pass before the longer Cybersecurity Foundations welcome video or any portfolio presenter batch is generated.

## Activity 29: Authenticated learner course shells implemented

Added every governed Academy course shell to the protected `/portal` dashboard. The shell view groups courses by department and displays title, track, level, duration, module count, and governed release state.

## Activity 30: Learner shell authorization controls implemented

Shell state resolves in this order:

```text
Verified Clerk entitlement -> Enrolled
Published LearnWorlds mapping -> Available
Sandbox LearnWorlds mapping -> Pilot shell
No released mapping -> In production
```

The learner shell dashboard contains no checkout action and does not fabricate enrollment or course readiness.

## Activity 31: Learner shell validation passed

Current-head validation for the learner shell implementation reported:

```text
Tests: 66
Passed: 66
Failed: 0
Lint errors: 0
Production build: passed
Website CI: passed
Academy 70x Production Gate: passed
Application Production Pipeline: passed
Application Release Validation: passed
```

## Activity 32: Owner rejected robotic and low quality production

Recorded the direction that every course must use realistic, cinematic, Hollywood-caliber craft and Fortune 500 executive communication quality. The existing PMP style was rejected as robotic and below the required professional standard.

The phrase describes a production-quality target. It does not claim affiliation with a film studio or Fortune 500 company.

## Activity 33: Machine-readable cinematic standard implemented

Added:

```text
config/academy-cinematic-production-standard.json
```

Standard ID:

```text
obserra-cinematic-enterprise-v1
```

The standard applies equally to every course, course level, and department. Tier may change release priority only. Tier may not reduce quality.

## Activity 34: Media architecture standardized across every course

Updated the factory configuration and generator so every course receives:

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

Updated portfolio target:

```text
HeyGen assets: 420
Pollo assets: 600
Total assets: 1020
```

## Activity 35: Anti-robotic and cinematic controls enforced

The factory now requires:

1. No uninterrupted avatar segment longer than 20 seconds.
2. Presenter screen time from 35 to 55 percent.
3. Cinematic visual time from 45 to 65 percent.
4. Five module anchor films and five module visual packs per course.
5. Scene plan, shot list, storyboard, and edit decision list.
6. 1920 by 1080 minimum master, Rec.709 color, and 48 kHz audio.
7. Captions, transcript, owner approval, rights evidence, and LearnWorlds playback validation.

## Activity 36: Cinematic standard and canary documentation upgraded

Updated:

```text
docs/academy-media-pipeline/OBSERRA-CINEMATIC-FORTUNE-500-PRODUCTION-STANDARD.md
docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md
```

The canary now contains a 75 second welcome, scene-by-scene edit plan, five 5 to 8 minute module film briefs, five Pollo module visual packs, LearnWorlds activity requirements, and a 15 category quality scorecard.

## Activity 37: Concurrent file conflicts recorded and corrected

The first configuration update used a stale blob SHA and returned GitHub HTTP 409. A subsequent test create action targeted a path that already existed and returned GitHub HTTP 422.

Both actions were corrected by re-reading the current path and using the current blob SHA. Failures 7 and 8 record exact causes and prevention rules.

## Activity 38: Cinematic handoff addendum created

Added:

```text
docs/LEARNWORLDS-CONTINUOUS-HANDOFF-ADDENDUM-CINEMATIC-ENTERPRISE-STANDARD.md
```

The addendum records the standard, asset totals, provider roles, LearnWorlds controls, current blockers, merge boundary, shell transfer boundary, and latest file locations.

## Current state

```text
Learner dashboard shells: implemented and previously validated
Cinematic enterprise standard: implemented on branch
Same quality standard across all courses: implemented
Current portfolio target: 1020 media assets across 60 courses
Cybersecurity Foundations cinematic production pack: updated
HeyGen avatar and voice: owner still refining
15 second likeness canary: not yet accepted
Full Cybersecurity Foundations media canary: not yet generated and accepted
Remaining LearnWorlds shells uploaded: not yet proven
Current cinematic branch CI: pending
Pull request merged: no
Production cutover: not authorized
```
