# Gate 29 Regulated Migration Parity and Promotion Manifest Handoff

Snapshot: 2026-08-13

## Status

Gate 29 is implemented and validated at exact five-green source checkpoint:

`a84c754db81ae805de634dbd74c8745ee8d29714`

Production remains fail closed. Gate 29 does not apply a production database migration and does not authorize production activation.

## Purpose

Gate 29 makes regulated database promotion depend on the exact ordered Class D migration lineage and a deterministic SHA-256 promotion manifest. Schema similarity alone is not sufficient production evidence.

The current verified controlled lineage contains exactly 38 regulated migrations, beginning with `20260813033000_fdacs_class_d_regulated_records.sql` and ending with `20260814215217_fdacs_class_d_owner_uat_live_execution_and_instructor_provisioning.sql`.

## Lineage reconciliation

The first Gate 29 manifest attempt did not reach lineage validation because the `.mjs` generator contained a TypeScript-only `as const` token. Florida Class D LMS Gates run #453 failed at manifest generation with a JavaScript syntax error. That failed run remains audit evidence.

After the parser fix, the manifest generator correctly reported that source contained 30 regulated migration files while the regulated non-production database recorded 29 applied regulated migrations.

Direct source and Supabase history comparison identified exactly one source-only migration:

`20260813112000_fdacs_class_d_security_hardening.sql`

Its executable SQL was semantically identical to the later applied migration:

`20260813204215_fdacs_class_d_security_hardening.sql`

Both pin the same three internal functions to `search_path = public`, revoke execute from `public`, `anon`, and `authenticated`, grant execute to `service_role`, and commit. The earlier file differed only by explanatory comments. It was not referenced by a source gate and was not present in the applied regulated non-production migration history.

The unapplied duplicate was removed from source at commit `bd83c77a9a69a6454a0b03c58da0e1a802ef767e` so a fresh production promotion will follow the same 29-version lineage already verified in non-production rather than executing equivalent hardening twice under different versions.

A later manifest diagnostic identified one expected-filename defect for the make-up certification security migration. The canonical source and regulated non-production history both use:

`20260813052500_fdacs_class_d_makeup_certification_security.sql`

The manifest lineage was corrected to that exact filename before the promotion digest was accepted.

## Deterministic manifest

`scripts/florida-class-d-migration-manifest.mjs`:

- enumerates only `fdacs_class_d` migration files;
- requires the exact expected ordered 38-file lineage;
- fails on missing, extra, reordered, or renamed regulated migrations;
- computes SHA-256 for every migration file from the exact checked-out bytes;
- builds a deterministic canonical JSON manifest;
- computes a SHA-256 digest for the canonical manifest;
- can write the evidence manifest to a workflow artifact;
- prints the migration count, latest version, and manifest digest without exposing credentials or runtime secrets.

The validated deterministic manifest values are:

- migration count: `38`;
- latest migration version: `20260814215217`;
- migration manifest SHA-256: `e44a728ba49b26b51aab2723906e95a08eaba42c5f623a7340ce61ef7d5a1d72`.

The deterministic manifest does not contain learner PII, credentials, license values, protected exam content, or database connection details.

## Production activation binding

Gate 26 production activation now verifies all of the following:

- `OBSERRA_FDACS_DB_PROMOTION_SOURCE_SHA` is a valid Git SHA and exactly matches the frozen production release candidate SHA;
- `OBSERRA_FDACS_DB_APPLIED_MIGRATION_VERSION` exactly equals `20260814215217`;
- `OBSERRA_FDACS_DB_MIGRATION_MANIFEST_SHA256` exactly equals `e44a728ba49b26b51aab2723906e95a08eaba42c5f623a7340ce61ef7d5a1d72`;
- `OBSERRA_FDACS_DB_PROMOTION_STATUS` remains `verified`;
- all other Gate 26 production, licensing, HA, rollback, security, and owner-approval conditions remain satisfied.

This binds production database evidence to the exact validated migration bytes rather than to an operator-entered generic success state.

## Non-production evidence baseline

The regulated non-production branch is:

- branch: `obserra-fdacs-lms-nonprod`;
- project ref: `jeklrsratrijrsamdauv`;
- parent project: `nwxnyqlyzyufgoadtqxs`.

Its applied regulated migration history contains exactly 29 Class D versions, including the recovered security migration `20260813204215` and Gate 28 migration `20260814011203`.

Gate 37 extended the controlled lineage by six forward-only isolated FDACS audit, archival, identity/attendance, investigator-access, performance/explicit-deny, and trigger-function execute-hardening migrations through `20260814175000`. Gate 38 adds the exact-release owner real-identity UAT migration `20260814210337`; independent verification added the instructor-assignment/non-credit scheduling migration `20260814213309` and the assigned-instructor live-execution/encrypted-provisioning migration `20260814215217`. Their provider observations are recorded separately in `FDACS-PII-DATABASE-AUDIT-SOURCE.json`; production runtime authorization remains false. The earlier 29-version non-production snapshot is retained as historical evidence and is not misrepresented as parity with the current 38-file candidate.

Gate 28 post-migration verification found zero Class D foreign-key constraints without a covering index and zero Class D `unindexed_foreign_keys` advisor findings.

The main connected Supabase project remains without any `public.fdacs_class_d_*` objects. Production promotion has not occurred.

## CI evidence

Exact validated source checkpoint:

`a84c754db81ae805de634dbd74c8745ee8d29714`

All five primary workflows are green on that exact SHA:

- Florida Class D LMS Gates #461;
- Website CI #2067;
- Academy 70x Production Gate #1179;
- Application Release Validation #868;
- Application Production Pipeline #887.

Florida Class D LMS Gates #461 passed Gates 1-29, generated and uploaded the retained migration manifest evidence, passed repository contract tests and static quality validation, and completed the production Next.js build successfully.

The manifest artifact is evidence for a specific Git checkout. It is not FDACS approval and is not permission to promote production.

## Promotion evidence requirements

Before any future authorized production database promotion can be marked verified, the controlled evidence must retain:

- exact frozen candidate SHA;
- exact GitHub workflow/run that generated the migration manifest;
- manifest SHA-256;
- latest expected regulated migration version;
- target production database/project identity;
- pre-promotion backup/recovery evidence;
- migration execution result;
- applied migration-history verification;
- post-migration schema/control verification;
- post-migration Class D foreign-key coverage verification;
- rollback or forward-compensating-change status;
- owner/compliance approval state.

## Security boundary

Gate 29 does not expose database credentials or make migration endpoints public. It does not add browser database privileges and does not weaken RLS/service-role isolation.

No production migration is executed by Gate 29 CI.

## Primary artifacts

- `scripts/florida-class-d-migration-manifest.mjs`
- `scripts/florida-class-d-migration-parity-gate.mjs`
- `lib/florida-class-d-production-activation.ts`
- `.github/workflows/florida-class-d-lms-gates.yml`
- `docs/florida-class-d-lms/ACTION-LEDGER.md`

## Production and regulatory boundary

Gate 29 is a software-supply-chain and database-promotion integrity control. It is not FDACS approval.

Production regulated enrollment, learner access, scheduling, instruction, examination, LIAS execution, certificate release, database promotion, and runtime activation remain fail closed until actual Class DS authorization and every final production condition passes.
