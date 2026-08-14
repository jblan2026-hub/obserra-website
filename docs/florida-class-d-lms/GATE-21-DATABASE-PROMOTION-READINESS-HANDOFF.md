# Florida Class D LMS Gate 21 Handoff

## Scope

Gate 21 establishes controlled database-migration promotion readiness for the regulated Florida Class D LMS. It does **not** apply migrations to production and does not activate regulated runtime functions.

## Promotion standard

A regulated database release may proceed only through an authorized change window after all of the following are satisfied:

- the exact migration set is inventoried in deterministic order;
- the target environment and Supabase project are explicitly identified outside the public repository;
- a current backup or verified recovery point exists;
- migration dry-run / preflight review is complete;
- all service-role-only RPC boundaries and direct-browser revocations remain present;
- schema and function changes have a documented rollback or compensating-change plan;
- post-migration verification queries are prepared before execution;
- regulated feature flags remain disabled during migration and verification;
- no learner PII, examination content, LIAS credentials, license numbers, provider secrets, or private identity evidence are placed in migration files or public release evidence;
- the deployment operator records the migration commit SHA, execution time, environment, verifier, outcome, and any exception in the controlled change record.

## Current migration inventory boundary

The Florida Class D workstream currently includes migrations covering regulated records, enrollment, live classroom, attendance reconciliation, observer access, scheduling, live polls, make-up records and certification, recorded make-up playback, final examination, exam-bank administration, exam monitoring, retest governance, completion review, LIAS workflow, completion documents, automatic supplemental completion records, and quality/retention controls.

The public repository contains schema and control definitions only. Production database identifiers, credentials, connection strings, and runtime secrets remain private.

## Preflight controls

Before promotion, the operator must verify:

1. Branch/commit matches the approved release candidate.
2. CI for the complete Florida Class D gate set is green.
3. Database backup / recovery point is confirmed.
4. Migration order is complete and has no duplicate timestamp prefix.
5. Every regulated table uses RLS where designed and direct browser access is denied where designed.
6. SECURITY DEFINER functions use a controlled search path and service-role execution boundary where required.
7. No migration enables public enrollment, instruction, examination, completion, certificate release, LIAS execution, or another regulated production function by itself.
8. Post-migration verification commands are ready before execution.
9. Rollback / compensating-change plan is approved.
10. Change record and operator evidence locations are prepared.

## Post-migration verification

Production promotion is not accepted until controlled verification confirms at minimum:

- expected tables, indexes, triggers, functions, and constraints exist;
- service-only RPC privileges are preserved;
- direct public/anon/authenticated access remains revoked where required;
- append-only audit/event protections remain active;
- regulated feature flags remain disabled;
- a non-production or controlled test identity can exercise permitted administrative health checks without exposing real learner data;
- no certificate can be generated for hours alone and the passing-exam/completion-review boundary remains intact;
- no official FDACS-16103 can be synthesized by Obserra;
- LIAS remains a controlled manual workflow unless a future officially supported integration is separately approved.

## Rollback boundary

Rollback must favor preservation of regulated evidence. Destructive rollback of learner/completion/audit data is prohibited as a default response. Where a schema migration cannot be safely reversed without data loss, use a forward compensating migration and preserve the original regulated records.

## Evidence to retain

The controlled change record should retain:

- release commit SHA;
- migration inventory hash or equivalent immutable reference;
- approver/operator identity;
- execution timestamps;
- target environment identifier;
- backup/recovery-point confirmation;
- preflight result;
- migration result;
- post-migration verification result;
- exceptions/CAPA references if applicable;
- rollback or compensating-change evidence if invoked.

## Release boundary

Gate 21 is a readiness and governance gate only. No production migration is executed by this source change. Public paid enrollment and all regulated runtime features remain fail closed until applicable regulatory authorization, production configuration, database promotion, end-to-end validation, and owner acceptance are complete.
