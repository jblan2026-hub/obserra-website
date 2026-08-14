# Florida Class D LMS Latest Handoff

Snapshot: 2026-08-13 21:00 ET

This is the current restart pointer for the regulated Florida Class D LMS and Class DS filing workstream for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

## Restart authority

Repository: `jblan2026-hub/obserra-website`  
Branch: `feature/florida-class-d-lms-foundation`  
Pull request: `PR #56`  
PR state at last direct verification: **open, mergeable, unmerged**.

Read these controlled records before changing regulated behavior:

1. `HANDOFF.md`
2. `ACTION-LEDGER.md`
3. `CURRENT-STATUS-2026-08-13.md`
4. the applicable gate-specific handoff
5. `DS-SUBMISSION-LMS-GUIDE-CONTROL.md`

`HANDOFF.md` preserves the exact historical Gates 1-25 verifier-contract language. New actions must not rewrite those historical literals merely to record later state. `ACTION-LEDGER.md` is the append-only action record for exact SHAs, workflow results, failures, blocked writes, production effects, and next actions.

## Current exact validated five-green checkpoint

`1b6a35bdb289faaa15e5fdc1eb814cd607e65425`

All five primary workflows are green on that exact SHA:

- Florida Class D LMS Gates #422.
- Website CI #1989.
- Academy 70x Production Gate #1140.
- Application Release Validation #829.
- Application Production Pipeline #848.

Florida Class D LMS Gates #422 passed the complete Gates 1-26 source chain, Gate 22 runtime-readiness verification, Gate 23 acceptance-evidence verification, Gate 24 instructional text-screen verification, Gate 25 runtime-isolation enforcement, Gate 26 production-activation verification, repository contract tests, lint/static quality validation, and the production Next.js build.

Application Production Pipeline #848 completed successfully, including the final signed-artifact publication contract.

This exact SHA is the current validated source/build checkpoint. Later documentation-only synchronization commits do not supersede it as validated source authority unless a complete validation cycle is recorded for the later head.

## Historical Gates 1-25 handoff checkpoint

`af4247978c3b1b3aaac45ce7e15f321512cbf71c`

Historical green workflows on that exact SHA:

- Florida Class D LMS Gates #400.
- Website CI #1942.
- Academy 70x Production Gate #1118.
- Application Release Validation #807.
- Application Production Pipeline #826.

This SHA remains the preserved historical Gates 1-25 handoff-contract checkpoint and audit evidence. It is not the current Gate 26 source checkpoint.

## Gate 26 Production Activation Authorization

Gate 26 is implemented, mandatory in the dedicated Class D workflow, and CI-accepted on `1b6a35b...`.

Production authorization requires exact candidate/UAT/deployment SHA binding, production identity, protected database and media configuration, actual licensing state, database-promotion verification, examination-bank authorization, LIAS procedure verification, security acceptance, rollback verification, owner release approval, mandatory HA/recovery evidence, and explicit final production activation authorization.

License issuance alone cannot activate the regulated LMS.

Current production-impacting paths explicitly bound to Gate 26 or the shared regulated-execution authorization include:

- live instruction;
- production scheduling;
- regulated learner enrollment API;
- student final-examination API;
- LIAS administration;
- official completion-document ingestion.

The shared non-production execution model remains explicit, environment-limited, and synthetic-identity-only. It does not convert UAT evidence into production evidence.

## Mandatory high availability

HA is mandatory across the complete regulated production service chain:

- edge routing and DNS;
- application runtime;
- identity/authentication;
- regulated database/persistence;
- live instructional media;
- completion-document storage;
- commerce/payment dependency used for regulated enrollment;
- observability and alerting;
- backup and restore;
- end-to-end failover.

Current controlled engineering ceilings enforced by Gate 26:

- RTO: **60 minutes or less**.
- RPO: **15 minutes or less**.
- End-to-end failover exercise: **no older than 90 days** at production activation.

HA status markers may only be recorded as verified when authentic supporting evidence exists. Vendor marketing or generic service claims do not establish Obserra production verification.

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

The public-repository `DS-SUBMISSION-LMS-GUIDE-CONTROL.md` still contains older v0.9 metadata because replacement writes were blocked before changing GitHub. Do not treat that stale public metadata as the current private controlled filing-artifact baseline. Preserve its Gate 17-19 verifier literals until a safe synchronized revision is possible.

## Production and regulatory boundary

Production remains **fail closed**. Public paid enrollment, regulated learner access, production scheduling, live Class D instruction, production exam access, LIAS production execution, completion/certificate release, observer production access, regulated database promotion, and runtime activation remain disabled until actual Class DS authorization and all final production gates pass.

No source commit, CI result, UAT result, HA evidence marker, deployment state, filing package, screenshot, or readiness report is FDACS approval.

Forty instructional hours alone do not complete the course and do not earn a completion certificate. The passing 170-question final examination at 128/170 or better and authorized completion approval remain required. Official FDACS-16103 remains LIAS-generated and must not be synthesized locally.

## Deployment governance

Existing intended Vercel project: `obserra-website-live`.  
Canonical registered domain: `obserrallc.com`.  
Public website host: `www.obserrallc.com`.  
Owner-reported intended Vercel team technical slug: `obserra`.

Direct Vercel control-plane verification remains outstanding in the current connector context. Do not create another project, move the existing project, or change DNS as a workaround.

## Audit continuity

Every material LMS, FDACS, CI, UAT, Vercel, database, identity, media, examination, LIAS, filing, HA/recovery, security, or production-readiness action must be recorded in `ACTION-LEDGER.md` with the exact SHA or external object, result/evidence, workflow identifiers where applicable, production/regulatory effect, rollback state, unresolved blockers, and next governed action.

Failed and blocked actions remain part of the record and must never be rewritten as successful.

## Next governed actions

1. Treat `1b6a35bdb289faaa15e5fdc1eb814cd607e65425` as the exact current validated five-green source checkpoint.
2. Synchronize current-status and Gate 26 handoff records to that checkpoint without altering historical Gates 1-25 verifier contracts.
3. Continue production-grade resilience and observability engineering as the next controlled milestone.
4. Produce authentic HA, failover, backup/restore, and recovery evidence for every production dependency.
5. Reconcile the authoritative existing Vercel project without project movement or DNS change.
6. Close remaining Class DS filing controls.
7. Freeze the final production candidate and execute a new exact-candidate-bound Gate 23 18-of-18 synthetic UAT acceptance.
8. Complete production database, identity, media, exam-bank, LIAS, commerce, observability, security, rollback, HA, and owner-approval gates.
9. Do not activate regulated production functions until actual Class DS authorization and every final production condition passes.
