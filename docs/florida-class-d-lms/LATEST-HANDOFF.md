# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13 20:54 ET

This is the current restart pointer for the regulated Florida Class D LMS and Class DS filing workstream for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

## Restart authority

Repository: `jblan2026-hub/obserra-website`  
Branch: `feature/florida-class-d-lms-foundation`  
Pull request: `PR #56`  
PR state at last direct verification: **open, mergeable, unmerged**.

Read `HANDOFF.md` first. The consolidated handoff now preserves the exact Gates 1-25 verifier-contract language from the historical five-green checkpoint and appends the current Gate 26/high-availability state. Do not rewrite historical gate language when adding new controls.

Current branch head at this restart update:

`cbe7085e99747ad91c74124c35d13aa90f70df2e`

Historical exact five-green handoff checkpoint:

`af4247978c3b1b3aaac45ce7e15f321512cbf71c`

Green workflows on that exact historical checkpoint:

- Florida Class D LMS Gates #400.
- Website CI #1942.
- Academy 70x Production Gate #1118.
- Application Release Validation #807.
- Application Production Pipeline #826.

## Current build state

Gates 1 through 25 remain the accepted historical source/build architecture. Gate 26 Production Activation Authorization is now implemented in source and mandatory in the dedicated Class D workflow.

Gate 26 requires exact frozen release-candidate SHA binding, exact candidate-matched Gate 23 UAT SHA, exact deployed Vercel Git SHA, live production identity, protected database/media configuration, actual licensing state, database-promotion verification, examination-bank authorization, LIAS procedure verification, security acceptance, rollback verification, owner release approval, explicit production activation authorization, and mandatory high availability before regulated production activation can be authorized.

Real learner enrollment, production live instruction, production scheduling, and student final-examination API execution are explicitly bound to Gate 26 plus their independent feature flags.

## High availability requirement

HA is mandatory across the complete production service chain: edge/DNS, application runtime, identity, regulated database, live media, completion-document storage, commerce/payment, observability, backup/restore, and end-to-end failover.

Current engineering ceilings enforced by Gate 26:

- RTO: 60 minutes or less.
- RPO: 15 minutes or less.
- End-to-end failover exercise: no older than 90 days at activation.

HA evidence markers may only be recorded as verified when authentic supporting evidence exists.

## Current CI audit state

Florida Class D LMS Gates #415 ran on exact head `5e702fe1c27a4149cc1eb8a2383a8a56108dde42` and failed in the existing Gate 3 persistence verifier because `HANDOFF.md` had lost the literal phrase `durable Supabase persistence/admin APIs`. Gate 26 and later steps were skipped in that run. Run #415 remains a failed audit record and must not be represented as green.

Commit `cbe7085e99747ad91c74124c35d13aa90f70df2e` restored the full five-green handoff contract from `af424...`, including the Gate 3 literal, while preserving Gate 26 and HA as new current-state additions. The complete workflow must be rerun on the resulting head and the final run identifiers recorded here.

## Controlled filing baseline

Current controlled private artifacts remain:

- LMS Guide DOCX v0.15.
- LMS Guide PDF v0.15, 43 pages.
- Submission Readiness Register v1.5, 6 pages.
- Controlled Pre-Filing Packet v0.15 Live Evidence Only.

Controlled packet ZIP SHA-256:

`8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`

Curriculum SHA-256:

`e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`

Final examination SHA-256:

`240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`

Do not change controlled filing binaries without issuing a new controlled revision, rerunning render/preflight/integrity validation, updating hashes, and synchronizing the filing controls.

## Production and regulatory boundary

Production remains **fail closed**. Public paid enrollment, regulated learner access, production scheduling, live Class D instruction, production exam access, LIAS production execution, completion/certificate release, observer production access, regulated database promotion, and runtime activation remain disabled until actual Class DS authorization and all final production gates pass.

No source commit, CI result, UAT result, HA evidence marker, deployment state, filing package, screenshot, or readiness report is FDACS approval.

Forty instructional hours alone do not complete the course and do not earn a completion certificate. The passing 170-question final examination at 128/170 or better and authorized completion approval remain required. Official FDACS-16103 remains LIAS-generated and must not be synthesized locally.

## Deployment governance

Existing intended Vercel project: `obserra-website-live`.  
Canonical registered domain: `obserrallc.com`.  
Public website host: `www.obserrallc.com`.  
Intended Vercel team technical slug: `obserra`.

Direct Vercel control-plane verification remains outstanding in the current connector context. Do not create another project, move the existing project, or change DNS as a workaround.

## Audit continuity

Every material LMS, FDACS, CI, UAT, Vercel, database, identity, media, examination, LIAS, filing, HA/recovery, security, or production-readiness action must be recorded with the exact SHA or external object, result/evidence, workflow/run identifiers where applicable, production/regulatory effect, rollback state, unresolved blockers, and next governed action.

Blocked connector writes must be recorded as blocked and must never be represented as completed changes.

## Next governed actions

1. Validate all five primary workflows on the exact post-repair head.
2. Repair any remaining verifier regression without weakening controls.
3. Synchronize `CURRENT-STATUS-2026-08-13.md`, the applicable gate handoffs, and `DS-SUBMISSION-LMS-GUIDE-CONTROL.md` where connector writes are permitted.
4. Continue production-grade Gate 26 integration and HA evidence preparation.
5. Reconcile the authoritative existing Vercel project without project movement or DNS change.
6. Close remaining Class DS filing controls.
7. Freeze the final production candidate and run a new exact-candidate-bound Gate 23 18-of-18 synthetic UAT acceptance.
8. Produce authentic HA/failover/recovery evidence for every production dependency.
9. Complete production database, identity, media, exam-bank, LIAS, commerce, observability, security, rollback, and owner-approval gates.
10. Do not activate regulated production functions until actual Class DS authorization and all final production gates pass.
