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

## Current state

```text
Repository implementation: complete on draft branch
Core code CI: passed on cited commit
Current head CI: required before merge
HeyGen canary generation: not started
Pollo canary generation: not started
LearnWorlds media upload: not started
Production cutover: not authorized
Portfolio generation: not authorized
```
