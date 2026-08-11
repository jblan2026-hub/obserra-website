# LearnWorlds Continuous Handoff Addendum: HeyGen and Pollo Validation Update

Date: 2026-08-11

Repository: `jblan2026-hub/obserra-website`

Branch: `feature/learnworlds-commercial-pipeline`

Pull request: `#55`

Production cutover: Not authorized

## Implementation state

The annual HeyGen and Pollo media pipeline is now integrated into the LearnWorlds commercial branch.

Implemented production assets:

```text
docs/OBSERRA_ACADEMY_HEYGEN_POLLO_ANNUAL_MEDIA_PIPELINE.md
scripts/academy-media-factory.mjs
config/academy-media-factory.json
test/academy-media-factory.test.mjs
docs/academy-media-pipeline/README.md
docs/academy-media-pipeline/ACCOUNT-SETUP-CHECKLIST.md
docs/academy-media-pipeline/canary/CYBERSECURITY-FOUNDATIONS-PRODUCTION-PACK.md
docs/academy-media-pipeline/ACTIVITY-LEDGER.md
docs/academy-media-pipeline/FAILURE-REGISTER.md
```

## Governed annual production totals

The tiered 60-course catalog is required to generate exactly:

```text
HeyGen jobs: 250
Pollo jobs: 335
Total jobs: 585
Flagship courses: 10
Standard courses: 15
Catalog courses: 35
```

The real-catalog regression test now enforces these totals against `app/academy/courseData.ts`.

## Core CI evidence

Code-bearing commit:

```text
f55d454d0d4468561d6a439c97c1d035b2aa7a8c
```

Passing workflows:

```text
Website CI: passed
Academy 70x Production Gate: passed
Application Production Pipeline: passed
Application Release Validation: passed
```

Website CI result:

```text
Tests: 50
Passed: 50
Failed: 0
Lint errors: 0
Existing lint warnings: 1
Production build: passed
```

The media-factory full-portfolio and insufficient-catalog tests were included and passed.

## Current-head validation boundary

Subsequent commits added exact annual targets, the canary production pack, audit records, and real-catalog assertions. Intermediate runs were cancelled as newer commits superseded them. The current branch head therefore requires its own final CI pass before merge or deployment.

Cancelled workflow runs are not represented as successful validation.

## Vercel status boundary

GitHub currently reports successful Vercel statuses for:

```text
Vercel Deployments – OBSERRA
Vercel – obserra-integrated-services
Vercel – obserra-website-lcn2
```

GitHub also reports failure for:

```text
Vercel – obserra-website-live
```

The Vercel connector could not inspect that deployment because the exact scope requires reauthentication. The failure cause is unknown and no diagnosis is claimed. Production cutover remains blocked regardless.

## Provider subscription controls

### HeyGen

Annual-plan credits are governed as monthly production capacity. The owner must confirm the actual monthly allocation displayed in the account before the monthly course quota is fixed.

### Pollo AI

Subscription credits are used monthly because subscription credits do not roll over. Add-on credits are not authorized during the acceptance phase.

## Owner-only actions remaining

1. Confirm HeyGen monthly credits and renewal date without sharing payment information.
2. Create or approve the authorized Dr. Jody Blanchard avatar and voice.
3. Create reusable 16:9 and 9:16 Obserra templates in HeyGen.
4. Confirm Pollo monthly credits and renewal date.
5. Configure private Obserra prompt presets in Pollo.
6. Generate the Cybersecurity Foundations canary assets.
7. Download the canary outputs for content, technical, accessibility, rights, and website validation.

## Truth boundary

```text
Pipeline source implemented: yes
Core CI passed: yes
Current-head CI passed: not yet proven
HeyGen canary generated: no
Pollo canary generated: no
LearnWorlds media uploaded: no
Website trailer published: no
Production cutover authorized: no
Portfolio media generation authorized: no
```
