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

Result: exact five-green source checkpoint for Gates 1 through 26, mandatory high availability, regulated runtime isolation, source/build validation, and the production application build.

Green workflows on this exact SHA:

- Florida Class D LMS Gates #422.
- Website CI #1989.
- Academy 70x Production Gate #1140.
- Application Release Validation #829.
- Application Production Pipeline #848.

Security/regulatory effect: Gate 26 and HA are CI-accepted source/build controls. This is not FDACS approval, production database promotion, production acceptance, or launch authorization.

Production effect: none. Production regulated functions remained fail closed.

### 2026-08-13 Gate 27 resilience and observability five-green checkpoint

Source SHA: `79502264a7c75c80a2d448316720658cfa56154b`

Result: exact current five-green source checkpoint for Gates 1 through 27, including liveness/readiness/HA/activation-state separation and protected resilience visibility.

Green workflows on this exact SHA:

- Florida Class D LMS Gates #436.
- Website CI #2017.
- Academy 70x Production Gate #1154.
- Application Release Validation #843.
- Application Production Pipeline #862.

Florida Class D LMS Gates #436 passed the complete regulated Gates 1-27 source chain, Gate 22 runtime readiness, Gate 23 acceptance-evidence verification, Gate 24 text-screen verification, Gate 25 runtime-isolation enforcement, Gate 26 production-activation verification, Gate 27 resilience/observability verification, repository contract tests, lint/static quality validation, and the production Next.js build.

Security/regulatory effect: Gate 27 distinguishes application liveness, technical readiness, HA, production activation authorization, and regulatory approval. Public health responses are intentionally minimal; detailed resilience state remains staff protected and non-cacheable.

Production effect: none. No production Class D database promotion, no real-learner acceptance, and no regulated production activation occurred.

Rollback state: source can be reverted through normal Git history. No production regulated runtime or database state was changed by Gate 27.

Next governed action: use actual non-production database evidence to harden regulated database performance and resilience in source before the final production candidate is frozen.

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
- `1b6a35bdb289faaa15e5fdc1eb814cd607e65425`: exact Gate 26 five-green checkpoint.

## Gate 27 implementation history

- `e054470cb5fb24a155d36047d4d90b7522a53ad8`: added the resilience state model.
- `65042160b8fc8503a675ace8cccb8f8d9ad85670`: added the minimal public liveness endpoint.
- `8572aa57d5c3feb78185079451021274aedc0dcc`: added the minimal public readiness endpoint with HTTP 503 on degraded readiness.
- `f0026977113c9b11d6a3281192dfd1965029fef9`: added the protected resilience API.
- `05ab1ae81f6dad78cf85ad2577fa5e4d7bab0062`: added the protected staff resilience console.
- `cdf449757569372162369220fec200a27f1c3f62`: added the Gate 27 handoff.
- `f3f345f9a8db9228d83c6c718ff3c2d654734be`: added the Gate 27 source verifier.
- `337dcd6c3a86ac77736836941d24c00dc417febe`: first Gate 27 workflow head; run #435 failed before Gate 27 because Gate 26 handoff formatting broke required RTO/RPO literals.
- `79502264a7c75c80a2d448316720658cfa56154b`: restored Gate 26 verifier literals and became the exact Gates 1-27 five-green checkpoint.

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

## Supabase control-plane verification

### Main project

External object: Supabase project `nwxnyqlyzyufgoadtqxs`, name **Obserra Academy**, region `us-east-1`.

Observed state: `ACTIVE_HEALTHY`.

Read-only schema result: zero `public.fdacs_class_d_*` objects exist in the main project.

Interpretation: the connected main project is not presently a promoted Florida Class D runtime database. This directly supports the existing fail-closed handoff statement that no production Class D database promotion has occurred.

Production effect: none. No schema or data changes were made.

### Existing regulated non-production branch

External object: Supabase branch `obserra-fdacs-lms-nonprod`, project ref `jeklrsratrijrsamdauv`, parent `nwxnyqlyzyufgoadtqxs`.

Observed state: persistent and `ACTIVE_HEALTHY`.

Read-only schema result: regulated `fdacs_class_d_*` tables, functions, views, and acceptance artifacts are present.

This branch is the actual regulated non-production database environment. It must not be represented as production.

### Historical Gate 23 UAT verification

Read-only acceptance query found exactly one prior acceptance run:

- run id: `8c973b1d-7a75-4c0f-8936-ad94c1e3d7a9`;
- environment: `uat`;
- release SHA: `10779bc31a86caa1b54721f7a8ca4c9930a9ad61`;
- synthetic identity confirmed: true;
- status: passed;
- required checks: 18;
- passed checks: 18;
- non-passed checks: 0.

This independently verifies the historical handoff statement that a real synthetic Gate 23 UAT run passed 18 of 18 domains on `10779bc...`.

Because source advanced, this UAT does not satisfy final candidate-bound Gate 23 acceptance.

### Non-production database access controls

Supabase security advisor reported INFO-level `RLS Enabled No Policy` findings on regulated Class D tables.

Direct privilege verification found zero table privileges for `PUBLIC`, `anon`, or `authenticated` on any `public.fdacs_class_d_*` table.

Interpretation: the RLS-no-policy findings are consistent with the deliberate server/service-role-only fail-closed architecture and are not evidence that browser access should be added. No browser RLS policies were created merely to silence the advisor.

One `PUBLIC EXECUTE` routine grant was found for `fdacs_class_d_reject_lias_workflow_mutation`; read-only inspection confirmed it is a non-security-definer trigger function returning `trigger`, not a regulated browser data API.

### Non-production performance advisor

Supabase performance advisor identified 20 Class D foreign-key constraints without covering indexes. Exact read-only catalog verification confirmed the missing covering indexes for:

- `fdacs_class_d_acceptance_events(run_id)`
- `fdacs_class_d_completion_records(passed_exam_attempt_id)`
- `fdacs_class_d_exam_attempts(bank_id)`
- `fdacs_class_d_exam_attempts(retest_authorization_id)`
- `fdacs_class_d_exam_responses(question_id)`
- `fdacs_class_d_exam_retest_authorizations(consumed_by_attempt_id)`
- `fdacs_class_d_lias_workflow_events(completion_record_id)`
- `fdacs_class_d_live_interactions(parent_interaction_id)`
- `fdacs_class_d_live_poll_responses(enrollment_id)`
- `fdacs_class_d_live_text_screen_views(device_lease_id)`
- `fdacs_class_d_live_text_screen_views(enrollment_id)`
- `fdacs_class_d_live_time_totals(live_session_id)`
- `fdacs_class_d_makeup_assignments(source_live_session_id)`
- `fdacs_class_d_makeup_questions(enrollment_id)`
- `fdacs_class_d_presence_challenges(live_session_id)`
- `fdacs_class_d_quality_case_events(enrollment_id)`
- `fdacs_class_d_quality_cases(cohort_id)`
- `fdacs_class_d_recorded_playback_challenges(assignment_id)`
- `fdacs_class_d_recorded_playback_challenges(enrollment_id)`
- `fdacs_class_d_retention_reviews(completion_record_id)`

These are the authoritative inputs for the next source-level database performance hardening milestone. No direct database index changes were made during verification.

Unused-index INFO findings are not a basis for removal because the branch is young/non-production and lacks representative production workload. Duplicate-index WARN findings observed by the advisor were on unrelated Academy/Obserrian/owner tables and are outside this Class D workstream.

## Failed and blocked actions retained for audit

### Florida Class D LMS Gates #403

Source SHA: `89a408b618fabe5741fbf857d9e3e9939ea1aa69`.

Result: failed because `HANDOFF.md` lost the Gate 2 verifier-required `### Gates 1-4` heading during documentation synchronization. Four other primary workflows passed. The failure was retained and the handoff contract was repaired.

### Florida Class D LMS Gates #415

Source SHA: `5e702fe1c27a4149cc1eb8a2383a8a56108dde42`.

Result: failed before Gate 26 execution because `HANDOFF.md` had lost the Gate 3 verifier-required literal `durable Supabase persistence/admin APIs`. Gate 26 and later steps were skipped. The historical five-green handoff contract was restored and the later exact checkpoint `1b6a35...` passed Gates 1-26.

### Florida Class D LMS Gates #435

Source SHA: `337dcd6c3a86ac77736836941d24c00dc417febe`.

Result: failed in Gate 26 before Gate 27 because documentation formatting interrupted the verifier-required literals `RTO of 60 minutes or less` and `RPO of 15 minutes or less`. No Gate 26 implementation logic failed. The literals were restored and exact SHA `79502264...` later passed Gates 1-27 and all five primary workflows.

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
