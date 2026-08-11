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

Baseline governed output target:

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
3. Validate the real Academy catalog and exact 585-asset totals.

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
2. Five module-summary briefs.
3. A HeyGen sales trailer script.
4. Six Pollo cinematic prompts.
5. Three vertical short themes.
6. A LinkedIn executive clip brief.
7. A twelve-point acceptance checklist.

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

The two media-factory tests included in that run passed.

## Activity 14: Real-catalog validation strengthened

Added a third media-factory test that runs against the real `app/academy/courseData.ts` catalog and requires:

```text
Courses: 60
Total jobs: 585
HeyGen jobs: 250
Pollo jobs: 335
Flagship courses: 10
Standard courses: 15
Catalog courses: 35
```

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

The pipeline creates receipt templates and validates downloaded media, SHA-256 hashes, path containment, captions, transcripts, rights evidence, quality gates, owner approval, synthetic-media disclosure, resolution, duration, streams, and 48 kHz presenter audio.

## Activity 22: Connection and intake tests implemented

Added:

```text
test/academy-media-services.test.mjs
test/academy-media-intake.test.mjs
```

The tests cover provider endpoint governance, secret boundaries, manual-first operation, owner-only status, deterministic receipt preparation, accepted asset validation, unapproved asset rejection, SHA-256 validation, path containment, and optional FFprobe evidence.

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

Replaced the broad source slice with a precise assertion over the sanitized probe-result object shape. The correction now verifies:

1. The result shape contains only reachability, authorization, counts, status codes, and errors.
2. The result shape contains no API-key, access-token, client-secret, or webhook-secret field.
3. The adapter returns exactly `{ status, probe: result }`.
4. The owner route separately contains no HeyGen or Pollo API-key reference.

## Activity 26: Failure recorded and CI restarted

Recorded Failure 6 in the permanent failure register with the exact CI output, root cause, impact, correction, and prevention rule. Committed the corrected test to the governed branch.

## Activity 27: Corrected current-head validation passed

GitHub Actions validated commit `50fea832849c3456626f4ffb0b75627b27bf2c16` and reported all four workflows successful:

```text
Website CI: passed
Academy 70x Production Gate: passed
Application Production Pipeline: passed
Application Release Validation: passed
```

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

The production build includes the new protected route:

```text
/api/admin/academy-media/status
```

This proves the deterministic factory, provider-readiness adapter, protected status route, receipt preparation, asset intake validation, existing commerce behavior, and production build compile together. It does not prove external account connection, media generation, LearnWorlds upload, or production publication.

## Current state

```text
Repository implementation: expanded on draft branch
Current validated commit: 50fea832849c3456626f4ffb0b75627b27bf2c16
Current validated tests: 61 passed, 0 failed
Current validated workflows: 4 passed, 0 failed
HeyGen avatar and voice: owner in progress
HeyGen templates: pending
Pollo private workspace and presets: pending
Media service readiness endpoint: implemented and build validated
Media asset intake validator: implemented and test validated
HeyGen canary generation: not started
Pollo canary generation: not started
LearnWorlds media upload: not started
Production cutover: not authorized
Portfolio generation: not authorized
```
