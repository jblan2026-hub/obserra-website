# Florida Class D LMS Regulated Action Ledger

Snapshot authority established: 2026-08-13

## Purpose

This is the append-only audit ledger for the regulated Florida Class D LMS workstream for **OBSERRA EXECUTIVE PROTECTION & INTELLIGENCE LLC**.

The controlled handoff set remains `HANDOFF.md`, `LATEST-HANDOFF.md`, `CURRENT-STATUS-2026-08-13.md`, the applicable gate-specific handoff, and `DS-SUBMISSION-LMS-GUIDE-CONTROL.md`. Historical gate language that is also a CI verifier contract must not be rewritten merely to record later actions.

Every material action record must preserve the exact source SHA or external object, result/evidence, workflow identifiers where applicable, security/regulatory impact, production-boundary effect, rollback state, unresolved blockers, and next governed action. Failed and blocked actions remain part of the record and must never be rewritten as successful.

## Validated source checkpoints

### Historical Gates 1-25 handoff checkpoint

Source SHA: `af4247978c3b1b3aaac45ce7e15f321512cbf71c`

Result: exact historical five-green checkpoint and preserved Gates 1-25 handoff verifier contract.

Green workflows:

- Florida Class D LMS Gates #400.
- Website CI #1942.
- Academy 70x Production Gate #1118.
- Application Release Validation #807.
- Application Production Pipeline #826.

Production effect: none. Production remained fail closed.

### Gate 26 and HA five-green checkpoint

Source SHA: `1b6a35bdb289faaa15e5fdc1eb814cd607e65425`

Green workflows:

- Florida Class D LMS Gates #422.
- Website CI #1989.
- Academy 70x Production Gate #1140.
- Application Release Validation #829.
- Application Production Pipeline #848.

Result: Gates 1-26, mandatory high availability, regulated runtime isolation, repository tests, lint/static quality validation, and production Next.js build passed on the exact SHA.

Security/regulatory effect: Gate 26 and HA became CI-accepted source/build controls. This was not FDACS approval, production database promotion, production acceptance, or launch authorization.

Production effect: none. Production regulated functions remained fail closed.

### Gate 27 resilience and observability five-green checkpoint

Source SHA: `79502264a7c75c80a2d448316720658cfa56154b`

Green workflows:

- Florida Class D LMS Gates #436.
- Website CI #2017.
- Academy 70x Production Gate #1154.
- Application Release Validation #843.
- Application Production Pipeline #862.

Result: Gates 1-27 passed, including liveness/readiness/HA/activation separation, repository tests, lint/static quality validation, and the production Next.js build.

Security/regulatory effect: Gate 27 distinguishes application liveness, technical readiness, high availability, production activation authorization, and regulatory approval. Public health responses are minimal. Detailed resilience state is staff protected and non-cacheable.

Production effect: none. No production Class D database promotion, real-learner acceptance, or regulated production activation occurred.

### Gate 28 database performance five-green checkpoint

Source SHA: `595465a76675693fdcc1b5e5d9a14269a7ccbdfd`

Green workflows on this exact SHA:

- Florida Class D LMS Gates #448.
- Website CI #2041.
- Academy 70x Production Gate #1166.
- Application Release Validation #855.
- Application Production Pipeline #874.

Florida Class D LMS Gates #448 passed Gates 1-28, Gate 22 runtime readiness, Gate 23 acceptance-evidence verification, Gate 24 text-screen timing, Gate 25 runtime-isolation enforcement, Gate 26 production activation, Gate 27 resilience/observability, Gate 28 database-performance verification, repository contract tests, lint/static quality validation, and the production Next.js build.

Application Production Pipeline #874 completed successfully, including the final signed-artifact publication contract.

Security/regulatory effect: Gate 28 became the exact current validated source/build checkpoint. It preserves migration-history parity for the recovered Class D security migration and validates the 20 source-controlled foreign-key support indexes.

Production effect: none. The main Supabase project remains without the Class D schema. No production Class D database promotion or production activation occurred.

Rollback state: Git source remains reversible through normal repository history. The Gate 28 database change described below was applied only to the regulated non-production branch.

Next governed action: establish a controlled migration-lineage and promotion-manifest gate so any future production promotion is bound to the exact validated migration sequence and source digest.

## Gate 26 implementation history

- `0e56b2a5dbea4974565c90ff71e0fa8f01c27be2`: introduced the server-only Gate 26 production-activation module.
- `a1b345282f5a3e98c1cf9559188b001f0f35bd5f`: bound production live instruction to Gate 26.
- `96f53288d1fc5c7f614d11d671cc2dc5f2903c41`: bound production scheduling to Gate 26.
- `a046d450d1d2f5bf00510c5f6816febc893347ff`: added the protected Gate 26 staff console.
- `97922d7a3adb7dd64e1179e754ec8f507fe5a3e1`: bound regulated learner enrollment API execution to Gate 26.
- `f0600bcd2ba66cfbbf6673256b1d7e1e747a4f62`: bound student final-examination API execution to Gate 26.
- `fc48865b8383c80ea1ccfa399ab63d6dbef42286`: expanded Gate 22 to the complete known regulated activation-flag inventory.
- `d91486d54b4e0b8223708386b9913109e774a703`: added the Gate 26 source verifier.
- `92d2d66ce9bdafd7be7c00c5ed92fa845c11d5b5`: made Gate 26 mandatory in the dedicated Class D workflow.
- `f7757d9e76d7ddb6fce1c70c4dd3b60061e2771f`: made high availability mandatory across the complete production service chain and added RTO/RPO/failover-recency requirements.
- `ff6d1d5a99fd6a0f5d3f5dda1ec1e7b38f4e1d23`: bound LIAS administration to shared regulated execution authorization.
- `e9d908b5c1f2c173a5ba3839faab459c0c4ca90e`: bound official completion-document ingestion to shared regulated execution authorization.
- `1b6a35bdb289faaa15e5fdc1eb814cd607e65425`: exact Gate 26 five-green checkpoint.

## Gate 27 implementation history

- `e054470cb5fb24a155d36047d4d90b7522a53ad8`: added the resilience state model.
- `65042160b8fc8503a675ace8cccb8f8d9ad85670`: added the minimal public liveness endpoint.
- `8572aa57d5c3feb78185079451021274aedc0dcc`: added the minimal public readiness endpoint with HTTP 503 on degraded readiness.
- `f0026977113c9b11d6a3281192dfd1965029fef9`: added the protected resilience API.
- `05ab1ae81f6dad78cf85ad2577fa5e4d7bab0062`: added the protected staff resilience console.
- `cdf449757569372162369220fec200a27f1c3f62`: added the Gate 27 handoff.
- `f3f345f9a8db9228d83c6c718ff3c2d654734be`: added the Gate 27 source verifier.
- `337dcd6c3a86ac77736836941d24c00dc417febe`: first Gate 27 workflow head. Class D run #435 failed before Gate 27 because Gate 26 handoff formatting interrupted required RTO/RPO literals.
- `79502264a7c75c80a2d448316720658cfa56154b`: restored the exact Gate 26 literals and became the Gates 1-27 five-green checkpoint.

## Gate 28 implementation and database evidence

### Initial source hardening

The Supabase performance advisor and direct PostgreSQL catalog verification identified exactly 20 Florida Class D foreign-key constraints without a covering index.

Gate 28 added controlled indexes for:

1. `fdacs_class_d_acceptance_events(run_id)`
2. `fdacs_class_d_completion_records(passed_exam_attempt_id)`
3. `fdacs_class_d_exam_attempts(bank_id)`
4. `fdacs_class_d_exam_attempts(retest_authorization_id)`
5. `fdacs_class_d_exam_responses(question_id)`
6. `fdacs_class_d_exam_retest_authorizations(consumed_by_attempt_id)`
7. `fdacs_class_d_lias_workflow_events(completion_record_id)`
8. `fdacs_class_d_live_interactions(parent_interaction_id)`
9. `fdacs_class_d_live_poll_responses(enrollment_id)`
10. `fdacs_class_d_live_text_screen_views(device_lease_id)`
11. `fdacs_class_d_live_text_screen_views(enrollment_id)`
12. `fdacs_class_d_live_time_totals(live_session_id)`
13. `fdacs_class_d_makeup_assignments(source_live_session_id)`
14. `fdacs_class_d_makeup_questions(enrollment_id)`
15. `fdacs_class_d_presence_challenges(live_session_id)`
16. `fdacs_class_d_quality_case_events(enrollment_id)`
17. `fdacs_class_d_quality_cases(cohort_id)`
18. `fdacs_class_d_recorded_playback_challenges(assignment_id)`
19. `fdacs_class_d_recorded_playback_challenges(enrollment_id)`
20. `fdacs_class_d_retention_reviews(completion_record_id)`

The migration uses `lock_timeout = '5s'`, `statement_timeout = '2min'`, idempotent `create index if not exists`, and performs no data mutation or destructive operation.

### Non-production migration-history drift and recovery

Read-only migration-history verification found Supabase non-production migration version `20260813204215`, name `fdacs_class_d_security_hardening`, already applied to the regulated branch but absent from Git.

The exact SQL was recovered from `supabase_migrations.schema_migrations`, independently verified against the database state, and restored to source as:

`supabase/migrations/20260813204215_fdacs_class_d_security_hardening.sql`

Verified effects:

- `search_path=public` on `fdacs_class_d_live_append_only()`;
- `search_path=public` on `fdacs_class_d_reject_quality_event_mutation()`;
- `search_path=public` on `fdacs_class_d_lias_queue_prepared_event()`;
- no execute privilege for `public`, `anon`, or `authenticated` on those three functions;
- execute privilege retained for `service_role`.

Source restoration commit: `7fb3221491922083f5154bf3af0978015371049f`.

Production effect: none. This was source-history reconciliation only.

### Gate 28 non-production application

Validated source before controlled application: `2c47678a741b4b635bc00990fe4a1678642bbf0b`.

Florida Class D LMS Gates #444 passed Gates 1-28, repository tests, lint/static quality validation, and the production build on that source state before the remote migration version was reconciled into the Git filename.

Target external object: Supabase branch `obserra-fdacs-lms-nonprod`, project ref `jeklrsratrijrsamdauv`.

Pre-application verification:

- branch state: `ACTIVE_HEALTHY`;
- zero active non-idle database sessions;
- zero open transactions;
- regulated target tables essentially empty except retained synthetic acceptance evidence;
- main project untouched.

Applied migration name: `fdacs_class_d_fk_performance_indexes`.

Supabase application result: **success**.

Supabase-recorded migration version: `20260814011203`.

Canonical source file after reconciliation:

`supabase/migrations/20260814011203_fdacs_class_d_fk_performance_indexes.sql`

Post-application direct catalog verification: **zero** Florida Class D foreign-key constraints remain without a covering index.

Post-application Supabase performance advisor: **zero** Florida Class D `unindexed_foreign_keys` findings.

Remaining advisor findings are unrelated Academy/Application/Obserrian objects outside this regulated workstream. New Gate 28 indexes may appear as `unused_index` INFO findings because the non-production branch has negligible workload. Those INFO findings are not a basis for removing the new FK support indexes.

The canonical migration version, Gate 28 verifier, and post-application handoff were validated together at exact five-green checkpoint `595465a76675693fdcc1b5e5d9a14269a7ccbdfd`.

Production effect: none. Gate 28 was applied only to the regulated non-production branch. The main project received no Class D migration.

Rollback state: because the non-production branch has no production learners and negligible regulated workload, the indexes are isolated to non-production. Source rollback remains available through Git. No production rollback action is required because production was untouched.

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

Controlled engineering ceilings enforced in source:

- RTO: 60 minutes or less.
- RPO: 15 minutes or less.
- End-to-end failover exercise: no older than 90 days at production activation.

Passing HA markers require authentic retained evidence. Vendor marketing statements alone are not sufficient verification.

## Supabase control-plane verification

### Main project

External object: Supabase project `nwxnyqlyzyufgoadtqxs`, name **Obserra Academy**, region `us-east-1`.

Observed state: `ACTIVE_HEALTHY`.

Direct schema result: zero `public.fdacs_class_d_*` objects exist in the main project.

Interpretation: the connected main project is not presently a promoted Florida Class D runtime database. Production Class D database promotion has not occurred.

Production effect: none.

### Existing regulated non-production branch

External object: Supabase branch `obserra-fdacs-lms-nonprod`, project ref `jeklrsratrijrsamdauv`, parent `nwxnyqlyzyufgoadtqxs`.

Observed state: persistent and `ACTIVE_HEALTHY`.

Regulated Class D tables, functions, views, migrations, and acceptance artifacts are present.

This branch is the actual regulated non-production database environment and must not be represented as production.

### Historical Gate 23 UAT verification

Read-only verification found one prior acceptance run:

- run id: `8c973b1d-7a75-4c0f-8936-ad94c1e3d7a9`;
- environment: `uat`;
- release SHA: `10779bc31a86caa1b54721f7a8ca4c9930a9ad61`;
- synthetic identity confirmed: true;
- status: passed;
- required checks: 18;
- passed checks: 18;
- non-passed checks: 0.

This independently verifies the historical 18-of-18 UAT record. Because source advanced, it does not satisfy final candidate-bound Gate 23 acceptance.

### Non-production access-control verification

Supabase security advisor reports INFO-level `RLS Enabled No Policy` findings on regulated Class D tables.

Direct privilege verification found zero table privileges for `PUBLIC`, `anon`, or `authenticated` on any `public.fdacs_class_d_*` table.

Interpretation: the findings are consistent with the deliberate server/service-role-only fail-closed architecture. No browser RLS policies were added merely to silence the advisor.

A `PUBLIC EXECUTE` grant was observed on `fdacs_class_d_reject_lias_workflow_mutation`. Inspection confirmed it is a non-security-definer trigger function returning `trigger`, not a regulated browser data API.

## 2026-08-15 controlled non-production LMS atomic-start rehearsal

Candidate source revision: `e289a85b7d88bb26e4994dd6c7084799c6a5fbdc`.

Controlled external objects:

- temporary Supabase branch: `353b2ad4-0d2b-43e3-81e3-5f30f91767f1`;
- temporary Supabase project reference: `iuosbfwbfdhernyquvxq`;
- approved temporary branch rate: `$0.01344/hour`;
- production project observed unchanged: `ggkx…` (identifier intentionally minimized in public evidence).

Exact migration inputs:

- `20260815160000_fdacs_class_d_identity_video_lobby_assignment.sql`, SHA-256 `c6cf9b977d4ac38c0e9d4ad55c6d2bad42f6aa42879b629519b9ea083b551dd6`;
- `20260815170000_fdacs_class_d_atomic_initial_presence_start.sql`, SHA-256 `ccb9256168711a26de3e375edfb82d85001871e302c76dc6f35a0367a68b1765`.

Result and evidence:

- both exact migrations applied successfully to the temporary branch only;
- the exact trigger, `SECURITY DEFINER` function with an empty `search_path`, and service-role-only atomic RPC were verified;
- the superseded RPC and browser-role execution remained denied;
- an incorrect Class DI assignment was rejected and the correct assigned Class DI was accepted;
- an injected post-break fault rolled back the complete transaction;
- the successful path issued exactly one security challenge before instruction began;
- all synthetic rehearsal fixtures were rolled back to zero;
- the security advisor reported only two pre-existing INFO-level RLS-without-policy findings on CMMC archive tables and no new warning or error;
- the performance advisor reported only unused-index INFO findings expected on the empty temporary branch.

Rollback and cost state: the temporary branch was deleted successfully after verification. No rehearsal object or fixture persisted and the temporary branch cost stopped.

Security/regulatory effect: this is non-production technical rehearsal evidence only. It does not establish FDACS approval, provider or course authorization, production database promotion, real-learner acceptance, production readiness, or authorization to issue course credit, completion documents, certificates, or LIAS records.

Production effect: none. The two migrations remain absent from production, production authorization remains false, Preview UAT remains non-credit, and enrollment, completion, certificate release, and LIAS execution remain disabled.

Next governed action: retain this result with the exact release evidence, then complete the still-pending production migration approval, authentic licensing evidence, exact-candidate owner UAT, provider readiness, security acceptance, rollback acceptance, and explicit production authorization before any activation.

## Failed and blocked actions retained for audit

### Florida Class D LMS Gates #403

Source SHA: `89a408b618fabe5741fbf857d9e3e9939ea1aa69`.

Result: failed because `HANDOFF.md` lost the Gate 2 verifier-required `### Gates 1-4` heading during documentation synchronization. Four other primary workflows passed. The handoff contract was repaired.

### Florida Class D LMS Gates #415

Source SHA: `5e702fe1c27a4149cc1eb8a2383a8a56108dde42`.

Result: failed before Gate 26 execution because `HANDOFF.md` had lost the Gate 3 verifier-required literal `durable Supabase persistence/admin APIs`. Gate 26 and later steps were skipped. The historical five-green handoff contract was restored.

### Florida Class D LMS Gates #435

Source SHA: `337dcd6c3a86ac77736836941d24c00dc417febe`.

Result: failed in Gate 26 before Gate 27 because documentation formatting interrupted the verifier-required literals `RTO of 60 minutes or less` and `RPO of 15 minutes or less`. No Gate 26 implementation logic failed. The literals were restored and later validation passed.

### Repository write-safety blocks

The following attempted repository writes were rejected before changing GitHub and therefore are not implemented:

- replacing `DS-SUBMISSION-LMS-GUIDE-CONTROL.md` with the v0.15 metadata baseline;
- creating a standalone `HIGH-AVAILABILITY-AND-RECOVERY-STANDARD.md`;
- applying a proxy-wide Gate 26 production request boundary;
- certain direct Gate 26 wiring changes to enrollment policy, make-up, completion approval, and quality mutation paths;
- adding additional HA evidence-digest/review/release-binding checks beyond the implemented HA status, RTO, RPO, and failover-recency requirements.

Blocked actions must not be represented as completed work.

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

No source commit, CI result, UAT result, HA evidence marker, screenshot, filing packet, deployment state, database advisor result, or readiness report is FDACS approval.
