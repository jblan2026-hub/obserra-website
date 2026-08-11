# LearnWorlds Continuous Handoff Addendum: Course Manager One Shell Observation

**Date:** 2026-08-11  
**Repository:** `jblan2026-hub/obserra-website`  
**Branch:** `feature/learnworlds-commercial-pipeline`  
**Pull request:** `#55`  
**Production cutover:** Not authorized

## Owner evidence

The owner supplied a current screenshot of the LearnWorlds author Course Manager at:

```text
https://obserraepillc.learnworlds.com/author/courses
```

The screenshot shows exactly one existing LearnWorlds course:

```text
Cybersecurity Foundations for New Professionals
```

The screenshot does not show any of the remaining governed Academy course shells in LearnWorlds.

## Corrected truth boundary

The authenticated `/portal` learner-shell dashboard implemented in the website branch and the LearnWorlds Course Manager are separate systems.

Current factual state:

```text
Website learner-shell dashboard: implemented on draft branch
Website learner-shell dashboard CI: passed on the cited prior branch head
LearnWorlds course shells visible: 1
Remaining LearnWorlds course shells created: 0 proven
LearnWorlds bulk shell upload: not yet executed
Pull request merged: no
Production publication: no
```

No prior website shell implementation is evidence that the corresponding LearnWorlds course objects exist.

## Owner direction

The owner directed that, once the branch is complete and validated:

1. Pull request 55 is merged through the governed release process.
2. The remaining course shells are created in LearnWorlds.
3. Shell creation remains draft or otherwise nonpublic until course content, media, assessment, accessibility, commerce, and owner approval gates pass.
4. Existing Cybersecurity Foundations identifiers and learner state are preserved.
5. Creation results, failures, returned identifiers, and counts are recorded in the continuous handoff and activity ledger.

## Required implementation sequence

1. Freeze the governed course-shell inventory from the website Academy catalog.
2. Reconcile the inventory against the existing LearnWorlds course list.
3. Preserve the existing Cybersecurity Foundations course rather than creating a duplicate.
4. Prepare the remaining shell-creation batch with unique course identifiers and titles.
5. Run a dry-run reconciliation and record planned creates, preserves, conflicts, and blockers.
6. Create only draft or nonpublic course shells.
7. Re-read the LearnWorlds course inventory and prove the expected count and identities.
8. Record every returned LearnWorlds course identifier and status.
9. Run repository CI and the LearnWorlds acceptance check.
10. Merge only after the repository and external shell reconciliation are both accepted.

## Security and commercial controls

The shell operation must not:

1. Publish any incomplete course.
2. Enable checkout for an incomplete course.
3. Duplicate the existing Cybersecurity Foundations course.
4. Change the existing course price, learner, enrollment, completion, or certificate state.
5. Store LearnWorlds secrets in source control or documentation.
6. Represent a planned shell as uploaded until LearnWorlds inventory evidence confirms it.

## Current blocker

A direct authenticated LearnWorlds authoring action has not yet been executed from this environment. The repository can prepare, validate, and audit the shell inventory. Creation inside LearnWorlds requires an authenticated supported API operation or an owner-authenticated LearnWorlds session.

## Acceptance boundary

The operation is complete only when LearnWorlds itself shows the reconciled shell inventory and the handoff contains the post-operation count, identifiers, statuses, failures, and rollback record.