# Gate 28 Regulated Database Performance Handoff

Snapshot: 2026-08-13

## Status

Gate 28 is being implemented on top of exact Gates 1-27 five-green source checkpoint:

`79502264a7c75c80a2d448316720658cfa56154b`

Production remains fail closed. Gate 28 does not apply a production database migration and does not authorize production activation.

## Evidence source

The connected Supabase control plane was inspected read-only.

Main project:

- name: `Obserra Academy`
- project ref: `nwxnyqlyzyufgoadtqxs`
- region: `us-east-1`
- observed state: `ACTIVE_HEALTHY`
- regulated `fdacs_class_d_*` objects present: **zero**

Existing regulated non-production branch:

- branch: `obserra-fdacs-lms-nonprod`
- project ref: `jeklrsratrijrsamdauv`
- parent: `nwxnyqlyzyufgoadtqxs`
- observed state: `ACTIVE_HEALTHY`
- regulated Class D schema: present

This confirms the current production boundary: the main connected project has not been promoted to the Class D schema, while the dedicated non-production branch contains the regulated implementation.

## Migration-history reconciliation

Read-only migration-history comparison identified non-production migration version `20260813204215`, name `fdacs_class_d_security_hardening`, recorded in Supabase but absent from the Git branch.

The database-retained migration statement was recovered from `supabase_migrations.schema_migrations` and independently verified against the resulting database state before being restored to source as:

`supabase/migrations/20260813204215_fdacs_class_d_security_hardening.sql`

The recovered migration:

- pins `search_path = public` for `fdacs_class_d_live_append_only()`;
- pins `search_path = public` for `fdacs_class_d_reject_quality_event_mutation()`;
- pins `search_path = public` for `fdacs_class_d_lias_queue_prepared_event()`;
- revokes execute from `public`, `anon`, and `authenticated` for those three functions;
- grants execute to `service_role`.

Independent catalog verification confirmed all three functions currently have `search_path=public`, no execute privilege for public/anon/authenticated, and execute privilege for service_role.

Restoring this file to Git source does not reapply the migration to non-production and does not change the database. It reconciles migration history so subsequent controlled migrations can be applied without knowingly carrying source/database drift.

Gate 28 CI now requires this security migration to remain present with the verified security controls.

## Performance finding

Supabase performance advisor and direct `pg_catalog` verification identified exactly 20 Florida Class D foreign-key constraints without a covering index.

Gate 28 adds one B-tree covering index for each verified missing foreign-key path:

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

## HA-safe promotion strategy

Supabase documents that ordinary index creation can block writes, while concurrent index creation reduces write blocking. The current Supabase CLI has known pipeline limitations around `CREATE INDEX CONCURRENTLY` replay.

The Class D production database has not been promoted and regulated production traffic remains disabled. Gate 28 therefore creates these indexes as part of controlled pre-activation schema promotion, while there is no regulated learner traffic to disrupt.

The migration uses:

- `lock_timeout = '5s'`
- `statement_timeout = '2min'`
- idempotent `create index if not exists`
- no index deletion
- no table deletion
- no data mutation

If the deployment cannot obtain the required DDL lock within the controlled timeout, the migration must fail rather than waiting indefinitely. Production activation remains blocked until migration and post-migration verification succeed.

## Explicit exclusions

Gate 28 does **not**:

- remove indexes reported as unused in the young non-production environment;
- alter unrelated Academy, Obserrian, owner, or application tables;
- add browser-facing RLS policies merely to silence `RLS Enabled No Policy` INFO findings;
- apply schema changes directly to production outside migration history;
- treat advisor output as production acceptance.

The non-production Class D tables currently grant no table privileges to `PUBLIC`, `anon`, or `authenticated`. This deliberate server/service-role-only fail-closed architecture is preserved.

## Primary artifacts

- `supabase/migrations/20260813204215_fdacs_class_d_security_hardening.sql`
- `supabase/migrations/20260813211000_fdacs_class_d_fk_performance_indexes.sql`
- `scripts/florida-class-d-database-performance-gate.mjs`
- `.github/workflows/florida-class-d-lms-gates.yml`
- `docs/florida-class-d-lms/ACTION-LEDGER.md`

## Validation sequence

1. Validate migration-history parity and the index migration in the repository Gates 1-28 workflow.
2. Apply the committed performance migration only to the existing regulated non-production branch through the controlled Supabase migration channel.
3. Verify all 20 covering indexes exist.
4. Re-run the Supabase performance advisor and direct catalog coverage query.
5. Record the exact non-production migration/evidence result in `ACTION-LEDGER.md`.
6. Do not apply the migration to production until the final production candidate/promotion sequence is authorized.

## Production and regulatory boundary

Gate 28 is a database performance and resilience control. It is not FDACS approval.

No production database promotion, real learner access, live instruction, production examination, LIAS production execution, completion/certificate release, or regulated runtime activation is authorized by this gate.
