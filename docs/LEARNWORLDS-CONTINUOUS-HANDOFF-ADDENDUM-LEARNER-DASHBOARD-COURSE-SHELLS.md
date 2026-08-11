# LearnWorlds Continuous Handoff Addendum: Learner Dashboard Course Shells

**Date:** 2026-08-11  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Owner direction

The owner directed that the governed Academy course shells be added to the authenticated learner dashboard while the HeyGen avatar, voice, video, and remaining course media are still being refined.

## Implementation completed

The authenticated customer portal at `/portal` now includes a `My Academy` course-shell dashboard sourced from the governed website Academy catalog.

The implementation:

1. Imports the governed Academy catalog rather than maintaining a second hard-coded course list.
2. Reads verified learner entitlements from Clerk private metadata through the existing `academyStateFromUser` contract.
3. Reads governed LearnWorlds mapping state through `learnWorldsProductForCourse`.
4. Displays every governed website course shell grouped by Cyber, Technologies, Protection, and Intelligence.
5. Displays course title, track, level, duration, module count, production status, and an explicit learner-access note.
6. Displays `Open course` only for verified learner entitlements.
7. Displays `View course` only for a governed LearnWorlds product whose status is `published`.
8. Displays the canary as `Pilot shell` when its LearnWorlds product is in Sandbox.
9. Displays all remaining shells as `In production` while course materials and media are finalized.
10. Provides no checkout or enrollment action inside the course-shell dashboard.
11. States explicitly that a visible shell does not grant enrollment, unlock protected lessons, or authorize purchase.
12. Adds responsive desktop, tablet, and mobile course-shell styling.

## Files changed

```text
app/portal/page.tsx
app/portal/portal.css
app/portal/academy-shells.css
test/portal-academy-course-shells.test.mjs
```

## Security and truth controls

The shell dashboard does not fabricate learner access or course readiness.

Course status is resolved in this order:

```text
Verified Clerk entitlement -> Enrolled
Governed LearnWorlds published mapping -> Available
Governed LearnWorlds sandbox mapping -> Pilot shell
No released mapping -> In production
```

A visible shell does not create an entitlement, modify Clerk metadata, initiate Stripe checkout, initiate LearnWorlds checkout, expose protected course content, or mark a course complete.

## Automated tests

A new regression test requires:

1. Course shells to be generated from the governed Academy catalog.
2. Verified entitlements to control `Enrolled` status.
3. LearnWorlds product state to control `Available` and `Pilot shell` status.
4. Unreleased courses to remain `In production`.
5. The shell dashboard to contain no direct checkout route or `Enroll securely` action.
6. Responsive course-shell styles to remain present.

## Current factual state

```text
Course-shell source: governed website Academy catalog
Authenticated learner dashboard implementation: committed
Verified entitlement logic: implemented
LearnWorlds status logic: implemented
Direct checkout from shell dashboard: prohibited
HeyGen avatar and voice: owner in progress
HeyGen canary video: not yet accepted
Pollo canary visual package: not yet accepted
LearnWorlds course publication: not authorized
Production cutover: not authorized
```

## Acceptance boundary

Repository and CI validation prove that the learner dashboard code builds and enforces the shell-state contract. They do not prove that the feature is deployed to production, that the user is entitled to any course, that HeyGen or Pollo media is complete, or that LearnWorlds publication is approved.
