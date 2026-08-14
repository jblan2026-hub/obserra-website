# Florida Class D LMS Regulated Action Ledger

Snapshot authority established: 2026-08-13

## Purpose

This is the append-only current-action ledger for the regulated Florida Class D LMS workstream for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

The controlled handoff set remains `HANDOFF.md`, `LATEST-HANDOFF.md`, `CURRENT-STATUS-2026-08-13.md`, the applicable gate-specific handoff, and `DS-SUBMISSION-LMS-GUIDE-CONTROL.md`. Historical gate language that is also a CI verifier contract must not be rewritten merely to record later actions. New material actions are recorded here and summarized in the current restart documents.

Every ledger entry must record the exact source SHA or external object, the action/result, workflow or evidence identifiers where applicable, security/regulatory impact, production-boundary effect, unresolved blockers, rollback state, and next governed action. Failed and blocked actions remain part of the record and must never be rewritten as successful.

## Validated checkpoints

### 2026-08-13 historical Gates 1-25 handoff checkpoint

Source SHA: `af4247978c3b1b3aaac45ce7e15f321512cbf71c`

Result: exact historical five-green checkpoint and preserved Gates 1-25 handoff verifier contract.

Green workflows:

- Florida Class D LMS Gates #400.
- Website CI #1942.
- Academy 70x Production Gate #1118.
- Application Release Validation #807.
- Application Production Pipeline #826.

Production effect: none. Production remained fail closed.

### 2026-08-13 Gate 26 and HA five-green checkpoint

Source SHA: `1b6a35bdb289faaa15e5fdc1eb814cd607e65425`

Result: exact current five-green source checkpoint for Gates 1 through 26, mandatory high availability, regulated runtime isolation, source/build validation, and the production application build.

Green workflows on this exact SHA:

- Florida Class D LMS Gates #422.
- Website CI #1989.
- Academy 70x Production Gate #1140.
- Application Release Validation #829.
- Application Production Pipeline #848.

Florida Class D LMS Gates #422 passed the complete regulated source-gate chain, Gate 22 runtime readiness, Gate 23 acceptance evidence verification, Gate 24 text-screen verification, Gate 25 runtime-isolation enforcement, Gate 26 production-activation verification, repository tests, lint/static quality validation, and the production Next.js build.

Application Production Pipeline #848 passed logical worker validation, the application staging gate, production website build, unsigned-claim prohibition, governed staging evidence, and the final signed-artifact publication contract.

Security/regulatory effect: Gate 26 and HA are CI-accepted source/build controls. This is not FDACS approval, production database promotion, production acceptance, or launch authorization.

Production effect: none. Production regulated functions remain fail closed.

Rollback state: source can be reverted through normal Git history; no production regulated runtime activation or production Class D database promotion occurred.

Next governed action: synchronize restart records to this checkpoint, then continue production resilience/observability engineering and authentic infrastructure evidence preparation.

## Gate 26 implementation history

- `0e56b2a5dbea4974565c90ff71e0fa8f01c27be2`: introduced the server-only Gate 26 production-activation module.
- `a1b345282f5a3e98c1cf9559188b001f0f35bd5f`: bound production live instruction to Gate 26.
- `96f53288d1fc5c7f614d11d671cc2dc5f2903c41`: bound production scheduling to Gate 26.
- `a046d450d1d2f5bf00510c5f6816febc893347ff`: added the protected Gate 26 staff console.
- `97922d7a3adb7dd64e1179e754ec8f507fe5a3e1`: bound regulated learner enrollment API execution to Gate 26.
- `f0600bcd2ba66cfbbf6673256b1d7e1e747a4f62`: bound student final-examination API execution to Gate 26.
- `fc48865b8383c80ea1ccfa399ab63d6dbef42286`: expanded Gate 22 to the full known regulated activation-flag inventory.
- `d91486d54b4e0b8223708386b9913109e774a703`: created the Gate 26 source verifier.
- `92d2d66ce9bdafd7be7c00c5ed92fa845c11d5b5`: made Gate 26 mandatory in the dedicated Class D workflow.
- `f7757d9e76d7ddb6fce1c70c4dd3b60061e2771f`: made high availability mandatory across the complete production service chain and added controlled RTO/RPO/failover-recency requirements.
- `ff6d1d5a99fd6a0f5d3f5dda1ec1e7b38f4e1d23`: bound LIAS administration to the shared regulated execution authorization.
- `e9d908b5c1f2c173a5ba3839faab459c0c4ca90e`: bound official completion-document ingestion to the shared regulated execution authorization.
- `1b6a35bdb289faaa15e5fdc1eb814cd607e65425`: updated Gate 26 CI enforcement for the integrations that actually landed and became the exact five-green checkpoint.

## Mandatory HA baseline

Gate 26 requires authentic verified production-readiness evidence for:

- edge routing and DNS;
- application runtime;
- identity/authentication;
- regulated database/persistence;
- live instructional media;
- completion-document storage;
- commerce/payment dependency used for regulated enrollment;
- observability and alerting;
- backup and restoration;
- end-to-end failover.

Controlled engineering ceilings currently enforced in source:

- RTO: 60 minutes or less.
- RPO: 15 minutes or less.
- End-to-end failover exercise: no older than 90 days at production activation.

Passing HA markers require authentic retained evidence. Vendor marketing statements alone are not sufficient verification.

## Failed and blocked actions retained for audit

### Florida Class D LMS Gates #403

Source SHA: `89a408b618fabe5741fbf857d9e3e9939ea1aa69`.

Result: failed because `HANDOFF.md` lost the Gate 2 verifier-required `### Gates 1-4` heading during documentation synchronization. Four other primary workflows passed. The failure was retained and the handoff contract was repaired.

### Florida Class D LMS Gates #415

Source SHA: `5e702fe1c27a4149cc1eb8a2383a8a56108dde42`.

Result: failed before Gate 26 execution because `HANDOFF.md` had lost the Gate 3 verifier-required literal `durable Supabase persistence/admin APIs`. Gate 26 and later steps were skipped. The historical five-green handoff contract was restored and the later exact checkpoint `1b6a35...` passed Gates 1-26.

### Repository write-safety blocks

The following attempted repository writes were rejected before changing GitHub and therefore are not implemented:

- replacing `DS-SUBMISSION-LMS-GUIDE-CONTROL.md` with the v0.15 metadata baseline;
- creating a standalone `HIGH-AVAILABILITY-AND-RECOVERY-STANDARD.md`;
- applying a proxy-wide Gate 26 production request boundary;
- certain direct Gate 26 wiring changes to enrollment policy, make-up, completion approval, and quality mutation paths;
- adding additional HA evidence-digest/review/release-binding checks beyond the currently implemented HA status, RTO, RPO, and failover-recency requirements.

These blocked actions must not be represented as completed work.

## Controlled filing baseline

Current private controlled filing artifacts remain:

- LMS Guide DOCX v0.15.
- LMS Guide PDF v0.15, 43 pages.
- Submission Readiness Register v1.5, 6 pages.
- Controlled Pre-Filing Packet v0.15 Live Evidence Only.

Controlled packet ZIP SHA-256: `8dd6774325054141c03d89c4a34ed9dcacf61a739445c2ed196ecc27d5b035a7`.

Curriculum SHA-256: `e76928fefc11a0640f02c80f02af4c2aacbecee39d09f38dbd9776653c2863fd`.

Final examination SHA-256: `240e297682e157221e33ec830bef026e829116ac5f57c5de5565fa244241467e`.

The public-repository `DS-SUBMISSION-LMS-GUIDE-CONTROL.md` still contains older v0.9 metadata because replacement writes were blocked. Its verifier-required Gate 17-19 phrases remain intact. The private controlled v0.15/v1.5 artifact baseline above is the filing-artifact authority until a later controlled revision is issued.

## Permanent production boundary

Production remains **fail closed**. Public regulated enrollment, real learner access, production scheduling, live Class D instruction, production examination access, LIAS production execution, completion/certificate release, observer production access, regulated database promotion, and runtime activation remain disabled until actual Class DS authorization and all final production conditions pass.

No source commit, CI result, UAT result, HA evidence marker, screenshot, filing packet, deployment state, or readiness report is FDACS approval.
